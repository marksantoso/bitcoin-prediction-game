import { CardHeader } from "@/ui"
import { WifiOff } from "lucide-react"
import styles from "./PredictionHeader.module.css"

function PredictionCardHeader({ isOffline }: { isOffline?: boolean }) {
    return (
      <CardHeader
        title={
          <div className={styles.headerContainer}>
            <span>Make Your Prediction</span>
            {isOffline && <WifiOff className={styles.offlineIcon} />}
          </div>
        }
        subheader={isOffline ? "You're offline. Please check your connection." : "Will Bitcoin's price be higher or lower in 60 seconds?"}
      />
    )
  }
  
export default PredictionCardHeader