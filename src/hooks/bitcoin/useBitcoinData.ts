"use client"

import { useEffect, useCallback } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { bitcoinService } from '@/services/bitcoin'
import { bitcoinWebSocketService } from '@/services/bitcoin/websocketService'
import { IBitcoinPrice, IGuess } from '@/types/bitcoin.dto'
import { GAME_CONFIG } from '@/config/game'
import { queryKeys } from '@/lib/queryKeys'

// Bitcoin price hook with enhanced resilience and WebSocket support
export function useBitcoinPrice() {
  const queryClient = useQueryClient()

  const handlePriceUpdate = useCallback((price: IBitcoinPrice) => {
    queryClient.setQueryData(queryKeys.bitcoin.price, price)
  }, [queryClient])

  useEffect(() => {
    bitcoinWebSocketService.subscribe(handlePriceUpdate)

    return () => {
      bitcoinWebSocketService.unsubscribe()
    }
  }, [handlePriceUpdate])

  return useQuery({
    queryKey: queryKeys.bitcoin.price,
    queryFn: async (): Promise<IBitcoinPrice> => {
      // Initial data fetch from REST API
      const response = await bitcoinService.getBitcoinPrice()

      return {
        price: response.price,
        timestamp: Date.now(),
      }
    },
    // Reduced polling interval since we're using WebSocket
    refetchInterval: GAME_CONFIG.priceUpdateInterval * 2, // Fallback polling every 20 seconds
    staleTime: 1000 * 30, // Data is fresh for 30 seconds
    refetchOnWindowFocus: true,
    refetchOnReconnect: true,
    retry: (failureCount, error) => {
      if (failureCount < 3) {
        console.log(`Bitcoin price fetch failed, attempt ${failureCount + 1}/3`, error)
        return true
      }
      return false
    },
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
    refetchOnMount: 'always'
  })
}

// Active guess hook with enhanced error handling
export function useActiveGuess(userId: string) {
  return useQuery({
    queryKey: queryKeys.bitcoin.activeGuess(userId),
    queryFn: async (): Promise<IGuess | null> => {
      try {
        const response = await bitcoinService.getActiveGuess(userId)
        return response.activeGuess
      } catch (error: any) {
        // If no active guess, return null instead of throwing
        if (error?.status === 404 || error?.response?.status === 404) {
          return null
        }
        throw error
      }
    },
    enabled: !!userId,
    staleTime: 1000 * 10, // Data is fresh for 10 seconds
    gcTime: 1000 * 60 * 5, // Keep in cache for 5 minutes
    refetchInterval: (data) => {
      // Only refetch if there's an active guess
      return data ? 1000 * 5 : false // Every 5 seconds if active guess exists
    },
    retry: (failureCount, error) => {
      // Don't retry 404s (no active guess) or if we've hit max retries
      if ((error as any)?.status === 404 || (error as any)?.response?.status === 404) return false
      if (failureCount < 2) {
        return true
      }
      return false
    },
    retryDelay: 1000,
    throwOnError: false,
  })
}

// Make guess mutation with optimistic updates and error recovery
export function useMakeGuess() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({
      userId,
      direction,
      currentPrice,
    }: {
      userId: string
      direction: 'up' | 'down'
      currentPrice: number
    }) => {
      // Check for existing active guess before making a new one
      const activeGuess = await bitcoinService.getActiveGuess(userId)
      if (activeGuess?.activeGuess) {
        throw new Error('You already have an active guess')
      }

      return await bitcoinService.makeGuess(userId, direction, currentPrice)
    },
    onSuccess: (data, variables) => {
      const { userId } = variables

      // Optimistically update the active guess
      queryClient.setQueryData(
        queryKeys.bitcoin.activeGuess(userId),
        {
          id: data.guessId,
          userId,
          direction: variables.direction,
          startPrice: variables.currentPrice,
          resolved: false,
        } as IGuess
      )

      // Invalidate and refetch active guess to get server data
      queryClient.invalidateQueries({
        queryKey: queryKeys.bitcoin.activeGuess(userId),
      })
    },
    onError: (error, variables) => {
      // Handle specific error cases
      if (error instanceof Error && error.message === 'You already have an active guess') {
        console.warn('Attempted to make a guess while another is active:', error)
      } else {
        console.error('Failed to make guess:', error)
      }

      // Rollback optimistic update on error
      queryClient.invalidateQueries({
        queryKey: queryKeys.bitcoin.activeGuess(variables.userId),
      })
    },
    retry: 1,
    retryDelay: 1000,
  })
}

// Resolve guess mutation with enhanced error handling and retry logic
export function useResolveGuess() {
  const queryClient = useQueryClient()
  const MAX_RETRIES = 3
  const RETRY_DELAY = 1000

  return useMutation({
    mutationFn: async ({
      userId,
      guessId,
      currentPrice,
    }: {
      userId: string
      guessId: string
      currentPrice: number
      retryCount?: number
      startPrice: number
      direction: 'up' | 'down'
    }) => {
      try {
        const response = await bitcoinService.resolveGuess(userId, guessId, currentPrice)
        return response
      } catch (error: any) {
        console.error('Failed to resolve guess:', error)
        throw error
      }
    },
    onMutate: async (variables) => {
      const { userId, startPrice, currentPrice, direction } = variables

      // Cancel any outgoing refetches to avoid overwriting our optimistic update
      await queryClient.cancelQueries({ queryKey: queryKeys.bitcoin.userScore(userId) })
      await queryClient.cancelQueries({ queryKey: queryKeys.bitcoin.activeGuess(userId) })

      // Snapshot the previous values
      const previousScore = queryClient.getQueryData(queryKeys.bitcoin.userScore(userId))
      const previousGuess = queryClient.getQueryData<IGuess | null>(queryKeys.bitcoin.activeGuess(userId))

      // If there's no active guess, don't proceed with optimistic update
      if (!previousGuess) {
        return { previousScore, previousGuess }
      }

      // Calculate if guess was correct
      const priceWentUp = currentPrice > startPrice
      const correctGuess = (direction === 'up' && priceWentUp) || (direction === 'down' && !priceWentUp)

      // Optimistically update score
      queryClient.setQueryData(
        queryKeys.bitcoin.userScore(userId),
        (old: any) => {
          return {
            score: (old?.score || 0) + (correctGuess ? GAME_CONFIG.correctGuessPoints : GAME_CONFIG.incorrectGuessPoints)
          }
        }
      )

      // Clear active guess
      queryClient.setQueryData(
        queryKeys.bitcoin.activeGuess(userId),
        null
      )

      return { previousScore, previousGuess }
    },
    onError: (error: any, variables, context) => {
      console.error('Failed to resolve guess:', error)
    },
    onSuccess: (data, variables) => {
      const { userId } = variables

      // Invalidate queries to get fresh server data
      queryClient.invalidateQueries({
        queryKey: queryKeys.bitcoin.activeGuess(userId),
      })
      queryClient.invalidateQueries({
        queryKey: queryKeys.bitcoin.userScore(userId),
      })
    },
    retry: (failureCount, error) => {
      // Don't retry 404s (no active guess) or if we've hit max retries
      if ((error as any)?.status === 404 || (error as any)?.response?.status === 404) return false
      if (failureCount < MAX_RETRIES) {
        return true
      }
      return false
    },
    retryDelay: RETRY_DELAY,
  })
}
