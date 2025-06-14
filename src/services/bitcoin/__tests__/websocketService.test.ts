import { BitcoinWebSocketService } from '../websocketService';

describe('BitcoinWebSocketService', () => {
    let service: BitcoinWebSocketService;
    let mockWebSocket: any;

    beforeEach(() => {
        // Mock WebSocket implementation
        mockWebSocket = {
            close: jest.fn(),
            onmessage: null,
            onclose: null,
            onerror: null,
            onopen: null
        };

        // Mock the global WebSocket constructor
        (global as any).WebSocket = jest.fn().mockImplementation(() => mockWebSocket);

        service = new BitcoinWebSocketService();
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    describe('WebSocket connection', () => {
        it('should create a WebSocket connection on initialization', () => {
            expect(global.WebSocket).toHaveBeenCalledWith('wss://stream.binance.com:9443/ws/btcusdt@trade');
        });

        it('should handle WebSocket messages', () => {
            const mockCallback = jest.fn();
            service.subscribe(mockCallback);

            const mockData = {
                p: '50000.00', // Price data from Binance WebSocket
                E: Date.now() // Event time
            };

            // Simulate receiving a message
            mockWebSocket.onmessage({ data: JSON.stringify(mockData) });

            expect(mockCallback).toHaveBeenCalledWith({
                price: 50000,
                timestamp: expect.any(Number)
            });
        });

        it('should handle WebSocket errors', () => {
            const consoleSpy = jest.spyOn(console, 'error').mockImplementation();
            mockWebSocket.onerror(new Error('WebSocket error'));
            expect(consoleSpy).toHaveBeenCalledWith('WebSocket error:', expect.any(Error));
            consoleSpy.mockRestore();
        });

        it('should handle WebSocket close', () => {
            const consoleSpy = jest.spyOn(console, 'log').mockImplementation();
            mockWebSocket.onclose();
            expect(consoleSpy).toHaveBeenCalledWith('WebSocket connection closed');
            consoleSpy.mockRestore();
        });
    });

    describe('subscribe', () => {
        it('should register a callback for price updates', () => {
            const mockCallback = jest.fn();
            service.subscribe(mockCallback);

            const mockData = {
                p: '50000.00',
                E: Date.now()
            };

            mockWebSocket.onmessage({ data: JSON.stringify(mockData) });

            expect(mockCallback).toHaveBeenCalledWith({
                price: 50000,
                timestamp: expect.any(Number)
            });
        });

        it('should handle invalid message data', () => {
            const mockCallback = jest.fn();
            service.subscribe(mockCallback);
            const consoleSpy = jest.spyOn(console, 'error').mockImplementation();

            mockWebSocket.onmessage({ data: 'invalid json' });

            expect(consoleSpy).toHaveBeenCalledWith('Error parsing WebSocket message:', expect.any(Error));
            expect(mockCallback).not.toHaveBeenCalled();
            consoleSpy.mockRestore();
        });
    });

    describe('unsubscribe', () => {
        it('should remove the callback', () => {
            const mockCallback = jest.fn();
            service.subscribe(mockCallback);
            service.unsubscribe();

            const mockData = {
                p: '50000.00',
                E: Date.now()
            };

            mockWebSocket.onmessage({ data: JSON.stringify(mockData) });

            expect(mockCallback).not.toHaveBeenCalled();
        });
    });

    describe('disconnect', () => {
        it('should close the WebSocket connection', () => {
            service.disconnect();
            expect(mockWebSocket.close).toHaveBeenCalled();
        });
    });
}); 