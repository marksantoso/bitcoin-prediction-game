"use client"
import { Typography, Box, CircularProgress } from '@mui/material'
import { Card, CardContent } from '@/ui'
import { TrendingUp, Award } from 'lucide-react'
import { useBitcoinPrice } from '@/hooks/bitcoin/useBitcoinData'
import { useUserScore } from '@/hooks/bitcoin/useUserScore'
import { useBitcoinUtils } from '@/hooks/bitcoin/useBitcoinUtils'
import styles from './PriceScoreGrid.module.css'
import { memo, useMemo } from 'react'
import { IBitcoinPrice, IUserScore } from '@/types/bitcoin.dto'

interface PriceScoreGridProps {
  userId: string | null
}

interface BitcoinPriceCardProps {
  bitcoinPrice: IBitcoinPrice | undefined
  isLoading: boolean
  error: Error | null
  formatPrice: (price: number) => string
}

interface UserScoreCardProps {
  userScore: IUserScore | undefined
}

function UserScoreCard({ userScore }: UserScoreCardProps) {
  const scoreValue = useMemo(() => userScore?.score || 0, [userScore?.score])
  const scoreClass = useMemo(() => {
    return `${styles.scoreValue} ${scoreValue > 0 ? styles.scorePositive : styles.scoreNegative}`
  }, [scoreValue])

  return (
    <Card className={styles.card} padding='small'>
      <CardContent className={styles.cardContent}>          
        <div>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Award size={20} />
            <Typography variant="h6" component="h2" sx={{ fontWeight: 'bold' }}>
              Your Score
            </Typography>
          </Box>
        </div>

        <div>
          <div className={scoreClass}>
            {scoreValue}
          </div>
          <div className={styles.loadingIndicator}>
            {scoreValue === 1 ? 'Point' : 'Points'}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

const MemoizedUserScoreCard = memo(UserScoreCard)

function BitcoinPriceCard({ 
  bitcoinPrice, 
  isLoading, 
  error, 
  formatPrice 
}: BitcoinPriceCardProps) {
  const formattedPrice = useMemo(() => {
    if (!bitcoinPrice) return null
    return formatPrice(bitcoinPrice.price)
  }, [bitcoinPrice, formatPrice])

  return (
    <Card className={styles.card} padding='small'>
      <CardContent className={styles.cardContent}>          
        <div>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <TrendingUp size={20} />
            <Typography variant="h6" component="h2" sx={{ fontWeight: 'bold' }}>
              Bitcoin Price
            </Typography>
          </Box>
        </div>

        {isLoading ? (
          <div>
            <div className={styles.priceValue}>Loading...</div>
            <div className={styles.loadingIndicator}>
              <CircularProgress size={16} /> Fetching live price...
            </div>
          </div>
        ) : error ? (
          <div>
            <div className={styles.priceValue}>Error</div>
            <div className={styles.loadingIndicator}>
              Failed to load price data
            </div>
          </div>
        ) : bitcoinPrice ? (
          <div>
            <div className={styles.priceValue}>
              {formattedPrice}
            </div>
            <div className={styles.loadingIndicator}>
              BTC/USD • Live Price
            </div>
          </div>
        ) : (
          <div>
            <div className={styles.priceValue}>No data</div>
            <div className={styles.loadingIndicator}>
              Price data unavailable
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

// Main component using subcomponents
export default function PriceScoreGrid({ userId }: PriceScoreGridProps) {
  const { data: bitcoinPrice, isLoading: priceLoading, error: priceError } = useBitcoinPrice()
  const { data: userScore } = useUserScore(userId || '')
  const { formatPrice } = useBitcoinUtils()

  return (
    <div className={styles.priceScoreGrid}>
      <BitcoinPriceCard 
        bitcoinPrice={bitcoinPrice}
        isLoading={priceLoading}
        error={priceError}
        formatPrice={formatPrice}
      />
      <MemoizedUserScoreCard userScore={userScore} />
    </div>
  )
}
