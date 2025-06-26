
import { Card, CardContent } from '@/ui'
import { Award } from 'lucide-react'
import { Typography, Box, CircularProgress } from '@mui/material'
import { useUserScore } from '@/hooks/bitcoin/useUserScore'
import styles from './UserScoreCard.module.css'

function UserScoreCard({ userId }: {userId: string}) {
    const { data: userScore, isLoading, error } = useUserScore(userId)

    const scoreValue = userScore?.score || 0
    const scoreClass = `${styles.scoreValue} ${scoreValue > 0 ? styles.scorePositive : styles.scoreNegative}`

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
                        <div className={scoreClass} data-testid="user-score">
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

export default UserScoreCard