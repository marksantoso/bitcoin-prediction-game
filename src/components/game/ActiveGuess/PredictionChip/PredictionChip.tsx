import { TrendingUp, TrendingDown } from "lucide-react"
import { Chip } from '@/ui'
import styles from "./PredictionChip.module.css"

interface PredictionChipProps {
	direction: 'up' | 'down'
}

function PredictionChip({ direction }: PredictionChipProps) {
	const Icon = direction === 'up' ? TrendingUp : TrendingDown
	const chipClassNames = `${styles.predictionChip} ${direction === "up" ? styles.predictionChipDown : styles.predictionChipUp}`

	return (
		<Chip
			label={
				<span className={styles.chipContent}>
					<Icon className={styles.chipIcon} />
					Price will go {direction.toUpperCase()}
				</span>
			}
			variant={direction === "up" ? "primary" : "secondary"}
			className={chipClassNames}
		/>
	)
}

export default PredictionChip