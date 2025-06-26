import { CardHeader } from '@/ui'
import { Clock } from "lucide-react"
import styles from "./GuessHeader.module.css"

interface HeaderProps {
	isResolving: boolean
}

function GuessHeader({ isResolving }: HeaderProps) {
	return (
		<CardHeader
			className={styles.activeGuessHeader}
			title={
				<div className={styles.activeGuessTitle}>
					<Clock className={styles.clockIcon} />
					Active Prediction
					{isResolving && <span className={styles.resolvingText}>(Resolving...)</span>}
				</div>
			}
		/>
	)
}

export default GuessHeader