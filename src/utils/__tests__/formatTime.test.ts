import { formatTime } from '../formatTime';

describe('formatTime', () => {
    it('should format milliseconds into seconds with "s" suffix', () => {
        expect(formatTime(1000)).toBe('1s');
        expect(formatTime(1500)).toBe('2s'); // Should round up
        expect(formatTime(2000)).toBe('2s');
        expect(formatTime(500)).toBe('1s'); // Should round up
        expect(formatTime(0)).toBe('0s');
    });
});