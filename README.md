# Bitcoin Price Guessing Game

A simple web application where users can guess whether Bitcoin's price will go up or down after 60 seconds.

🎮 **[Live Demo](https://bitcoin-prediction-game-ycvs.vercel.app/)**

## Features

- ✅ Real-time Bitcoin price via Binance WebSocket stream
- ✅ Automatic WebSocket reconnection with exponential backoff
- ✅ 60-second guess resolution
- ✅ +1 point for correct guesses, -1 for incorrect
- ✅ Only one guess at a time
- ✅ Score persistence with AWS DynamoDB
- ✅ User sessions persist across browser sessions
- ✅ TanStack Query for optimistic updates and real-time data
- ✅ Serverless architecture with AWS Lambda

## Tech Stack

**Frontend:**
- Next.js 14
- React 18
- TypeScript
- TanStack Query v5 (data fetching)
- Material UI v5 (UI components)
- Lucide React (Icons)
- TradingView Widgets
- Jest & React Testing Library (Testing)

**Backend:**
- AWS Lambda (Serverless functions)
- AWS API Gateway (REST API)
- AWS DynamoDB (Database)
- Terraform (Infrastructure as Code)

## Project Structure

```
bitcoin/
├── src/                  # Frontend source
│   ├── app/              # Next.js app directory
│   ├── components/       # React components
│   ├── config/           # Configuration
│   ├── hooks/            # Custom React hooks
│   ├── lib/              # Utility functions
│   ├── providers/        # React context providers
│   ├── services/         # API services
│   ├── styles/           # Global styles
│   ├── test-utils/       # Testing utilities
│   └── types/            # TypeScript types
├── lambda/               # AWS Lambda functions
│   ├── active-guess.js   # Get active guess
│   ├── btc-price.js      # Get Bitcoin price
│   ├── config.js         # Lambda configuration
│   ├── index.js          # Main Lambda handler
│   ├── resolve-guess.js  # Resolve completed guess
│   └── score.js          # Get user score
├── terraform/            # Infrastructure as Code
├── public/              # Static assets
├── styles/              # Additional styles
├── deploy.sh            # Deployment script
└── jest.config.js       # Jest testing configuration
```

## Quick Start

### 1. Clone the Repository

```bash
git clone <repository-url>
cd bitcoin
```

### 2. Deploy everything (Lambda packaging + AWS infrastructure)

```bash
# Deploy everything (Lambda packaging + AWS infrastructure)
./deploy.sh
```

### 3. Configure Frontend

Create `.env.local` file:

```bash
# Use deployed AWS infrastructure
NEXT_PUBLIC_API_BASE_URL=https://your-api-id.execute-api.us-east-1.amazonaws.com/prod
```

### 4. Run Frontend

```bash
yarn install
yarn dev
```

## Deployed AWS Infrastructure

### API Endpoints
- **Make Guess**: `POST /api/make-guess`
- **Active Guess**: `GET /api/active-guess?userId={userId}`
- **Score**: `GET /api/score?userId={userId}`
- **Resolve Guess**: `POST /api/resolve-guess`
- **Bitcoin Price**: `POST /api/btc-price`

### AWS Resources
- **Lambda Functions**: 5 serverless functions for game logic
- **API Gateway**: REST API with CORS enabled
- **DynamoDB Tables**: 
  - `active-guesses` - Current user guesses
  - `user-scores` - User score tracking
- **CloudWatch**: Logging for all Lambda functions
- **IAM**: Least-privilege roles and policies

## Game Rules

1. **Make a Guess**: Choose if Bitcoin price will go UP or DOWN
2. **Wait 60 Seconds**: Guesses resolve automatically after 60 seconds with a price change
3. **Scoring**: 
   - Correct guess: +1 point
   - Wrong guess: -1 point
4. **One at a Time**: Only one active guess allowed per user
5. **Persistence**: Scores are saved and restored across sessions

## Development

### Local Development
```bash
npm run dev
```

Visit http://localhost:3000

## Infrastructure Management


## Architecture

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Frontend      │    │   AWS Lambda    │    │   DynamoDB      │
│   (Next.js)     │◄──►│   + API Gateway │◄──►│   (Serverless)  │
│                 │    │                 │    │                 │
│ • React UI      │    │ • 5 Functions   │    │ • active-guess  │
│ • TanStack      │    │ • Game Logic    │    │ • user-scores   │
│ • Real-time WS  │    │ • CORS Enabled  │    │                 │
└─────────────────┘    └─────────────────┘    └─────────────────┘
         ▲
         │
         └─────────────────┐
                           │
                      Binance WS
                    (BTC/USDT Feed)
```

## WebSocket Implementation

The application connects to Binance's WebSocket stream (`wss://stream.binance.com:9443/ws/btcusdt@trade`) to receive real-time Bitcoin price updates. Features include:

- Real-time BTC/USDT price updates
- Automatic reconnection with exponential backoff
- Maximum 5 reconnection attempts
- Connection status logging
- Error handling and recovery
- Singleton pattern for WebSocket management

### Testing

Run the test suite:
```bash
# Run tests
yarn test

# Run tests in watch mode
yarn test:watch

# Run tests with coverage
yarn test:coverage
```
