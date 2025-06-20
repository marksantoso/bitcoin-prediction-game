import { dehydrate } from '@tanstack/react-query'
import { createQueryClient } from '@/lib/queryClient'
import { prefetchGameData } from '@/lib/hydration'

import { QueryProvider } from '@/providers/QueryProvider'
import Header from '@/components/game/Header/Header'
import GameContainer from '@/components/game/GameContainer/GameContainer'
import styles from './page.module.css'

interface Props {
	params: {
		userId: string
	}
}

export default async function BitcoinPredictionGamePage({ params }: Props) {
	// Create a new query client for this request
	const queryClient = createQueryClient()

	// Use the userId from the URL parameter
	const { userId } = params
	// Pre-fetch Bitcoin data AND user score on the server
	await prefetchGameData(queryClient, userId)

	// Dehydrate the query client state
	const dehydratedState = dehydrate(queryClient)

	return (
		<QueryProvider dehydratedState={dehydratedState}>
			<div className={`container ${styles.container}`}>
				<div className={styles.mainContent}>
					<div className={styles.header}>
						<Header />
					</div>

					<GameContainer userId={userId} />
				</div>
			</div>
		</QueryProvider>
	)
}
