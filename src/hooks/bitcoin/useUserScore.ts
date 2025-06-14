import { useQuery } from '@tanstack/react-query'
import { bitcoinService } from '@/services/bitcoin'
import { IUserScore } from '@/types/bitcoin.dto'
import { queryKeys } from '@/lib/queryKeys'

export function useUserScore(userId: string) {  
  return useQuery({
    queryKey: queryKeys.bitcoin.userScore(userId),
    queryFn: async (): Promise<IUserScore> => {
      const response = await bitcoinService.getUserScore(userId)
      return response
    },
    enabled: !!userId, // Only run if userId is provided
    staleTime: 1000 * 30, // Data is fresh for 30 seconds (matches server prefetch)
    gcTime: 1000 * 60 * 5, // Keep in cache for 5 minutes
    // Don't refetch immediately if we have hydrated data
    refetchOnMount: false, // Use hydrated data first
    refetchOnWindowFocus: false, // Don't refetch on focus to use hydrated data
    refetchOnReconnect: true, // Still refetch on reconnect for real-time updates
    // Enhanced resilience
    retry: (failureCount, error: any) => {
      // Don't retry 4xx errors
      if (error?.status >= 400 && error?.status < 500) {
        return false
      }
      return failureCount < 2
    },
    retryDelay: 1000,
    throwOnError: false,
  })
}
