import { useBitcoinUtils } from '../bitcoin/useBitcoinUtils';

describe('useBitcoinUtils', () => {
    const { formatPrice, formatTime } = useBitcoinUtils();

    describe('formatPrice', () => {
        it('should format price with USD currency symbol and 2 decimal places', () => {
            expect(formatPrice(1234.5678)).toBe('$1,234.57');
            expect(formatPrice(1000000)).toBe('$1,000,000.00');
            expect(formatPrice(0.123456)).toBe('$0.12');
            expect(formatPrice(0)).toBe('$0.00');
        });
    });

    describe('formatTime', () => {
        it('should format milliseconds into seconds with "s" suffix', () => {
            expect(formatTime(1000)).toBe('1s');
            expect(formatTime(1500)).toBe('2s'); // Should round up
            expect(formatTime(2000)).toBe('2s');
            expect(formatTime(500)).toBe('1s'); // Should round up
            expect(formatTime(0)).toBe('0s');
        });
    });
}); 