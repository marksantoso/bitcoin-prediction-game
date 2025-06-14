"use client"

import { Button, Card, CardContent } from "@/ui"
import styles from "./ErrorDisplay.module.css"

interface ErrorDisplayProps {
  error: Error | null
}

export default function ErrorDisplay({ error }: ErrorDisplayProps) {
  if (!error) return null

  return (
    <Card className={styles.errorCard}>
      <CardContent className={styles.errorContent}>
        <p className={styles.errorText}>
          {error instanceof Error ? error.message : 'An error occurred'}
        </p>
        <Button
          variant="outlined"
          className={styles.retryButton}
          onClick={() => window.location.reload()}
        >
          Retry
        </Button>
      </CardContent>
    </Card>
  )
} 