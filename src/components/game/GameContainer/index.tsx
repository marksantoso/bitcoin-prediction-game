"use client"
import { Bitcoin } from "lucide-react"
import { useBitcoinPrice, useActiveGuess, useMakeGuess } from "@/hooks/bitcoin/useBitcoinData"
import { Card, CardContent } from "@/ui"
import { AdvancedRealTimeChart } from "react-ts-tradingview-widgets";
import PriceScoreGrid from "@/components/game/PriceScoreGrid"
import ActiveGuessDisplay from "@/components/game/ActiveGuessDisplay"
import PredictionButtons from "@/components/game/PredictionButtons"
import styles from "./GameContainer.module.css"

export default function GameContainer({ userId }: { userId: string }) {
  // TanStack Query hooks
  const {
    data: currentPrice,
    isLoading: isPriceLoading,
  } = useBitcoinPrice()

  const {
    data: activeGuess,
    isLoading: isGuessLoading,
  } = useActiveGuess(userId)

  const makeGuessMutation = useMakeGuess()

  // Combine all loading states
  const isLoading = isPriceLoading || isGuessLoading || makeGuessMutation.isPending

  // Show loading state if user ID is still being generated
  if ((isPriceLoading && !currentPrice)) {
    return (
      <div className={styles.loadingContainer}>
        <Card className={styles.loadingCard}>
          <CardContent className={styles.loadingContent}>
            <div className={styles.loadingText}>
              <Bitcoin className={styles.loadingIcon} />
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className={`container ${styles.container}`}>
      <div className={styles.chartContainer}>
        <AdvancedRealTimeChart
          theme="dark"
          width="100%"
          height={500}
          symbol="BINANCE:BTCUSDT"
          container_id="tradingview_chart"
          interval="1"
          timezone="exchange"
          style="1"
          locale="en"
          toolbar_bg="#f1f3f6"
          enable_publishing={false}
          allow_symbol_change={false}
          save_image={false}
          hide_side_toolbar={true}
          hide_legend={true}
          hide_top_toolbar={true}
          disabled_features={[
            "header_symbol_search",
            "timeframes_toolbar",
            "header_compare",
            "header_undo_redo",
          ]}
        />
      </div>
      <div className={styles.gameContainer}>
        {userId && <PriceScoreGrid userId={userId} />}

        {activeGuess && (
          <ActiveGuessDisplay
            activeGuess={activeGuess}
            currentPrice={currentPrice}
            userId={userId || ''}
          />
        )}

        {!activeGuess && !isGuessLoading && (
          <PredictionButtons
            currentPrice={currentPrice}
            userId={userId}
            isLoading={isLoading}
          />
        )}
      </div>
    </div >
  )
} 