import { memo, useMemo } from "react"
import { TrendingUp, TrendingDown } from "lucide-react"
import { Chip } from '@/ui'
import styles from "./PredictionChip.module.css"

interface PredictionChipProps {
	direction: 'up' | 'down'
}

function PredictionChip({ direction }: PredictionChipProps) {
	const Icon = direction === 'up' ? TrendingUp : TrendingDown

	function getChipClassNames() {
		return `${styles.predictionChip} ${direction === "up" ? styles.predictionChipDown : styles.predictionChipUp}`
	}

	const chipClassNames = useMemo(getChipClassNames, [direction])

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

const MemoizedPredictionChip = memo(PredictionChip)

export default MemoizedPredictionChip