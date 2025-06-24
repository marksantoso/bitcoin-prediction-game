"use client"
import BitcoinPriceCard from './BitcoinPriceCard/BitcoinPriceCard'
import UserScoreCard from './UserScoreCard/UserScoreCard'
import { useBitcoinPrice } from '@/hooks/bitcoin/useBitcoinData'
import { useUserScore } from '@/hooks/bitcoin/useUserScore'
import { formatPrice } from '@/utils/formatPrice';
import styles from './PriceScoreGrid.module.css'

interface PriceScoreGridProps {
  userId: string | null
}

export default function PriceScoreGrid({ userId }: PriceScoreGridProps) {
  const { data: bitcoinPrice, isLoading: priceLoading, error: priceError } = useBitcoinPrice()
  const { data: userScore, isLoading: scoreLoading, error: scoreError } = useUserScore(userId || '')

  return (
    <div className={styles.priceScoreGrid}>
      <BitcoinPriceCard 
        bitcoinPrice={bitcoinPrice}
        isLoading={priceLoading}
        error={priceError}
        formatPrice={formatPrice}
      />
      <UserScoreCard 
        userScore={userScore} 
        isLoading={scoreLoading}
        error={scoreError}
      />
    </div>
  )
}