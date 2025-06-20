import { render, screen, act } from '../../../../test-utils/setup';
import ActiveGuessDisplay from '../ActiveGuess';
import { useResolveGuess } from '@/hooks/bitcoin/useBitcoinData';
import { useBitcoinUtils } from '@/hooks/bitcoin/useBitcoinUtils';
import { IGuess } from '@/types/bitcoin.dto';

// Mock the hooks
jest.mock('@/hooks/bitcoin/useBitcoinData', () => ({
  useResolveGuess: jest.fn()
}));

jest.mock('@/hooks/bitcoin/useBitcoinUtils', () => ({
  useBitcoinUtils: jest.fn()
}));

describe('ActiveGuess', () => {
  const mockUserId = 'test-user-id';
  const mockActiveGuess: IGuess = {
    id: 'guess-id',
    userId: mockUserId,
    direction: 'up' as const,
    startPrice: 50000,
    expiresAt: Math.floor((Date.now() + 60000) / 1000), // 60 seconds from now, in seconds
    resolved: false,
    endPrice: undefined,
    endTime: undefined,
    correct: undefined
  };

  const mockCurrentPrice = {
    price: 51000,
    timestamp: Date.now()
  };

  beforeEach(() => {
    // Mock the hooks
    (useResolveGuess as jest.Mock).mockReturnValue({
      mutate: jest.fn(),
      isPending: false
    });

    (useBitcoinUtils as jest.Mock).mockReturnValue({
      formatTime: (ms: number) => `${Math.ceil(ms / 1000)}s`,
      formatPrice: (price: number) => `$${price.toLocaleString()}`
    });

    // Mock requestAnimationFrame
    jest.spyOn(window, 'requestAnimationFrame').mockImplementation((cb: FrameRequestCallback) => {
      cb(0);
      return 0;
    });
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('renders active prediction with UP direction', () => {
    render(
      <ActiveGuessDisplay
        activeGuess={mockActiveGuess}
        currentPrice={mockCurrentPrice}
        userId={mockUserId}
      />
    );

    expect(screen.getByText('Active Prediction')).toBeInTheDocument();
    expect(screen.getByText(/Price will go UP/)).toBeInTheDocument();
    expect(screen.getByText(/Starting price: \$50,000/)).toBeInTheDocument();
  });

  it('renders active prediction with DOWN direction', () => {
    const downGuess: IGuess = { ...mockActiveGuess, direction: 'down' as const };
    render(
      <ActiveGuessDisplay
        activeGuess={downGuess}
        currentPrice={mockCurrentPrice}
        userId={mockUserId}
      />
    );

    expect(screen.getByText(/Price will go DOWN/)).toBeInTheDocument();
  });

  it('shows correct prediction status when price goes up', () => {
    const upGuess: IGuess = { ...mockActiveGuess, direction: 'up' as const };
    const higherPrice = { ...mockCurrentPrice, price: 52000 };

    render(
      <ActiveGuessDisplay
        activeGuess={upGuess}
        currentPrice={higherPrice}
        userId={mockUserId}
      />
    );

    // Should show correct prediction emoji
    expect(screen.getByText('😃')).toBeInTheDocument();
  });

  it('shows incorrect prediction status when price goes down', () => {
    const upGuess: IGuess = { ...mockActiveGuess, direction: 'up' as const };
    const lowerPrice = { ...mockCurrentPrice, price: 48000 };

    render(
      <ActiveGuessDisplay
        activeGuess={upGuess}
        currentPrice={lowerPrice}
        userId={mockUserId}
      />
    );

    // Should show incorrect prediction emoji
    expect(screen.getByText('😥')).toBeInTheDocument();
  });

  it('shows resolving state during mutation', () => {
    (useResolveGuess as jest.Mock).mockReturnValue({
      mutate: jest.fn(),
      isPending: true
    });

    render(
      <ActiveGuessDisplay
        activeGuess={mockActiveGuess}
        currentPrice={mockCurrentPrice}
        userId={mockUserId}
      />
    );

    expect(screen.getByText('(Resolving...)')).toBeInTheDocument();
  });

  it('shows waiting message when price hasnt changed', () => {
    const samePrice = { ...mockCurrentPrice, price: mockActiveGuess.startPrice };
    const expiredGuess = { ...mockActiveGuess, expiresAt: Math.floor((Date.now() - 1000) / 1000) }; // Expired 1 second ago

    render(
      <ActiveGuessDisplay
        activeGuess={expiredGuess}
        currentPrice={samePrice}
        userId={mockUserId}
      />
    );

    expect(screen.getByText('Waiting for price change')).toBeInTheDocument();
  });

  // Edge Cases
  it('handles extremely large price differences', () => {
    const largePrice = {
      ...mockCurrentPrice,
      price: mockActiveGuess.startPrice * 1000000 // Massive price increase
    };

    render(
      <ActiveGuessDisplay
        activeGuess={mockActiveGuess}
        currentPrice={largePrice}
        userId={mockUserId}
      />
    );

    expect(screen.getByText('😃')).toBeInTheDocument(); // Should still show correct prediction
  });

  it('handles negative price values', () => {
    const negativePrice = {
      ...mockCurrentPrice,
      price: -50000
    };

    render(
      <ActiveGuessDisplay
        activeGuess={mockActiveGuess}
        currentPrice={negativePrice}
        userId={mockUserId}
      />
    );

    expect(screen.getByText(/Starting price: \$50,000/)).toBeInTheDocument();
    expect(screen.getByText('😥')).toBeInTheDocument(); // Should show incorrect prediction
  });

  it('handles rapid price updates', () => {
    const { rerender } = render(
      <ActiveGuessDisplay
        activeGuess={mockActiveGuess}
        currentPrice={mockCurrentPrice}
        userId={mockUserId}
      />
    );

    // Simulate rapid price updates
    for (let i = 0; i < 10; i++) {
      const newPrice = {
        price: mockCurrentPrice.price + (i * 1000),
        timestamp: Date.now()
      };

      act(() => {
        rerender(
          <ActiveGuessDisplay
            activeGuess={mockActiveGuess}
            currentPrice={newPrice}
            userId={mockUserId}
          />
        );
      });
    }

    expect(screen.getByText('😃')).toBeInTheDocument(); // Should maintain correct prediction
  });

  it('handles expired guess with no price data', () => {
    const expiredGuess = {
      ...mockActiveGuess,
      expiresAt: Math.floor((Date.now() - 60000) / 1000) // Expired 1 minute ago
    };

    render(
      <ActiveGuessDisplay
        activeGuess={expiredGuess}
        currentPrice={undefined}
        userId={mockUserId}
      />
    );

    expect(screen.getByText('😐')).toBeInTheDocument(); // Should show neutral emoji
  });

  it('handles guess resolution at exact expiry time', () => {
    const exactExpiryGuess = {
      ...mockActiveGuess,
      expiresAt: Math.floor(Date.now() / 1000) // Expires right now
    };

    const mockMutate = jest.fn();
    (useResolveGuess as jest.Mock).mockReturnValue({
      mutate: mockMutate,
      isPending: false
    });

    render(
      <ActiveGuessDisplay
        activeGuess={exactExpiryGuess}
        currentPrice={mockCurrentPrice}
        userId={mockUserId}
      />
    );

    expect(mockMutate).toHaveBeenCalledWith({
      userId: mockUserId,
      guessId: exactExpiryGuess.id,
      currentPrice: mockCurrentPrice.price,
      startPrice: exactExpiryGuess.startPrice,
      direction: exactExpiryGuess.direction,
    });
  });

  it('handles multiple resolution attempts gracefully', () => {
    const expiredGuess = {
      ...mockActiveGuess,
      expiresAt: Math.floor((Date.now() - 1000) / 1000) // Expired 1 second ago
    };

    const mockMutate = jest.fn();
    (useResolveGuess as jest.Mock).mockReturnValue({
      mutate: mockMutate,
      isPending: false
    });

    const { rerender } = render(
      <ActiveGuessDisplay
        activeGuess={expiredGuess}
        currentPrice={mockCurrentPrice}
        userId={mockUserId}
      />
    );

    // Simulate multiple rerenders
    for (let i = 0; i < 5; i++) {
      act(() => {
        rerender(
          <ActiveGuessDisplay
            activeGuess={expiredGuess}
            currentPrice={mockCurrentPrice}
            userId={mockUserId}
          />
        );
      });
    }

    // Should only attempt to resolve once
    expect(mockMutate).toHaveBeenCalledTimes(1);
  });
}); 