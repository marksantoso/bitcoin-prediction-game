const { DynamoDBClient } = require('@aws-sdk/client-dynamodb');
const { DynamoDBDocumentClient, GetCommand, PutCommand } = require('@aws-sdk/lib-dynamodb');

const client = new DynamoDBClient({ region: process.env.AWS_REGION });
const docClient = DynamoDBDocumentClient.from(client);

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
    const userId = event.queryStringParameters?.userId;

    if (!userId) {
      return {
        statusCode: 400,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ error: "Missing userId parameter" })
      };
    }

    // Get user score
    const getCommand = new GetCommand({
      TableName: USER_SCORES_TABLE,
      Key: { userId }
    });
    
    const result = await docClient.send(getCommand);
    
    // If user doesn't exist, create them with default values
    if (!result.Item) {
      const defaultScore = {
        userId,
        score: 0,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      
      // Create the user in DynamoDB
      const putCommand = new PutCommand({
        TableName: USER_SCORES_TABLE,
        Item: defaultScore,
        ConditionExpression: 'attribute_not_exists(userId)' // Only create if doesn't exist
      });
      
      try {
        await docClient.send(putCommand);
        
        return {
          statusCode: 200,
          headers: {
            'Access-Control-Allow-Origin': '*',
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(defaultScore)
        };
      } catch (putError) {
        // If creation failed due to race condition (user was created by another request), 
        // try to get the user again
        if (putError.name === 'ConditionalCheckFailedException') {
          const retryResult = await docClient.send(getCommand);
          return {
            statusCode: 200,
            headers: {
              'Access-Control-Allow-Origin': '*',
              'Content-Type': 'application/json'
            },
            body: JSON.stringify(retryResult.Item)
          };
        }
        throw putError;
      }
    }
    
    return {
      statusCode: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(result.Item)
    };

  } catch (error) {
    console.error('Error getting/creating user score:', error);
    
    return {
      statusCode: 500,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ error: "Failed to get user score" })
    };
  }
}; 