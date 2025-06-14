'use client'

import { useState, Suspense } from 'react'
import { QueryClientProvider, HydrationBoundary, DehydratedState } from '@tanstack/react-query'
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'
import { CircularProgress } from '@mui/material'
import { getQueryClient } from '@/lib/queryClient'

interface QueryProviderProps {
  children: React.ReactNode
  dehydratedState?: DehydratedState
}

export function QueryProvider({ children, dehydratedState }: QueryProviderProps) {
  const [queryClient] = useState(() => getQueryClient())

  return (
    <QueryClientProvider client={queryClient}>
      <HydrationBoundary state={dehydratedState}>
        <Suspense fallback={
          <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
            <CircularProgress />
          </div>
        }>
          {children}
        </Suspense>
        <ReactQueryDevtools 
          initialIsOpen={false} 
          buttonPosition="bottom-left"
        />
      </HydrationBoundary>
    </QueryClientProvider>
  )
} 