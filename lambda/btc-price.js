const https = require('https');
const { API_CONFIG } = require('./config');

// Multiple API endpoints for fallback
const API_ENDPOINTS = [
  'https://api.binance.com/api/v3/ticker/price?symbol=BTCUSDT',
  'https://api.coinbase.com/v2/exchange-rates?currency=BTC',
  'https://api.coingecko.com/api/v3/simple/price?ids=bitcoin&vs_currencies=usd&include_24hr_change=true',
];

// Simple in-memory cache (in production, use Redis or DynamoDB)
let priceCache = {
  data: null,
  timestamp: 0,
  ttl: 15000 // 15 second TTL
};

async function makeHttpRequest(url, timeout = 5000) {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeout);

  try {
    const response = await fetch(url, {
      signal: controller.signal,
      headers: {
        'User-Agent': 'Bitcoin-Price-Lambda/1.0'
      }
    });
    
    clearTimeout(timeoutId);
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    return await response.json();
  } catch (error) {
    clearTimeout(timeoutId);
    if (error.name === 'AbortError') {
      throw new Error('Request timeout');
    }
    throw error;
  }
}

// Try multiple APIs with fallback
async function fetchBitcoinPriceWithFallback() {
  const errors = [];

  // Check cache first
  if (priceCache.data && (Date.now() - priceCache.timestamp) < priceCache.ttl) {
    console.log('Returning cached Bitcoin price');
    return priceCache.data;
  }

  // Try Binance first (primary)
  try {
    console.log('Attempting to fetch from Binance...');
    const response = await makeHttpRequest(API_ENDPOINTS[0]);
    
    console.log('Binance response:', JSON.stringify(response, null, 2));
    
    // Check if response has expected structure
    if (!response || !response.price) {
      throw new Error('Invalid response structure from Binance');
    }
    
    const price = parseFloat(response.price);
    
    if (isNaN(price) || price <= 0) {
      throw new Error('Invalid price value from Binance');
    }
    
    const result = {
      price: price,
      change24h: 0, // Binance simple price API doesn't include 24h change
      timestamp: Date.now(),
      currency: 'USD',
      source: 'binance'
    };

    // Cache the result
    priceCache = {
      data: result,
      timestamp: Date.now(),
      ttl: 15000
    };

    return result;
  } catch (error) {
    console.log('Binance failed:', error.message);
    errors.push(`Binance: ${error.message}`);
  }

  // Try Coinbase as first fallback
  try {
    console.log('Attempting to fetch from Coinbase...');
    const response = await makeHttpRequest(API_ENDPOINTS[1]);
    
    console.log('Coinbase response:', JSON.stringify(response, null, 2));
    
    // Check if response has expected structure
    if (!response || !response.data || !response.data.rates || !response.data.rates.USD) {
      throw new Error('Invalid response structure from Coinbase');
    }
    
    const btcRate = parseFloat(response.data.rates.USD);
    
    if (isNaN(btcRate) || btcRate <= 0) {
      throw new Error('Invalid price value from Coinbase');
    }
    
    const result = {
      price: btcRate,
      change24h: 0, // Coinbase API doesn't provide 24h change
      timestamp: Date.now(),
      currency: 'USD',
      source: 'coinbase'
    };

    // Cache the result
    priceCache = {
      data: result,
      timestamp: Date.now(),
      ttl: 15000
    };

    return result;
  } catch (error) {
    console.log('Coinbase failed:', error.message);
    errors.push(`Coinbase: ${error.message}`);
  }

  // Try CoinGecko as last resort
  try {
    console.log('Attempting to fetch from CoinGecko...');
    const response = await makeHttpRequest(API_ENDPOINTS[2]);
    
    console.log('CoinGecko response:', JSON.stringify(response, null, 2));
    
    // Check if response has expected structure
    if (!response || !response.bitcoin || typeof response.bitcoin.usd !== 'number') {
      throw new Error('Invalid response structure from CoinGecko');
    }
    
    const price = response.bitcoin.usd;
    const change24h = response.bitcoin.usd_24h_change || 0;
    
    const result = {
      price: price,
      change24h: change24h,
      timestamp: Date.now(),
      currency: 'USD',
      source: 'coingecko'
    };

    // Cache the result
    priceCache = {
      data: result,
      timestamp: Date.now(),
      ttl: 15000
    };

    return result;
  } catch (error) {
    console.log('CoinGecko failed:', error.message);
    errors.push(`CoinGecko: ${error.message}`);
  }

  // If all APIs fail, try to return stale cache if available
  if (priceCache.data && (Date.now() - priceCache.timestamp) < 300000) { // 5 minutes
    console.log('All APIs failed, returning stale cache');
    return {
      ...priceCache.data,
      stale: true,
      timestamp: Date.now()
    };
  }

  // All options exhausted
  throw new Error(`All price sources failed: ${errors.join(', ')}`);
}

exports.handler = async (event) => {
  // Handle CORS preflight requests
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type,X-Amz-Date,Authorization,X-Api-Key,X-Amz-Security-Token',
        'Access-Control-Allow-Methods': 'OPTIONS,POST,GET'
      },
      body: JSON.stringify({ message: 'CORS preflight handled' })
    };
  }

  try {
    const priceData = await fetchBitcoinPriceWithFallback();
    const version = API_CONFIG.CURRENT_VERSION;
    const versionConfig = API_CONFIG.VERSIONS[version];
    
    return {
      statusCode: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Content-Type': 'application/json',
        'Cache-Control': 'max-age=30', // Client can cache for 30 seconds
        'X-API-Version': version,
        'X-API-Deprecated': versionConfig.DEPRECATED.toString()
      },
      body: JSON.stringify({
        ...priceData,
        _metadata: {
          version: version,
          deprecated: versionConfig.DEPRECATED,
          sunset_date: versionConfig.SUNSET_DATE
        }
      })
    };

  } catch (error) {
    console.error('Error fetching Bitcoin price:', error);
    const version = API_CONFIG.CURRENT_VERSION;
    const versionConfig = API_CONFIG.VERSIONS[version];
    
    return {
      statusCode: 503, // Service Unavailable
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Content-Type': 'application/json',
        'Retry-After': '60', // Suggest client retry after 60 seconds
        'X-API-Version': version,
        'X-API-Deprecated': versionConfig.DEPRECATED.toString()
      },
      body: JSON.stringify({ 
        error: "Bitcoin price service temporarily unavailable",
        details: error.message,
        retryAfter: 60,
        _metadata: {
          version: version,
          deprecated: versionConfig.DEPRECATED,
          sunset_date: versionConfig.SUNSET_DATE
        }
      })
    };
  }
}; 