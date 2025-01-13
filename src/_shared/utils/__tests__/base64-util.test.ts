import { Base64 } from 'base64-string';
import Base64Util from '../base64-util';

// Mock the Base64 class
jest.mock('base64-string', () => ({
    Base64: jest.fn().mockImplementation(() => ({
        encode: jest.fn((data) => `encoded_${data}`),
        decode: jest.fn((data) => `decoded_${data}`),
    })),
}));

describe('Base64Util', () => {
    beforeEach(() => {
        // Reset the static base64 instance before each test
        Base64Util.base64 = undefined;
        jest.clearAllMocks();
    });

    describe('base64Decode', () => {
        it('should create a new Base64 instance if not exists and decode data', () => {
            // Arrange
            const inputData = 'test_string';

            // Act
            const result = Base64Util.base64Decode(inputData);

            // Assert
            expect(Base64).toHaveBeenCalledTimes(1);
            expect(result).toBe('decoded_test_string');
            expect(Base64Util.base64).toBeDefined();
        });

        it('should reuse existing Base64 instance for decoding', () => {
            // Arrange
            const inputData1 = 'test_string1';
            const inputData2 = 'test_string2';

            // Act
            Base64Util.base64Decode(inputData1);
            const result = Base64Util.base64Decode(inputData2);

            // Assert
            expect(Base64).toHaveBeenCalledTimes(1);
            expect(result).toBe('decoded_test_string2');
        });
    });

    describe('base64Encode', () => {
        it('should create a new Base64 instance if not exists and encode data', () => {
            // Arrange
            const inputData = 'test_string';

            // Act
            const result = Base64Util.base64Encode(inputData);

            // Assert
            expect(Base64).toHaveBeenCalledTimes(1);
            expect(result).toBe('encoded_test_string');
            expect(Base64Util.base64).toBeDefined();
        });

        it('should reuse existing Base64 instance for encoding', () => {
            // Arrange
            const inputData1 = 'test_string1';
            const inputData2 = 'test_string2';

            // Act
            Base64Util.base64Encode(inputData1);
            const result = Base64Util.base64Encode(inputData2);

            // Assert
            expect(Base64).toHaveBeenCalledTimes(1);
            expect(result).toBe('encoded_test_string2');
        });
    });

    describe('Base64 instance management', () => {
        it('should share the same Base64 instance between encode and decode operations', () => {
            // Arrange
            const inputData1 = 'test_encode';
            const inputData2 = 'test_decode';

            // Act
            Base64Util.base64Encode(inputData1);
            Base64Util.base64Decode(inputData2);

            // Assert
            expect(Base64).toHaveBeenCalledTimes(1);
        });
    });
});
