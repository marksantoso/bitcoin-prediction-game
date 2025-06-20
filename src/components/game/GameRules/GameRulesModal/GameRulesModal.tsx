import { Modal, Box } from '@mui/material';
import { Card, CardContent } from "@/ui"
import { Clock, TrendingUp, TrendingDown, Trophy, X } from "lucide-react"

import styles from "./GameRulesModal.module.css"

interface GameRulesModalProps {
	isOpen: boolean;
	onRequestClose: () => void;
}

export default function GameRulesModal({ isOpen, onRequestClose }: GameRulesModalProps) {
	return (
		<Modal
			open={isOpen}
			onClose={onRequestClose}
			aria-labelledby="game-rules-modal"
			sx={{
				display: 'flex',
				alignItems: 'center',
				justifyContent: 'center',
				p: 2
			}}
			BackdropProps={{
				sx: {
					backgroundColor: 'rgba(0, 0, 0, 0.5)'
				}
			}}
		>
			<Box
				sx={{
					width: '100%',
					maxWidth: 600,
					outline: 'none',
					position: 'relative'
				}}
			>
				<button
					onClick={onRequestClose}
					className={styles.closeButton}
					aria-label="Close modal"
				>
					<X size={24} />
				</button>
				<Card className={styles.rulesCard}>
					<CardContent className={styles.rulesContent}>
						<h2 className={styles.rulesTitle}>How to Play</h2>
						<div className={styles.rulesList}>


							<div className={styles.rule}>
								<div className={styles.ruleIcon}>
									<TrendingUp className={styles.icon} />
								</div>
								<div className={styles.ruleText}>
									<h3>Make Your Prediction</h3>
									<p>Predict whether Bitcoin price will go UP or DOWN</p>
								</div>
							</div>

							<div className={styles.rule}>
								<div className={styles.ruleIcon}>
									<Clock className={styles.icon} />
								</div>
								<div className={styles.ruleText}>
									<h3>60-Second Timer</h3>
									<p>You have 60 seconds to see if your prediction comes true</p>
								</div>
							</div>

							<div className={styles.rule}>
								<div className={styles.ruleIcon}>
									<TrendingDown className={styles.icon} />
								</div>
								<div className={styles.ruleText}>
									<h3>Price Movement</h3>
									<p>Win if the price moves in your predicted direction</p>
								</div>
							</div>

							<div className={styles.rule}>
								<div className={styles.ruleIcon}>
									<Trophy className={styles.icon} />
								</div>
								<div className={styles.ruleText}>
									<h3>Score Points</h3>
									<p>Correct predictions earn you +1 point, wrong ones cost -1 point</p>
								</div>
							</div>
						</div>
					</CardContent>
				</Card>
			</Box>
		</Modal>
	);
} 