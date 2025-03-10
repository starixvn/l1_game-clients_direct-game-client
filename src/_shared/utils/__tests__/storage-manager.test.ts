import { StorageManager, buildLocalStorageKey, localStorageKeys } from '../storage-manager';

describe('StorageManager', () => {
    let mockLocalStorage: { [key: string]: string };
    let originalLocalStorage: Storage;
    let originalConsoleLog: any;

    beforeEach(() => {
        // Store original console.log
        originalConsoleLog = console.log;
        // Suppress localStorage not supported warning
        console.log = (message: string, ...args: any[]) => {
            if (typeof message === 'string' && !message.includes('Browser not support Local Storage')) {
                originalConsoleLog(message, ...args);
            }
        };

        // Save original localStorage
        originalLocalStorage = global.localStorage;

        // Mock localStorage
        mockLocalStorage = {};
        const mockStorage = {
            getItem: jest.fn((key: string) => mockLocalStorage[key]),
            setItem: jest.fn((key: string, value: string) => {
                mockLocalStorage[key] = value;
            }),
            removeItem: jest.fn((key: string) => {
                delete mockLocalStorage[key];
            }),
            clear: jest.fn(),
            length: 0,
            key: jest.fn(),
        };

        Object.defineProperty(window, 'localStorage', {
            value: mockStorage
        });

        // Reset window.localMemory before each test
        delete (window as any).localMemory;
    });

    afterEach(() => {
        // Restore original console.log
        console.log = originalConsoleLog;

        // Restore original localStorage
        Object.defineProperty(window, 'localStorage', {
            value: originalLocalStorage
        });
    });

    describe('LocalStorage Implementation', () => {
        it('should store and retrieve values correctly', () => {
            const testKey = 'testKey';
            const testValue = { data: 'test' };

            StorageManager.set(testKey, testValue);
            expect(localStorage.setItem).toHaveBeenCalledWith(testKey, JSON.stringify(testValue));

            const storedValue = JSON.stringify(testValue);
            (localStorage.getItem as jest.Mock).mockReturnValue(storedValue);
            const retrieved = StorageManager.get(testKey);
            expect(retrieved).toEqual(testValue);
        });

        it('should handle string values without JSON parsing', () => {
            const testKey = 'testKey';
            const testValue = 'simple string';

            StorageManager.set(testKey, testValue);
            expect(localStorage.setItem).toHaveBeenCalledWith(testKey, testValue);
        });

        it('should handle empty string values', () => {
            (localStorage.getItem as jest.Mock).mockReturnValue('');
            const result = StorageManager.get('testKey');
            expect(result).toBeNull();
        });

        it('should handle JSON parse errors', () => {
            (localStorage.getItem as jest.Mock).mockReturnValue('invalid json');
            const result = StorageManager.get('testKey');
            expect(result).toBe('invalid json');
        });

        it('should remove items correctly', () => {
            const testKey = 'testKey';
            StorageManager.remove(testKey);
            expect(localStorage.removeItem).toHaveBeenCalledWith(testKey);
        });

        it('should handle null storage values', () => {
            (localStorage.getItem as jest.Mock).mockReturnValue(null);
            const result = StorageManager.get('testKey');
            expect(result).toBeNull();
        });
    });

    describe('Memory Storage Implementation', () => {
        beforeEach(() => {
            // Force Memory storage by making localStorage throw an error
            const mockStorage = {
                getItem: jest.fn(),
                setItem: jest.fn().mockImplementation(() => {
                    throw new Error('localStorage not available');
                }),
                removeItem: jest.fn(),
                clear: jest.fn(),
                length: 0,
                key: jest.fn()
            };

            Object.defineProperty(window, 'localStorage', {
                value: mockStorage,
                configurable: true,
                writable: true
            });

            // Reset StorageManager's internal storage
            // @ts-ignore - Accessing private property for testing
            StorageManager['_storage'] = undefined;
        });

        // it('should fall back to memory storage when localStorage is unavailable', () => {
        //     const testKey = 'testKey';
        //     const testValue = { data: 'test' };

        //     StorageManager.set(testKey, testValue);
        //     const retrieved = StorageManager.get(testKey);
        //     expect(retrieved).toEqual(testValue);
        // });

        it('should remove items from memory storage', () => {
            const testKey = 'testKey';
            const testValue = { data: 'test' };

            StorageManager.set(testKey, testValue);
            StorageManager.remove(testKey);
            const retrieved = StorageManager.get(testKey);
            expect(retrieved).toBeNull();
        });
    });

    describe('buildLocalStorageKey', () => {
        const originalLocation = window.location;

        beforeEach(() => {
            delete (window as any).location;
            (window as any).location = {
                hostname: 'test.com'
            };
        });

        afterEach(() => {
            window.location = originalLocation;
        });

        it('should build key with hostname when available', () => {
            const key = 'testKey';
            const result = buildLocalStorageKey(key);
            expect(result).toBe('test.com.testKey');
        });

        it('should return original key when hostname is not available', () => {
            delete (window as any).location;
            const key = 'testKey';
            const result = buildLocalStorageKey(key);
            expect(result).toBe(key);
        });
    });

    describe('localStorageKeys', () => {
        it('should have all required keys properly formatted', () => {
            expect(localStorageKeys).toHaveProperty('url');
            expect(localStorageKeys).toHaveProperty('language');
            expect(localStorageKeys).toHaveProperty('operator');
        });
    });
}); 