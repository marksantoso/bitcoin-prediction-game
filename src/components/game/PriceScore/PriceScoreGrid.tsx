"use client"
import BitcoinPriceCard from './BitcoinPriceCard/BitcoinPriceCard'
import UserScoreCard from './UserScoreCard/UserScoreCard'

import styles from './PriceScoreGrid.module.css'

interface PriceScoreGridProps {
  userId: string
}

export default function PriceScoreGrid({ userId }: PriceScoreGridProps) {

  return (
    <div className={styles.priceScoreGrid}>
      <BitcoinPriceCard />
      <UserScoreCard userId={userId} />
    </div>
  )
}