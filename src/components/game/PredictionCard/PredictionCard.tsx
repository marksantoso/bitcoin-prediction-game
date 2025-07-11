"use client"
import { useState, useCallback, useEffect } from 'react'
import { Card, CardContent } from '@/ui'
import { useMakeGuess } from "@/hooks/bitcoin/useBitcoinData"
import { IBitcoinPrice } from "@/types/bitcoin.dto"
import PredictionButton from "./PredictionButton/PredictionButton"
import PredictionCardHeader from "./PredictionHeader/PredictionHeader"
import styles from "./PredictionCard.module.css"
import { GuessDirection } from '@/config/game'

interface PredictionCardProps {
  currentPrice: IBitcoinPrice | undefined
  userId: string | null
  isLoading: boolean
}

export default function PredictionCard({
  currentPrice,
  userId,
  isLoading
}: PredictionCardProps) {
  const [direction, setDirection] = useState<GuessDirection | null>(null)
  const [isOffline, setIsOffline] = useState(false)
  const makeGuessMutation = useMakeGuess()

  useEffect(() => {
    setIsOffline(!navigator.onLine)
    const handleOnline = () => setIsOffline(false)
    const handleOffline = () => setIsOffline(true)

    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)

    return () => {
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
    }
  }, [])

  const handleMakeGuess = useCallback(async (guessDirection: GuessDirection) => {
    if (!currentPrice?.price || !userId || isOffline) return

    try {
      setDirection(guessDirection)
      await makeGuessMutation.mutateAsync({
        userId,
        direction: guessDirection,
        currentPrice: currentPrice.price,
      })
    } catch (error) {
      console.error('Failed to make guess:', error)
    }
  }, [currentPrice?.price, userId, makeGuessMutation, isOffline])

  const isDisabled = isLoading || !currentPrice || !userId || makeGuessMutation.isPending || isOffline
  
  return (
    <Card className={styles.predictionCard}>
      <PredictionCardHeader isOffline={isOffline} />
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
            isOffline={isOffline}
          />
          <PredictionButton
            direction="down"
            onClick={handleMakeGuess}
            isLoading={isLoading}
            isPending={makeGuessMutation.isPending}
            currentDirection={direction}
            disabled={isDisabled}
            error={makeGuessMutation.error}
            isOffline={isOffline}
          />
        </div>
      </CardContent>
    </Card>
  )
}