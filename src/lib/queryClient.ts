import { QueryClient } from '@tanstack/react-query'

export function createQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: {
        // How long to cache data
        gcTime: 1000 * 60 * 60 * 24, // 24 hours
        // How long data is considered fresh
        staleTime: 1000 * 60 * 5, // 5 minutes for most data
        // Retry failed requests
        retry: (failureCount, error: any) => {
          // Don't retry 4xx errors
          if (error?.status >= 400 && error?.status < 500) {
            return false
          }
          // Retry up to 3 times for other errors
          return failureCount < 3
        },
        // Refetch when window regains focus
        refetchOnWindowFocus: true,
        // Refetch when reconnecting
        refetchOnReconnect: true,
      },
      mutations: {
        // Retry mutations once
        retry: 1,
      },
    },
  })
}

let clientSingleton: QueryClient | undefined

export function getQueryClient() {
  if (typeof window === 'undefined') {
    // Server: always make a new query client
    return createQueryClient()
  } else {
    // Browser: make a new query client if we don't already have one
    if (!clientSingleton) clientSingleton = createQueryClient()
    return clientSingleton
  }
} 