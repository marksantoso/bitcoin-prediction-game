import { QueryClient, dehydrate } from '@tanstack/react-query'
import { bitcoinService } from '@/services/bitcoin'
import { IBitcoinPrice, IUserScore } from '@/types/bitcoin.dto'
import { queryKeys } from '@/lib/queryKeys'

export async function prefetchGameData(queryClient: QueryClient, userId?: string) {
  // Prefetch Bitcoin price
  await queryClient.prefetchQuery({
    queryKey: queryKeys.bitcoin.price,
    queryFn: async (): Promise<IBitcoinPrice> => {
      const response = await bitcoinService.getBitcoinPrice()
      return {
        price: response.price,
        timestamp: Date.now(),
      }
    },
    staleTime: 1000 * 30, // 30 seconds
  })

  // Prefetch user score if userId is available
  if (userId) {
    await prefetchUserData(queryClient, userId)
  }

  return dehydrate(queryClient)
}

export async function prefetchUserData(queryClient: QueryClient, userId: string) {
  try {
    // Prefetch user score
    await queryClient.prefetchQuery({
      queryKey: queryKeys.bitcoin.userScore(userId),
      queryFn: async (): Promise<IUserScore | null> => {
        try {
          const result = await bitcoinService.getUserScore(userId)
          return result
        } catch (error) {
          console.warn('⚠️ Server: User score prefetch failed, using default', error)
          return null
        }
      },
    })

    // Prefetch user's active guess 
    await queryClient.prefetchQuery({
      queryKey: queryKeys.bitcoin.activeGuess(userId),
      queryFn: async () => {
        try {
          const response = await bitcoinService.getActiveGuess(userId)
          return response.activeGuess
        } catch (error: any) {
          if (error?.status === 404 || error?.response?.status === 404) {
            return null
          }
          throw error
        }
      },
      staleTime: 1000 * 15, // 15 seconds
    })
    
  } catch (error) {
    console.error('❌ Server: Failed to prefetch user score:', error)
  }
}
