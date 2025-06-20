import { memo } from "react"
import { CardHeader } from "@/ui"
import { WifiOff } from "lucide-react"

function PredictionCardHeader({ isOffline }: { isOffline?: boolean }) {
    return (
      <CardHeader
        title={
          <div className="flex items-center gap-2">
            <span>Make Your Prediction</span>
            {isOffline && <WifiOff className="h-4 w-4 text-red-500" />}
          </div>
        }
        subheader={isOffline ? "You're offline. Please check your connection." : "Will Bitcoin's price be higher or lower in 60 seconds?"}
      />
    )
  }
  
  const MemoizedPredictionCardHeader = memo(PredictionCardHeader)
  export default MemoizedPredictionCardHeader