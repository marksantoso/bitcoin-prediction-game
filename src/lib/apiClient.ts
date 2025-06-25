import { getApiBaseUrl } from '@/config/api'

// Custom error class for API errors
export class ApiError extends Error {
        constructor(
                message: string,
                public status?: number,
                public response?: Response
        ) {
                super(message)
                this.name = 'ApiError'
        }
}

// Helper function to create timeout controller
function createTimeoutController(timeoutMs: number = 10000) {
        const controller = new AbortController()
        const timeoutId = setTimeout(() => controller.abort(), timeoutMs)
        
        return {
                signal: controller.signal,
                cleanup: () => clearTimeout(timeoutId)
        }
}

// Helper function to check if error is retryable
function isRetryableError(error: any): boolean {
        // Network errors, timeouts, and 5xx server errors are retryable
        if (error.name === 'AbortError') return true // Timeout
        if (error.name === 'TypeError' && error.message.includes('fetch')) return true // Network error
        if (error instanceof ApiError && error.status && error.status >= 500) return true // Server error
        return false
}

// Helper function for exponential backoff delay
function getRetryDelay(attempt: number): number {
        return Math.min(1000 * Math.pow(2, attempt), 10000) // Max 10 seconds
}

export class ApiClient {
        constructor(private baseUrl: string = getApiBaseUrl()) { }

        private async fetchWithRetry<T>(
                url: string,
                options: RequestInit,
                maxRetries: number = 2
        ): Promise<T> {
                let lastError: Error

                for (let attempt = 0; attempt <= maxRetries; attempt++) {
                        const { signal, cleanup } = createTimeoutController(10000) // 10 second timeout
                        
                        try {
                                const response = await fetch(url, {
                                        ...options,
                                        signal,
                                        cache: 'no-store',
                                        headers: {
                                                'Content-Type': 'application/json',
                                                ...options.headers,
                                        }
                                })

                                cleanup()

                                if (!response.ok) {
                                        let errorMessage = `Request failed with status ${response.status}`
                                        
                                        try {
                                                const errorData = await response.json()
                                                errorMessage = errorData.message || errorData.error || errorMessage
                                        } catch {
                                                // If can't parse error response, use default message
                                        }

                                        const apiError = new ApiError(errorMessage, response.status, response)
                                        
                                        // Don't retry client errors (4xx) except 429 (rate limit)
                                        if (response.status >= 400 && response.status < 500 && response.status !== 429) {
                                                throw apiError
                                        }
                                        
                                        lastError = apiError
                                } else {
                                        return response.json()
                                }
                        } catch (error) {
                                cleanup()
                                lastError = error as Error

                                // If this was the last attempt or error is not retryable, throw
                                if (attempt === maxRetries || !isRetryableError(error)) {
                                        throw lastError
                                }
                        }

                        // Wait before retrying (except on last attempt)
                        if (attempt < maxRetries) {
                                await new Promise(resolve => setTimeout(resolve, getRetryDelay(attempt)))
                        }
                }

                throw lastError!
        }

        async get<T = any>(endpoint: string): Promise<T> {
                return this.fetchWithRetry<T>(`${this.baseUrl}${endpoint}`, {
                        method: 'GET'
                })
        }

        async post<T = any>(endpoint: string, data: any): Promise<T> {
                return this.fetchWithRetry<T>(`${this.baseUrl}${endpoint}`, {
                        method: 'POST',
                        body: JSON.stringify(data)
                })
        }

        async delete<T = any>(endpoint: string): Promise<T> {
                return this.fetchWithRetry<T>(`${this.baseUrl}${endpoint}`, {
                        method: 'DELETE'
                })
        }

        async patch<T = any>(endpoint: string, data: any): Promise<T> {
                return this.fetchWithRetry<T>(`${this.baseUrl}${endpoint}`, {
                        method: 'PATCH',
                        body: JSON.stringify(data)
                })
        }
}

export const apiClient = new ApiClient();
