import { useMemo } from 'react'
import { Card, CardContent } from '@/ui'
import { TrendingUp } from 'lucide-react'
import { Typography, Box, CircularProgress } from '@mui/material'
import { IBitcoinPrice } from '@/types/bitcoin.dto'
import styles from './BitcoinPriceCard.module.css'

interface BitcoinPriceCardProps {
    bitcoinPrice: IBitcoinPrice | undefined
    isLoading: boolean
    error: Error | null
    formatPrice: (price: number) => string
}

const BitcoinPriceCard = ({
    bitcoinPrice,
    isLoading,
    error,
    formatPrice
}: BitcoinPriceCardProps) => {
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

export default BitcoinPriceCard