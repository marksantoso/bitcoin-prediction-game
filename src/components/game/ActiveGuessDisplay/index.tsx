"use client"

import { useRef, useEffect, useState, useCallback, memo, useMemo } from "react"
import { Chip, Card, CardHeader, CardContent } from '@/ui'
import { TrendingUp, TrendingDown, Clock } from "lucide-react"
import { useBitcoinUtils } from "@/hooks/bitcoin/useBitcoinUtils"
import { useResolveGuess } from "@/hooks/bitcoin/useBitcoinData"
import { IGuess, IBitcoinPrice } from "@/types/bitcoin.dto"
import styles from "./ActiveGuessDisplay.module.css"

interface ActiveGuessDisplayProps {
  activeGuess: IGuess
  currentPrice: IBitcoinPrice | undefined
  userId: string
}

interface PredictionChipProps {
  direction: 'up' | 'down'
}

interface ProgressBarProps {
  progressWidth: number
  startPrice: number
  currentPrice: number | undefined
  predictionStatus: string | null
  isCompleted: boolean
  formatPrice: (price: number) => string
}

interface HeaderProps {
  isResolving: boolean
}

function PredictionChip({ direction }: PredictionChipProps) {
  const Icon = direction === 'up' ? TrendingUp : TrendingDown

  function getChipClassNames() {
    return `${styles.predictionChip} ${direction === "up" ? styles.predictionChipDown : styles.predictionChipUp}`
  }

  const chipClassNames = useMemo(getChipClassNames, [direction])

  return (
    <Chip
      label={
        <span className={styles.chipContent}>
          <Icon className={styles.chipIcon} />
          Price will go {direction.toUpperCase()}
        </span>
      }
      variant={direction === "up" ? "primary" : "secondary"}
      className={chipClassNames}
    />
  )
}

const MemoizedPredictionChip = memo(PredictionChip)

function GuessHeader({ isResolving }: HeaderProps) {
  return (
    <CardHeader
      className={styles.activeGuessHeader}
      title={
        <div className={styles.activeGuessTitle}>
          <Clock className={styles.clockIcon} />
          Active Prediction
          {isResolving && <span className={styles.resolvingText}>(Resolving...)</span>}
        </div>
      }
    />
  )
}

const MemoizedGuessHeader = memo(GuessHeader)

function ProgressBar({
  progressWidth,
  startPrice,
  currentPrice,
  predictionStatus,
  formatPrice
}: ProgressBarProps) {
  const barClassNames = useMemo(() => {
    return `${styles.startingPrice} ${(currentPrice ?? 0) > startPrice ? styles.progressBarUp : ''} ${(currentPrice ?? 0) < startPrice ? styles.progressBarDown : ''} `
  }, [currentPrice, startPrice])

  const formattedPrice = useMemo(() => formatPrice(startPrice), [formatPrice, startPrice])

  return (
    <div className={barClassNames}>
      <div
        className={`${styles.progressBar}`}
        style={{ width: `${100 - progressWidth}%` }}
      />
      {predictionStatus === null && <span>😐</span>}
      {predictionStatus === "correct" && <span>😃</span>}
      {predictionStatus === "incorrect" && <span>😥</span>}

      <span className={styles.progressText}>Starting price: {formattedPrice}</span>
    </div>
  )
}

export default function ActiveGuessDisplay({
  activeGuess,
  currentPrice,
  userId
}: ActiveGuessDisplayProps) {
  const { formatTime, formatPrice } = useBitcoinUtils()
  const [remainingMs, setRemainingMs] = useState<number>(60)
  const [progressWidth, setProgressWidth] = useState<number>(0)
  const [predictionStatus, setPredictionStatus] = useState<string | null>(null)
  const [isCompleted, setIsCompleted] = useState<boolean>(false)
  const [isResolving, setIsResolving] = useState<boolean>(false)
  const timeRemainingRef = useRef<HTMLParagraphElement>(null)
  const resolveGuessMutation = useResolveGuess()

  const getPredictionStatus = useCallback(() => {
    if (!currentPrice || (currentPrice.price === activeGuess.startPrice)) {
      setPredictionStatus(null)
      return
    }

    const priceIsHigher = currentPrice.price > activeGuess.startPrice
    const predictedUp = activeGuess.direction === "up"

    // If prediction matches the price movement, it's correct
    setPredictionStatus(priceIsHigher === predictedUp ? "correct" : "incorrect")
  }, [currentPrice, activeGuess.startPrice, activeGuess.direction])

  const updateTimeDisplay = useCallback(() => {
    if (!activeGuess?.expiresAt || !timeRemainingRef.current) return

    const expiresAtMs = activeGuess.expiresAt * 1000
    const currentTimeMs = Date.now()
    const remaining = Math.max(0, expiresAtMs - currentTimeMs)
    setRemainingMs(remaining)

    const progress = (remaining / 60000) * 100
    setProgressWidth(Math.min(100, Math.max(0, progress)))

    if (timeRemainingRef.current) {
      timeRemainingRef.current.textContent = formatTime(remaining)
    }

    if (remaining <= 0 && !activeGuess.resolved && !isResolving && currentPrice && (currentPrice.price !== activeGuess.startPrice)) {
      setIsResolving(true)
      resolveGuessMutation.mutate({
        userId,
        guessId: activeGuess.id,
        currentPrice: currentPrice.price,
      })
      setPredictionStatus(null)
      setIsCompleted(true)
    }
  }, [activeGuess, timeRemainingRef, formatTime, isResolving, currentPrice, resolveGuessMutation, userId])

  useEffect(() => {
    if (!activeGuess?.expiresAt || !timeRemainingRef.current) {
      return
    }

    updateTimeDisplay()

    const interval = setInterval(() => {
      updateTimeDisplay()
    }, 1000)

    return () => {
      clearInterval(interval)
    }
  }, [updateTimeDisplay, activeGuess?.expiresAt])

  useEffect(() => {
    setIsResolving(false)
  }, [activeGuess?.id])

  useEffect(() => {
    getPredictionStatus()
  }, [getPredictionStatus])

  const showWaitingMessage = useMemo(() => {
    return (currentPrice?.price == activeGuess.startPrice) && (remainingMs == 0)
  }, [currentPrice?.price, activeGuess.startPrice, remainingMs])

  return (
    <Card className={styles.activeGuessCard}>
      <MemoizedGuessHeader isResolving={resolveGuessMutation.isPending} />
      <CardContent className={styles.activeGuessContent}>
        <div className={styles.predictionRow}>
          <div>
            <p className={styles.predictionLabel}>You predicted:</p>
            <MemoizedPredictionChip direction={activeGuess.direction} />
          </div>
          <div className={styles.timeRemaining}>
            <p className={styles.predictionLabel}>Time remaining:</p>
            <p className={styles.timeValue} ref={timeRemainingRef}></p>
            {showWaitingMessage &&
              <p className={styles.waitingPriceChange}>Waiting for price change</p>
            }
          </div>
        </div>
        <ProgressBar
          progressWidth={progressWidth}
          startPrice={activeGuess.startPrice}
          currentPrice={currentPrice?.price}
          predictionStatus={predictionStatus}
          isCompleted={isCompleted}
          formatPrice={formatPrice}
        />
      </CardContent>
    </Card>
  )
} 