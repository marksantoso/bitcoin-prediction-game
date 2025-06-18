const { DynamoDBClient } = require('@aws-sdk/client-dynamodb');
const { DynamoDBDocumentClient, GetCommand, PutCommand } = require('@aws-sdk/lib-dynamodb');
const { GAME_CONFIG } = require('./config');

const client = new DynamoDBClient({ region: process.env.AWS_REGION });
const docClient = DynamoDBDocumentClient.from(client);

const ACTIVE_GUESSES_TABLE = process.env.ACTIVE_GUESSES_TABLE;

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
    const body = JSON.parse(event.body);
    const { userId, direction, currentPrice } = body;

    // Validate required fields: userId, direction, and currentPrice must be present in the request body
    if (!userId || !direction || !currentPrice) {
      return {
        statusCode: 400,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ error: "Missing required data" })
      };
    }

    // Check if user already has an active guess
    try {
      const getCommand = new GetCommand({
        TableName: ACTIVE_GUESSES_TABLE,
        Key: { userId }
      });
      
      const existingGuess = await docClient.send(getCommand);
      
      if (existingGuess.Item) {
        return {
          statusCode: 400,
          headers: {
            'Access-Control-Allow-Origin': '*',
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ error: "You already have an active guess" })
        };
      }
    } catch (error) {
      console.error('Error checking existing guess:', error);
    }

    // Generate a unique guess ID, set timestamps, and prepare the active guess object for storage.
    const guessId = Math.random().toString(36).substring(2, 15);
    const timestamp = Date.now();
    const timeRemaining = GAME_CONFIG.guessResolutionTime; // Time (ms) before guess can be resolved
    const expiresAt = Math.floor((timestamp + timeRemaining) / 1000); // DynamoDB TTL in seconds

    const activeGuess = {
      userId,
      id: guessId,
      direction,
      startPrice: currentPrice,
      timestamp,
      expiresAt
    };

    // Store the new active guess in the DynamoDB table
    const putCommand = new PutCommand({
      TableName: ACTIVE_GUESSES_TABLE,
      Item: activeGuess
    });

    await docClient.send(putCommand);

    return {
      statusCode: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        success: true,
        activeGuess
      })
    };

  } catch (error) {
    console.error('Error processing request:', error);
    
    return {
      statusCode: 500,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ error: "Failed to make guess" })
    };
  }
}; 