// Query keys that can be used on both server and client
export const queryKeys = {
  bitcoin: {
    all: ['bitcoin'] as const,
    price: ['bitcoin', 'price'] as const,
    userScore: (userId: string) => ['bitcoin', 'userScore', userId] as const,
    activeGuess: (userId: string) => ['bitcoin', 'activeGuess', userId] as const,
  },
} as const