export const GAME_CONFIG = {
  // Game Rules
  guessResolutionTime: 60000, // 60 seconds minimum before guess can be resolved
  correctGuessPoints: 1, // Points awarded for correct guess
  incorrectGuessPoints: -1, // Points deducted for incorrect guess  
  // Price Updates
  priceUpdateInterval: 1000, // 20 seconds
  // Minimum time between guesses in milliseconds
  guessInterval: 60000, // 1 minute
} as const

// Type definitions for better type safety
export type GuessDirection = 'up' | 'down'
