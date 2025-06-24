import { formatPrice } from '../formatPrice';

describe('formatPrice', () => {
    it('should format price with dollar sign and commas', () => {
        expect(formatPrice(50000)).toBe('$50,000');
        expect(formatPrice(1234567)).toBe('$1,234,567');
        expect(formatPrice(1000)).toBe('$1,000');
        expect(formatPrice(0)).toBe('$0');
    });

    it('should handle decimal prices', () => {
        expect(formatPrice(50000.50)).toBe('$50,000.50');
        expect(formatPrice(1234.99)).toBe('$1,234.99');
        expect(formatPrice(0.01)).toBe('$0.01');
    });

    it('should handle large numbers', () => {
        expect(formatPrice(999999999)).toBe('$999,999,999');
        expect(formatPrice(1000000000)).toBe('$1,000,000,000');
    });
});
