import { useState } from 'react'
import { Button } from "@/ui"
import { HelpCircle } from "lucide-react"
import GameRulesModal from './GameRulesModal/GameRulesModal'
import styles from './GameRulesButton.module.css'

export default function GameRules() {
  const [isModalOpen, setIsModalOpen] = useState(false)

  return (
    <div className={styles.rulesButtonContainer}>
      <Button
        variant="outlined"
        size="small"
        onClick={() => setIsModalOpen(true)}
        aria-label="How to Play"
        className={styles.rulesButton}
      >
        <HelpCircle className={styles.helpIcon} />
        <span>How to Play</span>
      </Button>
      
      <GameRulesModal 
        isOpen={isModalOpen}
        onRequestClose={() => setIsModalOpen(false)}
      />
    </div>
  )
} 