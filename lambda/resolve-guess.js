const { DynamoDBClient } = require('@aws-sdk/client-dynamodb');
const { DynamoDBDocumentClient, GetCommand, PutCommand, DeleteCommand, UpdateCommand } = require('@aws-sdk/lib-dynamodb');

const client = new DynamoDBClient({ region: process.env.AWS_REGION });
const docClient = DynamoDBDocumentClient.from(client);

const ACTIVE_GUESSES_TABLE = process.env.ACTIVE_GUESSES_TABLE;
const USER_SCORES_TABLE = process.env.USER_SCORES_TABLE;

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
    const { userId, guessId, currentPrice } = body;

    if (!userId || !guessId || !currentPrice) {
      return {
        statusCode: 400,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ error: "Missing required data" })
      };
    }

    // Get the active guess
    const getGuessCommand = new GetCommand({
      TableName: ACTIVE_GUESSES_TABLE,
      Key: { userId }
    });
    
    const guessResult = await docClient.send(getGuessCommand);
    
    if (!guessResult.Item || guessResult.Item.id !== guessId) {
      return {
        statusCode: 404,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ error: "Active guess not found" })
      };
    }

    const guess = guessResult.Item;
    const startPrice = guess.startPrice;
    const direction = guess.direction;
    const isCorrect = (direction === 'up' && currentPrice > startPrice) || 
                     (direction === 'down' && currentPrice < startPrice);
    
    const score = isCorrect ? 1 : -1;
    const resolvedTimestamp = Date.now();
    const duration = resolvedTimestamp - guess.timestamp;
    
    // Update user score
    try {
      // Get current score
      const getScoreCommand = new GetCommand({
        TableName: USER_SCORES_TABLE,
        Key: { userId }
      });
      
      const scoreResult = await docClient.send(getScoreCommand);
      let currentScore = scoreResult.Item || {
        userId,
        score: 0
      };
      
      // Update score - only track points
      const newScore = {
        userId,
        score: currentScore.score + score,
        updatedAt: new Date().toISOString()
      };
      
      const putScoreCommand = new PutCommand({
        TableName: USER_SCORES_TABLE,
        Item: newScore
      });
      
      await docClient.send(putScoreCommand);
      
    } catch (scoreError) {
      console.error('Error updating score:', scoreError);
      // Continue even if score update fails
    }
    
    // Remove from active guesses
    const deleteCommand = new DeleteCommand({
      TableName: ACTIVE_GUESSES_TABLE,
      Key: { userId }
    });
    
    await docClient.send(deleteCommand);
    
    return {
      statusCode: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        success: true,
        result: {
          isCorrect,
          score,
          startPrice,
          endPrice: currentPrice,
          direction,
          duration
        }
      })
    };

  } catch (error) {
    console.error('Error resolving guess:', error);
    
    return {
      statusCode: 500,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ error: "Failed to resolve guess" })
    };
  }
}; 