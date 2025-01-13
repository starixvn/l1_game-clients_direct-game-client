import { randomInteger } from '../number-helper';

describe('number-helper', () => {
    describe('randomInteger', () => {
        let mathRandomSpy: jest.SpyInstance;

        beforeEach(() => {
            // Mock Math.random to make tests deterministic
            mathRandomSpy = jest.spyOn(Math, 'random');
        });

        afterEach(() => {
            mathRandomSpy.mockRestore();
        });

        it('should return min value when Math.random returns 0', () => {
            mathRandomSpy.mockReturnValue(0);
            expect(randomInteger(1, 10)).toBe(1);
            expect(randomInteger(-5, 5)).toBe(-5);
        });

        it('should return max value when Math.random returns 0.99999...', () => {
            mathRandomSpy.mockReturnValue(0.9999999999999999);
            expect(randomInteger(1, 10)).toBe(10);
            expect(randomInteger(-5, 5)).toBe(5);
        });

        it('should return same value when min equals max', () => {
            mathRandomSpy.mockReturnValue(0.5);
            expect(randomInteger(5, 5)).toBe(5);
            expect(randomInteger(-3, -3)).toBe(-3);
        });

        it('should handle negative ranges correctly', () => {
            mathRandomSpy.mockReturnValue(0.5);
            expect(randomInteger(-10, -5)).toBe(-7);
        });

        it('should generate values within the specified range', () => {
            // Test with multiple random values
            const min = 1;
            const max = 100;

            for (let i = 0; i < 10; i++) {
                mathRandomSpy.mockReturnValue(i / 10); // 0.0, 0.1, 0.2, ..., 0.9
                const result = randomInteger(min, max);
                expect(result).toBeGreaterThanOrEqual(min);
                expect(result).toBeLessThanOrEqual(max);
                expect(Number.isInteger(result)).toBe(true);
            }
        });
    });
}); 