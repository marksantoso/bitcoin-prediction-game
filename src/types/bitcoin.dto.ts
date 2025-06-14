// Simple Bitcoin price interface
export interface IBitcoinPrice {
        price: number
        timestamp: number
}

// Simple guess interface
export interface IGuess {
        id: string
        userId: string
        direction: 'up' | 'down'
        startPrice: number
        expiresAt: number
        resolved: boolean
        endPrice?: number
        endTime?: number
        correct?: boolean
}

// Simple user score interface
export interface IUserScore {
        userId: string
        score: number
}