"use client"

import { Card, CardContent } from "@/ui"
import { Bitcoin, TrendingUp } from "lucide-react"
import styles from "./Header.module.css"
import GameRules from "../GameRules/GameRulesButton"

export default function Header() {
  return (
    <div className={styles.header}>
      <Card className={styles.headerCard}>
        <CardContent className={styles.headerContent}>

          <div className={styles.headerText}>
            <div className={styles.titleContainer}>
              <div className={styles.titleGroup}>
                <div className={styles.headerIcon}>
                  <Bitcoin className={styles.bitcoinIcon} />
                </div>
                <h1 className={styles.title}>Bitcoin Price Prediction Game</h1>
              </div>
              
            </div>

            <p className={styles.subtitle}>
              <TrendingUp className={styles.trendIcon} />
              Predict if Bitcoin will go up or down in the next 60 seconds
            </p>
          </div>

          <GameRules />
        </CardContent>
      </Card>
    </div>
  )
} 