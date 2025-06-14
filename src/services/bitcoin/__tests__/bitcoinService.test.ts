import { BitcoinService } from '../bitcoinService';
import { ApiClient } from '@/lib/apiClient';
import { API_CONFIG, getVersionedEndpoint } from '../../../config/api';

describe('BitcoinService', () => {
    let bitcoinService: BitcoinService;
    let mockApiClient: jest.Mocked<ApiClient>;

    beforeEach(() => {
        mockApiClient = {
            get: jest.fn(),
            post: jest.fn(),
            delete: jest.fn(),
            patch: jest.fn(),
            fetchWithRetry: jest.fn(),
            baseUrl: ''
        } as unknown as jest.Mocked<ApiClient>;
        
        bitcoinService = new BitcoinService(mockApiClient);
        jest.useFakeTimers();
        jest.setSystemTime(new Date(2024, 0, 1)); // Set a fixed date for testing
    });

    afterEach(() => {
        jest.useRealTimers();
    });

    describe('getActiveGuess', () => {
        it('should call the API with correct parameters', async () => {
            const userId = 'test-user-id';
            const timestamp = Date.now();
            const versionedEndpoint = getVersionedEndpoint(API_CONFIG.ENDPOINTS.ACTIVE_GUESS);

            await bitcoinService.getActiveGuess(userId);

            expect(mockApiClient.get).toHaveBeenCalledWith(
                `${versionedEndpoint}?userId=${userId}&t=${timestamp}`
            );
        });
    });

    describe('getUserScore', () => {
        it('should call the API with correct parameters', async () => {
            const userId = 'test-user-id';
            const timestamp = Date.now();
            const versionedEndpoint = getVersionedEndpoint(API_CONFIG.ENDPOINTS.SCORE);

            await bitcoinService.getUserScore(userId);

            expect(mockApiClient.get).toHaveBeenCalledWith(
                `${versionedEndpoint}?userId=${userId}&t=${timestamp}`
            );
        });
    });

    describe('getBitcoinPrice', () => {
        it('should call the API with correct timestamp', async () => {
            const timestamp = Date.now();
            const versionedEndpoint = getVersionedEndpoint(API_CONFIG.ENDPOINTS.BTC_PRICE);

            await bitcoinService.getBitcoinPrice();

            expect(mockApiClient.get).toHaveBeenCalledWith(
                `${versionedEndpoint}?t=${timestamp}`
            );
        });
    });

    describe('makeGuess', () => {
        it('should call the API with correct parameters', async () => {
            const userId = 'test-user-id';
            const direction = 'up';
            const currentPrice = 50000;
            const versionedEndpoint = getVersionedEndpoint(API_CONFIG.ENDPOINTS.MAKE_GUESS);

            await bitcoinService.makeGuess(userId, direction, currentPrice);

            expect(mockApiClient.post).toHaveBeenCalledWith(
                versionedEndpoint,
                { userId, direction, currentPrice }
            );
        });
    });

    describe('resolveGuess', () => {
        it('should call the API with correct parameters', async () => {
            const userId = 'test-user-id';
            const guessId = 'test-guess-id';
            const currentPrice = 51000;
            const versionedEndpoint = getVersionedEndpoint(API_CONFIG.ENDPOINTS.RESOLVE_GUESS);

            await bitcoinService.resolveGuess(userId, guessId, currentPrice);

            expect(mockApiClient.post).toHaveBeenCalledWith(
                versionedEndpoint,
                { userId, guessId, currentPrice }
            );
        });
    });
}); 