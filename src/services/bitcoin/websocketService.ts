"use client"

import { IBitcoinPrice } from '@/types/bitcoin.dto'

export class BitcoinWebSocketService {
  private ws: WebSocket | null = null
  private reconnectAttempts = 0
  private maxReconnectAttempts = 5
  private reconnectDelay = 1000 // Start with 1 second delay
  private onPriceUpdateCallback: ((price: IBitcoinPrice) => void) | null = null

  constructor() {
    this.connect()
  }

  private connect() {
    if (this.ws) {
      this.ws.close()
    }

    // Connect to Binance WebSocket stream for BTC/USDT price
    this.ws = new WebSocket('wss://stream.binance.com:9443/ws/btcusdt@trade')

    this.ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data)
        if (data.p) { // Price data
          const price: IBitcoinPrice = {
            price: parseFloat(data.p),
            timestamp: Date.now()
          }
          this.onPriceUpdateCallback?.(price)
        }
      } catch (error) {
        console.error('Error parsing WebSocket message:', error)
      }
    }

    this.ws.onclose = () => {
      console.log('WebSocket connection closed')
      this.handleReconnect()
    }

    this.ws.onerror = (error) => {
      console.error('WebSocket error:', error)
      this.ws?.close()
    }

    this.ws.onopen = () => {
      console.log('WebSocket connected')
      this.reconnectAttempts = 0
      this.reconnectDelay = 1000
    }
  }

  private handleReconnect() {
    if (this.reconnectAttempts < this.maxReconnectAttempts) {
      this.reconnectAttempts++
      console.log(`Attempting to reconnect (${this.reconnectAttempts}/${this.maxReconnectAttempts})...`)
      
      setTimeout(() => {
        this.connect()
      }, this.reconnectDelay)

      // Exponential backoff
      this.reconnectDelay = Math.min(this.reconnectDelay * 2, 30000)
    } else {
      console.error('Max reconnection attempts reached')
    }
  }

  public subscribe(callback: (price: IBitcoinPrice) => void) {
    this.onPriceUpdateCallback = callback
  }

  public unsubscribe() {
    this.onPriceUpdateCallback = null
  }

  public disconnect() {
    if (this.ws) {
      this.ws.close()
      this.ws = null
    }
  }
}

// Export a singleton instance
export const bitcoinWebSocketService = new BitcoinWebSocketService() 