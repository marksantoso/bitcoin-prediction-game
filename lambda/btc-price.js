const https = require('https');

// Multiple API endpoints for fallback
const API_ENDPOINTS = [
  'https://api.coinbase.com/v2/exchange-rates?currency=BTC',
  'https://api.coingecko.com/api/v3/simple/price?ids=bitcoin&vs_currencies=usd&include_24hr_change=true',
  'https://api.binance.com/api/v3/ticker/price?symbol=BTCUSDT'
];

// Simple in-memory cache (in production, use Redis or DynamoDB)
let priceCache = {
  data: null,
  timestamp: 0,
  ttl: 15000 // 15 second TTL
};

function makeHttpRequest(url, timeout = 5000) {
  return new Promise((resolve, reject) => {
    const request = https.get(url, {
      timeout: timeout,
      headers: {
        'User-Agent': 'Bitcoin-Price-Lambda/1.0'
      }
    }, (res) => {
      let data = '';
      
      res.on('data', (chunk) => {
        data += chunk;
      });
      
      res.on('end', () => {
        try {
          const parsed = JSON.parse(data);
          resolve(parsed);
        } catch (error) {
          reject(new Error(`Failed to parse JSON: ${error.message}`));
        }
      });
    });

    request.on('timeout', () => {
      request.destroy();
      reject(new Error('Request timeout'));
    });

    request.on('error', (error) => {
      reject(error);
    });
  });
}

// Try multiple APIs with fallback
async function fetchBitcoinPriceWithFallback() {
  const errors = [];

  // Check cache first
  if (priceCache.data && (Date.now() - priceCache.timestamp) < priceCache.ttl) {
    console.log('Returning cached Bitcoin price');
    return priceCache.data;
  }

  // Try Coinbase first (primary)
  try {
    console.log('Attempting to fetch from Coinbase...');
    const response = await makeHttpRequest(API_ENDPOINTS[0]);
    
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

  // Try CoinGecko as fallback
  try {
    console.log('Attempting to fetch from CoinGecko...');
    const response = await makeHttpRequest(API_ENDPOINTS[1]);
    
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

  // Try Binance as last resort
  try {
    console.log('Attempting to fetch from Binance...');
    const response = await makeHttpRequest(API_ENDPOINTS[2]);
    
    const price = parseFloat(response.price);
    
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
    
    return {
      statusCode: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Content-Type': 'application/json',
        'Cache-Control': 'max-age=30', // Client can cache for 30 seconds
        'X-API-Version': 'v1',
        'X-API-Deprecated': 'false'
      },
      body: JSON.stringify({
        ...priceData,
        _metadata: {
          version: 'v1',
          deprecated: false,
          sunset_date: null
        }
      })
    };

  } catch (error) {
    console.error('Error fetching Bitcoin price:', error);
    
    return {
      statusCode: 503, // Service Unavailable
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Content-Type': 'application/json',
        'Retry-After': '60', // Suggest client retry after 60 seconds
        'X-API-Version': 'v1',
        'X-API-Deprecated': 'false'
      },
      body: JSON.stringify({ 
        error: "Bitcoin price service temporarily unavailable",
        details: error.message,
        retryAfter: 60,
        _metadata: {
          version: 'v1',
          deprecated: false,
          sunset_date: null
        }
      })
    };
  }
}; 