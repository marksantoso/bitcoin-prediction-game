export const GAME_CONFIG = {
  // Game Rules
  guessResolutionTime: 60000, // 60 seconds minimum before guess can be resolved
  correctGuessPoints: 1, // Points awarded for correct guess
  incorrectGuessPoints: -1, // Points deducted for incorrect guess
  initialPlayerScore: 0, // Starting score for new players
  maxActiveGuesses: 1, // Only one guess at a time
  
  // Price Updates
  priceUpdateInterval: 1000, // 20 seconds
  
  // Minimum time between guesses in milliseconds
  guessInterval: 60000, // 1 minute
  
  // Time until a guess expires in milliseconds
  guessExpiryTime: 300000, // 5 minutes
  
  // Points awarded for correct guesses
  pointsPerCorrectGuess: 1,
  
  // Points deducted for incorrect guesses
  pointsPerIncorrectGuess: 0,
  
  // API Settings
  apiTimeout: 5000, // 5 seconds timeout for API calls
  retryAttempts: 3, // Number of retry attempts for failed API calls
  
} as const

// Type definitions for better type safety
export type GuessDirection = 'up' | 'down'

export type GuessResult = 'correct' | 'incorrect' | 'pending'
