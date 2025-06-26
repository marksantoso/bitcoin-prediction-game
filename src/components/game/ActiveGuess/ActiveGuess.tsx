"use client"
import { useRef, useEffect, useState, useCallback } from "react"
import { Card, CardContent } from "@/ui"
import { formatTime } from "@/utils/formatTime"
import { formatPrice } from "@/utils/formatPrice"
import { GAME_CONFIG } from "@/config/game"
import { useResolveGuess } from "@/hooks/bitcoin/useBitcoinData"
import { IGuess, IBitcoinPrice } from "@/types/bitcoin.dto"
import GuessHeader from "./GuessHeader/GuessHeader"
import PredictionChip from "./PredictionChip/PredictionChip"
import ProgressBar from "./ProgressBar/ProgressBar"
import styles from "./ActiveGuess.module.css"

interface ActiveGuessDisplayProps {
  activeGuess: IGuess
  currentPrice: IBitcoinPrice | undefined
  userId: string
}

export default function ActiveGuessDisplay({
  activeGuess,
  currentPrice,
  userId
}: ActiveGuessDisplayProps) {
  const [remainingMs, setRemainingMs] = useState<number>(60)
  const [progressWidth, setProgressWidth] = useState<number>(0)
  const [predictionStatus, setPredictionStatus] = useState<string | null>(null)
  const [isCompleted, setIsCompleted] = useState<boolean>(false)
  const timeRemainingRef = useRef<HTMLParagraphElement>(null)
  const hasStartedResolvingRef = useRef<boolean>(false)
  const resolveGuessMutation = useResolveGuess()

  const getPredictionStatus = () => {
    if (!currentPrice || (currentPrice.price === activeGuess.startPrice)) {
      setPredictionStatus(null)
      return
    }

    const priceIsHigher = currentPrice.price > activeGuess.startPrice
    const predictedUp = activeGuess.direction === "up"

    setPredictionStatus(priceIsHigher === predictedUp ? "correct" : "incorrect")
  }

  const updateTimeDisplay = useCallback(() => {
    if (!activeGuess?.expiresAt || !timeRemainingRef.current) return

    const expiresAtMs = activeGuess.expiresAt * 1000
    const currentTimeMs = Date.now()
    const remaining = Math.max(0, expiresAtMs - currentTimeMs)
    setRemainingMs(remaining)
    const progress = (remaining / GAME_CONFIG.guessInterval) * 100
    setProgressWidth(Math.min(100, Math.max(0, progress)))

    if (timeRemainingRef.current) timeRemainingRef.current.textContent = formatTime(remaining)

    if (remaining <= 0 && !activeGuess.resolved && !hasStartedResolvingRef.current && currentPrice && (currentPrice.price !== activeGuess.startPrice)) {
      hasStartedResolvingRef.current = true
      resolveGuessMutation.mutate({
        userId,
        guessId: activeGuess.id,
        currentPrice: currentPrice.price,
        startPrice: activeGuess.startPrice,
        direction: activeGuess.direction,
      })
      setPredictionStatus(null)
      setIsCompleted(true)
    }
  }, [
    activeGuess,
    currentPrice,
    formatTime,
    resolveGuessMutation,
    setIsCompleted,
    setPredictionStatus,
    setProgressWidth,
    setRemainingMs,
    timeRemainingRef,
    userId
  ])

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
    hasStartedResolvingRef.current = false
  }, [activeGuess?.id])

  useEffect(() => {
    getPredictionStatus()
  }, [currentPrice, activeGuess.startPrice, activeGuess.direction])

  const showWaitingMessage = (currentPrice?.price == activeGuess.startPrice) && (remainingMs == 0)

  return (
    <Card className={styles.activeGuessCard}>
      <GuessHeader isResolving={resolveGuessMutation.isPending} />
      <CardContent className={styles.activeGuessContent}>
        <div className={styles.predictionRow}>
          <div>
            <p className={styles.predictionLabel}>You predicted:</p>
            <PredictionChip direction={activeGuess.direction} />
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