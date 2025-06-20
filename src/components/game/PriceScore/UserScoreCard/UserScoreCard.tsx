
import { memo, useMemo } from 'react'
import { IUserScore } from '@/types/bitcoin.dto'
import { Card, CardContent } from '@/ui'
import { Award } from 'lucide-react'
import { Typography, Box, CircularProgress } from '@mui/material'
import styles from './UserScoreCard.module.css'

interface UserScoreCardProps {
    userScore: IUserScore | undefined
    isLoading: boolean
    error: Error | null
}

function UserScoreCard({ userScore, isLoading, error }: UserScoreCardProps) {
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

                {isLoading ? (
                    <div>
                        <div className={styles.loadingIndicator}>
                            <CircularProgress size={16} /> Fetching score...
                        </div>
                    </div>
                ) : error ? (
                    <div>
                        <div className={styles.scoreValue}>Error</div>
                        <div className={styles.loadingIndicator}>
                            Failed to load score data
                        </div>
                    </div>
                ) : (
                    <div>
                        <div className={scoreClass}>
                            {scoreValue}
                        </div>
                        <div className={styles.loadingIndicator}>
                            {scoreValue === 1 ? 'Point' : 'Points'}
                        </div>
                    </div>
                )}
            </CardContent>
        </Card>
    )
}

const MemoizedUserScoreCard = memo(UserScoreCard)
export default MemoizedUserScoreCard