# Bitcoin Price Guess Game - Terraform Infrastructure

This Terraform configuration deploys a complete serverless backend for the Bitcoin price guessing game on AWS.

## Architecture

The infrastructure includes:

### API Gateway Endpoints
- `POST /api/make-guess` - Create a new price guess
- `GET /api/active-guess?userId={userId}` - Get user's active guess
- `GET /api/score?userId={userId}` - Get user's score and statistics  
- `GET /api/btc-price` - Get current Bitcoin price
- `POST /api/resolve-guess` - Resolve an active guess

### Lambda Functions
- **make-guess** - Handles creating new guesses
- **active-guess** - Retrieves active guesses for users
- **score** - Manages user scoring and statistics
- **btc-price** - Fetches live Bitcoin prices from CoinGecko API
- **resolve-guess** - Resolves guesses and updates scores

### DynamoDB Tables
- **active-guesses** - Stores currently active guesses (with TTL)
- **guess-history** - Historical record of all guesses
- **user-scores** - User statistics and scoring data

## Prerequisites

1. **AWS CLI** configured with appropriate credentials
2. **Terraform** >= 1.0 installed
3. **Node.js** for packaging Lambda functions

## Deployment

### 1. Package Lambda Functions

From the bitcoin project root, run the packaging script:

```bash
./deploy-lambdas.sh
```

This will create zip files for all Lambda functions in the `terraform/` directory.

### 2. Configure Variables

Copy the example variables file and customize:

```bash
cd terraform
cp terraform.tfvars.example terraform.tfvars
```

Edit `terraform.tfvars` with your desired values:

```hcl
aws_region = "us-east-1"
project_name = "bitcoin-guess"
environment = "dev"
api_stage_name = "dev"
lambda_runtime = "nodejs18.x"
lambda_timeout = 30
lambda_memory_size = 128
dynamodb_billing_mode = "PAY_PER_REQUEST"
```

### 3. Deploy Infrastructure

```bash
# Initialize Terraform
terraform init

# Review the deployment plan
terraform plan

# Deploy the infrastructure
terraform apply
```

### 4. Get API Endpoints

After deployment, get your API endpoints:

```bash
terraform output
```

## API Usage

### Make a Guess
```bash
curl -X POST "https://YOUR_API_ID.execute-api.REGION.amazonaws.com/dev/api/make-guess" \
  -H "Content-Type: application/json" \
  -d '{
    "userId": "user123",
    "direction": "up",
    "currentPrice": 45000
  }'
```

### Get Active Guess
```bash
curl "https://YOUR_API_ID.execute-api.REGION.amazonaws.com/dev/api/active-guess?userId=user123"
```

### Get User Score
```bash
curl "https://YOUR_API_ID.execute-api.REGION.amazonaws.com/dev/api/score?userId=user123"
```

### Get Bitcoin Price
```bash
curl "https://YOUR_API_ID.execute-api.REGION.amazonaws.com/dev/api/btc-price"
```

### Resolve Guess
```bash
curl -X POST "https://YOUR_API_ID.execute-api.REGION.amazonaws.com/dev/api/resolve-guess" \
  -H "Content-Type: application/json" \
  -d '{
    "userId": "user123",
    "guessId": "guess_id_from_active_guess",
    "currentPrice": 46000
  }'
```

## Data Models

### Active Guess
```json
{
  "userId": "string",
  "id": "string",
  "direction": "up|down",
  "startPrice": "number",
  "timestamp": "number",
  "timeRemaining": "number",
  "expiresAt": "number"
}
```

### User Score
```json
{
  "userId": "string",
  "score": "number",
  "lastUpdated": "number"
}
```

### Guess History
```json
{
  "guessId": "string",
  "userId": "string",
  "direction": "up|down",
  "startPrice": "number",
  "endPrice": "number",
  "timestamp": "number",
  "isCorrect": "boolean",
  "points": "number",
  "duration": "number"
}
```

## Cleanup

To destroy all infrastructure:

```bash
terraform destroy
```

## Costs

This infrastructure uses AWS's pay-per-use services:
- **API Gateway**: $3.50 per million requests
- **Lambda**: $0.20 per million requests + compute time
- **DynamoDB**: Pay per read/write operations
- **CloudWatch**: Log storage and monitoring

Estimated monthly cost for moderate usage: $5-20

## Security

- All Lambda functions use least-privilege IAM roles
- CORS is configured for web application access
- No authentication is implemented (add API Gateway authorizers for production)

## Monitoring

CloudWatch logs are enabled for all Lambda functions with 14-day retention. Monitor:
- API Gateway request/error rates
- Lambda execution duration and errors
- DynamoDB read/write capacity utilization

## Troubleshooting

### Lambda Function Errors
Check CloudWatch logs:
```bash
aws logs tail /aws/lambda/FUNCTION_NAME --follow
```

### API Gateway Issues
- Verify CORS headers in responses
- Check API Gateway execution role permissions
- Validate request/response mapping

### DynamoDB Access Issues
- Verify Lambda execution role has DynamoDB permissions
- Check table names in environment variables 