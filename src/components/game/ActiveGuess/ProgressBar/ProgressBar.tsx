import styles from "./ProgressBar.module.css"

interface ProgressBarProps {
	progressWidth: number
	startPrice: number
	currentPrice: number | undefined
	predictionStatus: string | null
	isCompleted: boolean
	formatPrice: (price: number) => string
}

const ProgressBar = ({
	progressWidth,
	startPrice,
	currentPrice,
	predictionStatus,
	formatPrice
}: ProgressBarProps) => {
	const barClassNames = `${styles.startingPrice} ${(currentPrice ?? 0) > startPrice ? styles.progressBarUp : ''} ${(currentPrice ?? 0) < startPrice ? styles.progressBarDown : ''} `
	const formattedPrice = formatPrice(startPrice)

	return (
		<div className={barClassNames}>
			<div
				className={`${styles.progressBar}`}
				style={{ width: `${100 - progressWidth}%` }}
			/>
			{predictionStatus === null && <span>😐</span>}
			{predictionStatus === "correct" && <span>😃</span>}
			{predictionStatus === "incorrect" && <span>😥</span>}

			<span className={styles.progressText}>Starting price: {formattedPrice}</span>
		</div>
	)
}

export default ProgressBar