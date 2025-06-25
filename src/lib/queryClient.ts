import { QueryClient } from '@tanstack/react-query'

export function createQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: {
        // Always treat data as stale
        staleTime: 0,
        // Always refetch on mount
        refetchOnMount: true,
        // Always refetch on window focus
        refetchOnWindowFocus: true,
        // Always refetch on reconnect
        refetchOnReconnect: true,
        retry: (failureCount, error: any) => {
          if (error?.status >= 400 && error?.status < 500) {
            return false
          }
          return failureCount < 3
        },
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