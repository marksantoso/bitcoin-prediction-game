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
  error?: Error | null
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
  disabled,
  error
}: PredictionButtonProps) {
  const Icon = direction === 'up' ? TrendingUp : TrendingDown

  const getButtonClassNames = () => {
    return `${styles.predictionButton} ${direction === 'up' ? styles.upButton : styles.downButton}`
  }

  const getButtonLabel = () => {
    if (error && currentDirection === direction) {
      return 'Failed - Click to retry'
    }
    return `Price will go ${direction.toUpperCase()}`
  }

  const buttonClassNames = useMemo(getButtonClassNames, [direction])
  const label = useMemo(getButtonLabel, [direction, error])

  return (
    <Button
      onClick={() => onClick(direction)}
      variant={error && currentDirection === direction ? "error" : "primary"}
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
    if (!currentPrice?.price || !userId) return

    try {
      setDirection(guessDirection)
      await makeGuessMutation.mutateAsync({
        userId,
        direction: guessDirection,
        currentPrice: currentPrice.price,
      })
    } catch (error) {
      console.error('Failed to make guess:', error)
      // Keep direction state to show error state on the button
      // It will be reset when user clicks to retry
    }
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
            error={makeGuessMutation.error}
          />
          <PredictionButton
            direction="down"
            onClick={handleMakeGuess}
            isLoading={isLoading}
            isPending={makeGuessMutation.isPending}
            currentDirection={direction}
            disabled={isDisabled}
            error={makeGuessMutation.error}
          />
        </div>
      </CardContent>
    </Card>
  )
}