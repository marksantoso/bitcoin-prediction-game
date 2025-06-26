
import { TrendingUp, TrendingDown } from "lucide-react"
import { Button } from "@/ui"

import styles from "./PredictionButton.module.css"

interface PredictionButtonProps {
    direction: 'up' | 'down'
    onClick: (direction: 'up' | 'down') => void
    isLoading: boolean
    isPending: boolean
    currentDirection: 'up' | 'down' | null
    disabled: boolean
    error?: Error | null
    isOffline?: boolean
}

// Prediction Button Component
const PredictionButton = ({
    direction,
    onClick,
    isPending,
    currentDirection,
    disabled,
    error,
    isOffline
}: PredictionButtonProps) => {
    const Icon = direction === 'up' ? TrendingUp : TrendingDown

    const getButtonLabel = () => {
        if (isOffline) {
            return 'Offline - Check connection'
        }
        if (error && currentDirection === direction) {
            return 'Failed - Click to retry'
        }
        return `Price will go ${direction.toUpperCase()}`
    }

    const buttonClassNames = `${styles.predictionButton} ${direction === 'up' ? styles.upButton : styles.downButton}`
    const label = getButtonLabel()

    return (
        <Button
            onClick={() => onClick(direction)}
            variant={error && currentDirection === direction ? "error" : "primary"}
            loading={isPending && currentDirection === direction}
            disabled={disabled || isOffline}
            className={buttonClassNames}
        >
            <Icon className={styles.buttonIcon} />
            {label}
        </Button>
    )
}

export default PredictionButton