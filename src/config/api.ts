// API Version type
export type ApiVersion = 'v1'

// API Configuration
export const API_CONFIG = {
  // Use AWS API Gateway in production, local development routes in development
  BASE_URL: process.env.NODE_ENV === 'production' 
    ? 'https://reth9yeru3.execute-api.us-east-1.amazonaws.com/prod/'
    : '/',
  
  // API Version
  CURRENT_VERSION: 'v1' as ApiVersion,
  
  // Endpoints with versioning
  ENDPOINTS: {
    ACTIVE_GUESS: 'active-guess',
    MAKE_GUESS: 'make-guess',
    SCORE: 'score',
    BTC_PRICE: 'btc-price',
    RESOLVE_GUESS: 'resolve-guess',
  },

  // Version configurations
  VERSIONS: {
    v1: {
      ACTIVE: true,
      DEPRECATED: false,
      SUNSET_DATE: null,
    }
  } as const
} as const

// You can also set this via environment variable for more flexibility
export const getApiBaseUrl = (): string => {
  // Check for explicit environment variable first
  if (process.env.NEXT_PUBLIC_API_BASE_URL) {
    return process.env.NEXT_PUBLIC_API_BASE_URL
  }
  
  // Fall back to the default configuration
  return API_CONFIG.BASE_URL
}

// Helper to get versioned endpoint
export const getVersionedEndpoint = (endpoint: string, version?: ApiVersion): string => {
  const ver = version || API_CONFIG.CURRENT_VERSION
  if (!API_CONFIG.VERSIONS[ver]?.ACTIVE) {
    throw new Error(`API version ${ver} is not active`)
  }
  return `/${ver}/${endpoint}`
} 