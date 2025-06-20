import { render, screen, fireEvent, act } from '../../../../test-utils/setup';
import PredictionButtons from '../PredictionCard';
import { useMakeGuess } from '@/hooks/bitcoin/useBitcoinData';

// Mock the hooks
jest.mock('@/hooks/bitcoin/useBitcoinData', () => ({
  useMakeGuess: jest.fn()
}));

describe('PredictionButtons', () => {
  const mockUserId = 'test-user-id';
  const mockCurrentPrice = {
    price: 50000,
    timestamp: Date.now()
  };

  // Mock console.error for all tests
  const originalConsoleError = console.error;
  beforeAll(() => {
    console.error = jest.fn();
  });

  afterAll(() => {
    console.error = originalConsoleError;
  });

  beforeEach(() => {
    // Reset mock implementation before each test
    (useMakeGuess as jest.Mock).mockReturnValue({
      mutateAsync: jest.fn(),
      isPending: false
    });
    // Clear console.error mock
    (console.error as jest.Mock).mockClear();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('calls makeGuess with UP direction when clicking up button', () => {
    const mockMutateAsync = jest.fn();
    (useMakeGuess as jest.Mock).mockReturnValue({
      mutateAsync: mockMutateAsync,
      isPending: false
    });

    render(
      <PredictionButtons
        currentPrice={mockCurrentPrice}
        userId={mockUserId}
        isLoading={false}
      />
    );

    fireEvent.click(screen.getByText('Price will go UP'));

    expect(mockMutateAsync).toHaveBeenCalledWith({
      userId: mockUserId,
      direction: 'up',
      currentPrice: mockCurrentPrice.price
    });
  });

  it('calls makeGuess with DOWN direction when clicking down button', () => {
    const mockMutateAsync = jest.fn();
    (useMakeGuess as jest.Mock).mockReturnValue({
      mutateAsync: mockMutateAsync,
      isPending: false
    });

    render(
      <PredictionButtons
        currentPrice={mockCurrentPrice}
        userId={mockUserId}
        isLoading={false}
      />
    );

    fireEvent.click(screen.getByText('Price will go DOWN'));

    expect(mockMutateAsync).toHaveBeenCalledWith({
      userId: mockUserId,
      direction: 'down',
      currentPrice: mockCurrentPrice.price
    });
  });

  it('does not call makeGuess when no userId is provided', () => {
    const mockMutateAsync = jest.fn();
    (useMakeGuess as jest.Mock).mockReturnValue({
      mutateAsync: mockMutateAsync,
      isPending: false
    });

    render(
      <PredictionButtons
        currentPrice={mockCurrentPrice}
        userId={null}
        isLoading={false}
      />
    );

    fireEvent.click(screen.getByText('Price will go UP'));
    fireEvent.click(screen.getByText('Price will go DOWN'));

    expect(mockMutateAsync).not.toHaveBeenCalled();
  });

  it('does not call makeGuess when no current price is provided', () => {
    const mockMutateAsync = jest.fn();
    (useMakeGuess as jest.Mock).mockReturnValue({
      mutateAsync: mockMutateAsync,
      isPending: false
    });

    render(
      <PredictionButtons
        currentPrice={undefined}
        userId={mockUserId}
        isLoading={false}
      />
    );

    fireEvent.click(screen.getByText('Price will go UP'));
    fireEvent.click(screen.getByText('Price will go DOWN'));

    expect(mockMutateAsync).not.toHaveBeenCalled();
  });

  it('does not call makeGuess while loading', () => {
    const mockMutateAsync = jest.fn();
    (useMakeGuess as jest.Mock).mockReturnValue({
      mutateAsync: mockMutateAsync,
      isPending: false
    });

    render(
      <PredictionButtons
        currentPrice={mockCurrentPrice}
        userId={mockUserId}
        isLoading={true}
      />
    );

    fireEvent.click(screen.getByText('Price will go UP'));
    fireEvent.click(screen.getByText('Price will go DOWN'));

    expect(mockMutateAsync).not.toHaveBeenCalled();
  });

  // Edge Cases
  it('handles rapid button clicks correctly', () => {
    const mockMutateAsync = jest.fn();
    (useMakeGuess as jest.Mock).mockReturnValue({
      mutateAsync: mockMutateAsync,
      isPending: false
    });

    render(
      <PredictionButtons
        currentPrice={mockCurrentPrice}
        userId={mockUserId}
        isLoading={false}
      />
    );

    // Simulate rapid clicks
    act(() => {
      for (let i = 0; i < 5; i++) {
        fireEvent.click(screen.getByText('Price will go UP'));
      }
    });

    // Should only call mutate once per click
    expect(mockMutateAsync).toHaveBeenCalledTimes(5);
  });

  it('handles mutation errors gracefully', async () => {
    const mockMutateAsync = jest.fn().mockRejectedValue(new Error('Network error'));
    (useMakeGuess as jest.Mock).mockReturnValue({
      mutateAsync: mockMutateAsync,
      isPending: false,
      error: new Error('Network error')
    });

    render(
      <PredictionButtons
        currentPrice={mockCurrentPrice}
        userId={mockUserId}
        isLoading={false}
      />
    );

    await act(async () => {
      fireEvent.click(screen.getByText('Price will go UP'));
    });
    
    expect(mockMutateAsync).toHaveBeenCalledTimes(1);
    expect(mockMutateAsync).toHaveBeenCalledWith({
      userId: mockUserId,
      direction: 'up',
      currentPrice: mockCurrentPrice.price
    });
    expect(console.error).toHaveBeenCalledWith('Failed to make guess:', expect.any(Error));
  });

  it('handles extremely large price values', () => {
    const mockMutateAsync = jest.fn();
    (useMakeGuess as jest.Mock).mockReturnValue({
      mutateAsync: mockMutateAsync,
      isPending: false
    });

    const largePrice = {
      price: Number.MAX_SAFE_INTEGER,
      timestamp: Date.now()
    };

    render(
      <PredictionButtons
        currentPrice={largePrice}
        userId={mockUserId}
        isLoading={false}
      />
    );

    fireEvent.click(screen.getByText('Price will go UP'));
    expect(mockMutateAsync).toHaveBeenCalledWith({
      userId: mockUserId,
      direction: 'up',
      currentPrice: Number.MAX_SAFE_INTEGER
    });
  });

  it('handles concurrent pending states', () => {
    const mockMutateAsync = jest.fn();
    (useMakeGuess as jest.Mock).mockReturnValue({
      mutateAsync: mockMutateAsync,
      isPending: true
    });

    render(
      <PredictionButtons
        currentPrice={mockCurrentPrice}
        userId={mockUserId}
        isLoading={false}
      />
    );

    // Both buttons should be disabled during pending state
    const upButton = screen.getByText('Price will go UP').closest('button');
    const downButton = screen.getByText('Price will go DOWN').closest('button');
    
    expect(upButton).toBeDisabled();
    expect(downButton).toBeDisabled();
  });

  it('handles invalid userId format', () => {
    const mockMutateAsync = jest.fn();
    (useMakeGuess as jest.Mock).mockReturnValue({
      mutateAsync: mockMutateAsync,
      isPending: false
    });

    render(
      <PredictionButtons
        currentPrice={mockCurrentPrice}
        userId={''}  // Empty string
        isLoading={false}
      />
    );

    fireEvent.click(screen.getByText('Price will go UP'));
    expect(mockMutateAsync).not.toHaveBeenCalled();
  });
}); 