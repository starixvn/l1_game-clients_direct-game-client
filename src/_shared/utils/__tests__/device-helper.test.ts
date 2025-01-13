import { isMobile } from '../device-helper';

describe('device-helper', () => {
    let originalUserAgent: string;

    beforeEach(() => {
        // Store the original userAgent
        originalUserAgent = navigator.userAgent;
    });

    afterEach(() => {
        // Restore the original userAgent after each test
        Object.defineProperty(navigator, 'userAgent', {
            value: originalUserAgent,
            configurable: true
        });
    });

    describe('isMobile', () => {
        const mockUserAgent = (userAgent: string) => {
            Object.defineProperty(navigator, 'userAgent', {
                value: userAgent,
                configurable: true
            });
        };

        it('should return true for Android devices', () => {
            mockUserAgent('Mozilla/5.0 (Linux; Android 10) AppleWebKit/537.36');
            expect(isMobile()).toBe(true);
        });

        it('should return true for iPhone devices', () => {
            mockUserAgent('Mozilla/5.0 (iPhone; CPU iPhone OS 14_0 like Mac OS X)');
            expect(isMobile()).toBe(true);
        });

        it('should return true for iPad devices', () => {
            mockUserAgent('Mozilla/5.0 (iPad; CPU OS 14_0 like Mac OS X)');
            expect(isMobile()).toBe(true);
        });

        it('should return true for iPod devices', () => {
            mockUserAgent('Mozilla/5.0 (iPod; CPU iPhone OS 14_0 like Mac OS X)');
            expect(isMobile()).toBe(true);
        });

        it('should return true for BlackBerry devices', () => {
            mockUserAgent('Mozilla/5.0 (BlackBerry; U; BlackBerry 9900; en)');
            expect(isMobile()).toBe(true);
        });

        it('should return false when userAgent is undefined', () => {
            // @ts-ignore
            delete navigator.userAgent;
            expect(isMobile()).toBe(false);
        });

        it('should return true for Opera Mini browser', () => {
            mockUserAgent('Opera/9.80 (Android; Opera Mini/8.0.1807/36.1609; U; en)');
            expect(isMobile()).toBe(true);
        });

        it('should return true for IEMobile browser', () => {
            mockUserAgent('Mozilla/5.0 (Windows Phone 10.0; Android 6.0.1; IEMobile/11.0)');
            expect(isMobile()).toBe(true);
        });

        it('should return true for webOS devices', () => {
            mockUserAgent('Mozilla/5.0 (webOS/1.4.0; U; en-US)');
            expect(isMobile()).toBe(true);
        });

        it('should return false for desktop Chrome', () => {
            mockUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36');
            expect(isMobile()).toBe(false);
        });

        it('should return false for desktop Firefox', () => {
            mockUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:89.0) Gecko/20100101 Firefox/89.0');
            expect(isMobile()).toBe(false);
        });

        it('should return false for desktop Safari', () => {
            mockUserAgent('Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/14.1.1 Safari/605.1.15');
            expect(isMobile()).toBe(false);
        });

        it('should return false for empty user agent', () => {
            mockUserAgent('');
            expect(isMobile()).toBe(false);
        });
    });
}); 