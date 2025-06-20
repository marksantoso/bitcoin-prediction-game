const { DynamoDBClient } = require('@aws-sdk/client-dynamodb');
const { DynamoDBDocumentClient, GetCommand, UpdateCommand, TransactWriteCommand } = require('@aws-sdk/lib-dynamodb');

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
        'Access-Control-Allow-Headers': 'Content-Type,X-Amz-Date,Authorization,X-Api-Key,X-Amz-Security-Token,X-Requested-With',
        'Access-Control-Allow-Methods': 'OPTIONS,GET,POST',
        'Access-Control-Expose-Headers': '*',
        'Content-Type': 'application/json'
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
          'Access-Control-Allow-Headers': 'Content-Type,X-Amz-Date,Authorization,X-Api-Key,X-Amz-Security-Token,X-Requested-With',
          'Access-Control-Allow-Methods': 'OPTIONS,GET,POST',
          'Access-Control-Expose-Headers': '*',
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
          'Access-Control-Allow-Headers': 'Content-Type,X-Amz-Date,Authorization,X-Api-Key,X-Amz-Security-Token,X-Requested-With',
          'Access-Control-Allow-Methods': 'OPTIONS,GET,POST',
          'Access-Control-Expose-Headers': '*',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ error: "Active guess not found" })
      };
    }

    const guess = guessResult.Item;
    const startPrice = guess.startPrice;
    const direction = guess.direction;
    
    // Determine if the user's guess was correct
    const isCorrect = (direction === 'up' && currentPrice > startPrice) || 
                     (direction === 'down' && currentPrice < startPrice);
    
    const score = isCorrect ? 1 : -1;
    const resolvedTimestamp = Date.now();
    const duration = resolvedTimestamp - guess.timestamp;

    try {
      // Use a transaction to atomically update score and delete guess
      const transactCommand = new TransactWriteCommand({
        TransactItems: [
          {
            // Update the score atomically
            Update: {
              TableName: USER_SCORES_TABLE,
              Key: { userId },
              UpdateExpression: 'SET score = if_not_exists(score, :zero) + :scoreChange, updatedAt = :timestamp',
              ExpressionAttributeValues: {
                ':zero': 0,
                ':scoreChange': score,
                ':timestamp': new Date().toISOString()
              },
              // Create the item if it doesn't exist
              ConditionExpression: 'attribute_not_exists(userId) OR attribute_exists(userId)'
            }
          },
          {
            // Delete the active guess with condition
            Delete: {
              TableName: ACTIVE_GUESSES_TABLE,
              Key: { userId },
              // Ensure we're deleting the correct guess
              ConditionExpression: 'id = :guessId',
              ExpressionAttributeValues: {
                ':guessId': guessId
              }
            }
          }
        ]
      });

      await docClient.send(transactCommand);

      // Get the updated score after the transaction
      const getUpdatedScore = new GetCommand({
        TableName: USER_SCORES_TABLE,
        Key: { userId }
      });
      
      const updatedScoreResult = await docClient.send(getUpdatedScore);
      const currentScore = updatedScoreResult.Item?.score || score;

      return {
        statusCode: 200,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Headers': 'Content-Type,X-Amz-Date,Authorization,X-Api-Key,X-Amz-Security-Token,X-Requested-With',
          'Access-Control-Allow-Methods': 'OPTIONS,GET,POST',
          'Access-Control-Expose-Headers': '*',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          success: true,
          result: {
            isCorrect,
            score: currentScore,
            startPrice,
            endPrice: currentPrice,
            direction,
            duration
          }
        })
      };

    } catch (error) {
      // Check if this was a condition failure
      if (error.name === 'TransactionCanceledException') {
        return {
          statusCode: 409,
          headers: {
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Headers': 'Content-Type,X-Amz-Date,Authorization,X-Api-Key,X-Amz-Security-Token,X-Requested-With',
            'Access-Control-Allow-Methods': 'OPTIONS,GET,POST',
            'Access-Control-Expose-Headers': '*',
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ error: "Guess has already been resolved" })
        };
      }
      throw error; // Re-throw other errors to be caught by outer catch block
    }

  } catch (error) {
    console.error('Error resolving guess:', error);
    
    return {
      statusCode: 500,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type,X-Amz-Date,Authorization,X-Api-Key,X-Amz-Security-Token,X-Requested-With',
        'Access-Control-Allow-Methods': 'OPTIONS,GET,POST',
        'Access-Control-Expose-Headers': '*',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ error: "Failed to resolve guess" })
    };
  }
}; 