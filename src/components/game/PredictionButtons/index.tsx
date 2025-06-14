"use client"
import { useState, useCallback, memo, useMemo } from 'react'
import { Card, Button, CardContent, CardHeader } from '@/ui'
import { TrendingUp, TrendingDown } from "lucide-react"
import { useMakeGuess } from "@/hooks/bitcoin/useBitcoinData"
import { IBitcoinPrice } from "@/types/bitcoin.dto"
import styles from "./PredictionButtons.module.css"

interface PredictionButtonsProps {
  currentPrice: IBitcoinPrice | undefined
  userId: string | null
  isLoading: boolean
}

interface PredictionButtonProps {
  direction: 'up' | 'down'
  onClick: (direction: 'up' | 'down') => void
  isLoading: boolean
  isPending: boolean
  currentDirection: 'up' | 'down' | null
  disabled: boolean
}

function PredictionCardHeader() {
  return (
    <CardHeader
      title="Make Your Prediction"
      subheader="Will Bitcoin's price be higher or lower in 60 seconds?"
    />
  )
}

const MemoizedPredictionCardHeader = memo(PredictionCardHeader)

// Prediction Button Component
function PredictionButton({
  direction,
  onClick,
  isPending,
  currentDirection,
  disabled
}: PredictionButtonProps) {
  const Icon = direction === 'up' ? TrendingUp : TrendingDown

  const getButtonClassNames = () => {
    return `${styles.predictionButton} ${direction === 'up' ? styles.upButton : styles.downButton}`
  }

  const getButtonLabel = () => {
    return `Price will go ${direction.toUpperCase()}`
  }

  const buttonClassNames = useMemo(getButtonClassNames, [direction])
  const label = useMemo(getButtonLabel, [direction])

  return (
    <Button
      onClick={() => onClick(direction)}
      variant="primary"
      loading={isPending && currentDirection === direction}
      disabled={disabled}
      className={buttonClassNames}
    >
      <Icon className={styles.buttonIcon} />
      {label}
    </Button>
  )
}

export default function PredictionButtons({
  currentPrice,
  userId,
  isLoading
}: PredictionButtonsProps) {
  const [direction, setDirection] = useState<'up' | 'down' | null>(null)
  const makeGuessMutation = useMakeGuess()

  const handleMakeGuess = useCallback(async (guessDirection: 'up' | 'down') => {
    setDirection(guessDirection)
    if (!currentPrice?.price || !userId) return

    makeGuessMutation.mutate({
      userId,
      direction: guessDirection,
      currentPrice: currentPrice.price,
    })
  }, [currentPrice?.price, userId, makeGuessMutation])

  function checkIsDisabled() {
    return isLoading || !currentPrice || !userId || makeGuessMutation.isPending
  }

  const isDisabled = useMemo(checkIsDisabled, [isLoading, currentPrice, userId, makeGuessMutation.isPending])

  return (
    <Card className={styles.predictionCard}>
      <MemoizedPredictionCardHeader />
      <CardContent>
        <div className={styles.predictionButtons}>
          <PredictionButton
            direction="up"
            onClick={handleMakeGuess}
            isLoading={isLoading}
            isPending={makeGuessMutation.isPending}
            currentDirection={direction}
            disabled={isDisabled}
          />
          <PredictionButton
            direction="down"
            onClick={handleMakeGuess}
            isLoading={isLoading}
            isPending={makeGuessMutation.isPending}
            currentDirection={direction}
            disabled={isDisabled}
          />
        </div>
      </CardContent>
    </Card>
  )
} 