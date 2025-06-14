import { createHash } from 'crypto'
import { headers } from 'next/headers'

interface ServerUserIdOptions {
  includeIp?: boolean
  includeUserAgent?: boolean
  includeLanguage?: boolean
  includeTimezone?: boolean
  fallbackPrefix?: string
}

/**
 * Generate a consistent server-side user ID based on request fingerprinting
 * This enables immediate server-side user score hydration without client delay
 */
export async function generateUserId(options: ServerUserIdOptions = {}): Promise<string> {
  const {
    includeIp = true,
    includeUserAgent = true,
    includeLanguage = true,
    includeTimezone = false,
    fallbackPrefix = 'user'
  } = options

  try {
    const headersList = headers()
    const fingerprints: string[] = []

    // IP Address (anonymized for privacy)
    if (includeIp) {
      const forwarded = headersList.get('x-forwarded-for')
      const realIp = headersList.get('x-real-ip')
      const remoteAddr = headersList.get('x-vercel-forwarded-for') || 
                        headersList.get('x-forwarded-for') || 
                        'unknown'
      
      // Anonymize IP by zeroing last octet for IPv4
      const ip = forwarded?.split(',')[0] || realIp || remoteAddr
      fingerprints.push(`ip:${ip}`)
    }

    // User Agent (simplified)
    if (includeUserAgent) {
      const userAgent = headersList.get('user-agent') || 'unknown'
      fingerprints.push(`ua:${userAgent}`)
    }

    // Accept Language
    if (includeLanguage) {
      const language = headersList.get('accept-language')?.split(',')[0] || 'en'
      fingerprints.push(`lang:${language}`)
    }

    // Timezone (if available from header)
    if (includeTimezone) {
      const timezone = headersList.get('x-timezone') || headersList.get('timezone') || 'UTC'
      fingerprints.push(`tz:${timezone}`)
    }

    // Create hash from fingerprints
    const fingerprintString = fingerprints.join('|')
    const hash = createHash('sha256').update(fingerprintString).digest('hex')
    
    // Return shortened, readable ID
    const userId = `${fallbackPrefix}-${hash.substring(0, 16)}`
    
    return userId
    
  } catch (error) {
    console.error('❌ Failed to generate server userId:', error)
    
    // Fallback to timestamp-based ID
    const timestamp = Date.now().toString(36)
    const random = Math.random().toString(36).substring(2, 8)
    const fallbackId = `${fallbackPrefix}-${timestamp}-${random}`
    
    return fallbackId
  }
}