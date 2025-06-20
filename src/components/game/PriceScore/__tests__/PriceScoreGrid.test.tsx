import { render, screen } from '../../../../test-utils/setup';
import PriceScoreGrid from '../PriceScoreGrid';
import { useBitcoinPrice } from '@/hooks/bitcoin/useBitcoinData';
import { useUserScore } from '@/hooks/bitcoin/useUserScore';
import { useBitcoinUtils } from '@/hooks/bitcoin/useBitcoinUtils';

// Mock the hooks
jest.mock('@/hooks/bitcoin/useBitcoinData', () => ({
  useBitcoinPrice: jest.fn()
}));

jest.mock('@/hooks/bitcoin/useUserScore', () => ({
  useUserScore: jest.fn()
}));

jest.mock('@/hooks/bitcoin/useBitcoinUtils', () => ({
  useBitcoinUtils: jest.fn()
}));

describe('PriceScoreGrid', () => {
  const mockUserId = 'test-user-id';
  const mockPrice = {
    price: 50000,
    timestamp: Date.now()
  };

  const mockScore = {
    userId: mockUserId,
    score: 100,
    correctGuesses: 5,
    totalGuesses: 10
  };

  beforeEach(() => {
    // Mock formatPrice function
    (useBitcoinUtils as jest.Mock).mockReturnValue({
      formatPrice: (price: number) => `$${price.toLocaleString()}`
    });

    // Mock price and score hooks
    (useBitcoinPrice as jest.Mock).mockReturnValue({
      data: mockPrice,
      isLoading: false,
      error: null
    });

    (useUserScore as jest.Mock).mockReturnValue({
      data: mockScore,
      isLoading: false,
      error: null
    });
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('displays formatted price when data is available', () => {
    render(<PriceScoreGrid userId={mockUserId} />);
    expect(screen.getByText('$50,000')).toBeInTheDocument();
  });

  it('displays user score when data is available', () => {
    render(<PriceScoreGrid userId={mockUserId} />);
    expect(screen.getByText('100')).toBeInTheDocument();
  });

  it('displays loading state when fetching price', () => {
    (useBitcoinPrice as jest.Mock).mockReturnValue({
      data: null,
      isLoading: true,
      error: null
    });

    render(<PriceScoreGrid userId={mockUserId} />);
    expect(screen.getByText('Loading...')).toBeInTheDocument();
    expect(screen.getByText('Fetching live price...')).toBeInTheDocument();
  });

  it('displays error state when price fetch fails', () => {
    (useBitcoinPrice as jest.Mock).mockReturnValue({
      data: null,
      isLoading: false,
      error: new Error('Failed to fetch price')
    });

    render(<PriceScoreGrid userId={mockUserId} />);
    expect(screen.getByText('Error')).toBeInTheDocument();
    expect(screen.getByText('Failed to load price data')).toBeInTheDocument();
  });

  it('displays no data state when price is unavailable', () => {
    (useBitcoinPrice as jest.Mock).mockReturnValue({
      data: null,
      isLoading: false,
      error: null
    });

    render(<PriceScoreGrid userId={mockUserId} />);
    expect(screen.getByText('No data')).toBeInTheDocument();
    expect(screen.getByText('Price data unavailable')).toBeInTheDocument();
  });

  // Edge Cases
  it('handles extremely large price values correctly', () => {
    const largePrice = {
      price: 1000000000000, // 1 trillion
      timestamp: Date.now()
    };
    
    (useBitcoinPrice as jest.Mock).mockReturnValue({
      data: largePrice,
      isLoading: false,
      error: null
    });

    render(<PriceScoreGrid userId={mockUserId} />);
    expect(screen.getByText('$1,000,000,000,000')).toBeInTheDocument();
  });

  it('handles negative score values correctly', () => {
    const negativeScore = {
      ...mockScore,
      score: -50
    };

    (useUserScore as jest.Mock).mockReturnValue({
      data: negativeScore,
      isLoading: false,
      error: null
    });

    render(<PriceScoreGrid userId={mockUserId} />);
    expect(screen.getByText('-50')).toBeInTheDocument();
    expect(screen.getByText('Points')).toBeInTheDocument();
  });

  it('handles concurrent loading states', () => {
    (useBitcoinPrice as jest.Mock).mockReturnValue({
      data: null,
      isLoading: true,
      error: null
    });

    (useUserScore as jest.Mock).mockReturnValue({
      data: null,
      isLoading: true,
      error: null
    });

    render(<PriceScoreGrid userId={mockUserId} />);
    expect(screen.getByText('Loading...')).toBeInTheDocument();
    expect(screen.getByText('Fetching score...')).toBeInTheDocument();
  });

  it('handles null userId correctly', () => {
    (useUserScore as jest.Mock).mockReturnValue({
      data: null,
      isLoading: false,
      error: null
    });

    render(<PriceScoreGrid userId={null} />);
    expect(screen.getByText('0')).toBeInTheDocument(); // Should show default score
  });

  it('handles invalid price data format', () => {
    const invalidPrice = {
      price: NaN,
      timestamp: Date.now()
    };

    (useBitcoinPrice as jest.Mock).mockReturnValue({
      data: invalidPrice,
      isLoading: false,
      error: null
    });

    render(<PriceScoreGrid userId={mockUserId} />);
    expect(screen.getByText('$NaN')).toBeInTheDocument();
  });
}); 