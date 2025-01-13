import FunctionUtil from '../function-util';

describe('FunctionUtil', () => {
    let originalNavigator: any;
    let originalWindow: any;

    beforeEach(() => {
        // Store original window and navigator
        originalNavigator = global.navigator;
        originalWindow = global.window;

        // Reset window and navigator before each test
        // @ts-ignore
        delete global.navigator;
        // @ts-ignore
        delete global.window;
    });

    afterEach(() => {
        // Restore original window and navigator
        global.navigator = originalNavigator;
        global.window = originalWindow;
    });

    describe('isAndroidWebView', () => {
        it('should return true for Android WebView with AndroidBridge', () => {
            const mockUserAgent = 'Mozilla/5.0 (Linux; Android 10) AppleWebKit/537.36';
            // @ts-ignore
            global.navigator = {
                userAgent: mockUserAgent,
            };
            // @ts-ignore
            global.window = {
                AndroidBridge: {},
                opera: undefined
            };

            expect(FunctionUtil.isAndroidWebView()).toBe(true);
        });

        it('should return true for Android WebView with wv flag', () => {
            const mockUserAgent = 'Mozilla/5.0 (Linux; Android 10) wv AppleWebKit/537.36';
            // @ts-ignore
            global.navigator = {
                userAgent: mockUserAgent,
            };
            // @ts-ignore
            global.window = {
                opera: undefined
            };

            expect(FunctionUtil.isAndroidWebView()).toBe(true);
        });

        it('should return true for Android WebView with Version without Chrome', () => {
            const mockUserAgent = 'Mozilla/5.0 (Linux; Android 10) Version/4.0 AppleWebKit/537.36';
            // @ts-ignore
            global.navigator = {
                userAgent: mockUserAgent,
            };
            // @ts-ignore
            global.window = {
                opera: undefined
            };

            expect(FunctionUtil.isAndroidWebView()).toBe(true);
        });

        it('should return false for regular Android Chrome browser', () => {
            const mockUserAgent = 'Mozilla/5.0 (Linux; Android 10) Chrome/90.0.4430.91 Mobile Safari/537.36';
            // @ts-ignore
            global.navigator = {
                userAgent: mockUserAgent,
            };
            // @ts-ignore
            global.window = {
                opera: undefined
            };

            expect(FunctionUtil.isAndroidWebView()).toBe(false);
        });

        it('should return false for iOS device', () => {
            const mockUserAgent = 'Mozilla/5.0 (iPhone; CPU iPhone OS 14_4 like Mac OS X) AppleWebKit/605.1.15';
            // @ts-ignore
            global.navigator = {
                userAgent: mockUserAgent,
            };
            // @ts-ignore
            global.window = {
                opera: undefined
            };

            expect(FunctionUtil.isAndroidWebView()).toBe(false);
        });

        it('should return false when userAgent is undefined', () => {
            // @ts-ignore
            global.navigator = {};
            // @ts-ignore
            global.window = {
                opera: undefined
            };

            expect(FunctionUtil.isAndroidWebView()).toBe(false);
        });
    });

    describe('copyText', () => {
        it('should copy text using navigator clipboard in browser environment', async () => {
            const mockWriteText = jest.fn().mockResolvedValue(undefined);
            // @ts-ignore
            global.navigator = {
                userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/91.0.4472.124 Safari/537.36',
                clipboard: {
                    writeText: mockWriteText,
                    read: jest.fn(),
                    readText: jest.fn(),
                    write: jest.fn(),
                    addEventListener: jest.fn(),
                    removeEventListener: jest.fn(),
                    dispatchEvent: jest.fn()
                }
            };
            // @ts-ignore
            global.window = {
                opera: undefined
            };

            const result = await FunctionUtil.copyText('test text');
            expect(result).toBe(true);
            expect(mockWriteText).toHaveBeenCalledWith('test text');
        });

        it('should copy text using ReactNativeWebView in Android WebView', async () => {
            const mockPostMessage = jest.fn();
            const mockUserAgent = 'Mozilla/5.0 (Linux; Android 10) wv AppleWebKit/537.36';
            // @ts-ignore
            global.navigator = {
                userAgent: mockUserAgent,
            };
            // @ts-ignore
            global.window = {
                AndroidBridge: {},
                ReactNativeWebView: {
                    postMessage: mockPostMessage
                }
            };

            const result = await FunctionUtil.copyText('test text');
            expect(result).toBe(true);
            expect(mockPostMessage).toHaveBeenCalledWith(
                JSON.stringify({ eventType: 'copy_to_clipboard', data: 'test text' })
            );
        });

        it('should handle errors gracefully', async () => {
            // @ts-ignore
            global.navigator = {
                clipboard: {
                    writeText: jest.fn().mockRejectedValue(new Error('Clipboard error')),
                    read: jest.fn(),
                    readText: jest.fn(),
                    write: jest.fn(),
                    addEventListener: jest.fn(),
                    removeEventListener: jest.fn(),
                    dispatchEvent: jest.fn()
                }
            };
            // @ts-ignore
            global.window = {};

            const result = await FunctionUtil.copyText('test text');
            expect(result).toBe(false);
        });

        it('should handle undefined window gracefully', async () => {
            // @ts-ignore
            global.window = undefined;
            const result = await FunctionUtil.copyText('test text');
            expect(result).toBe(true);
        });
    });
}); 