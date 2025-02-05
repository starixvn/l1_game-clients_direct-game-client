import { appSettings } from "../../game-setting";
import Base64Util from "../base64-util";
import * as SessionManager from "../session-manager";
import * as PlayerSetting from "../player-setting";
import { StorageManager, localStorageKeys } from "../storage-manager";
import {
    getBaseGameUrl,
    getGameUrl,
    getParamCurrentUrl,
    buildServiceUrlWithPath,
    getQueryParameters,
    URLContextModel,
    getBaseServiceUrl,
} from "../url-helper";

// Mock external dependencies
jest.mock("../../game-setting", () => ({
    appSettings: {
        serviceDomain: "https://test-domain.com",
        clientUrlFormat: "https://{host}/direct-client-{gameId}",
        isDev: false,
    },
}));

jest.mock("../base64-util", () => ({
    __esModule: true,
    default: {
        base64Encode: jest.fn((str) => `encoded_${str}`),
    },
}));

jest.mock("../session-manager", () => ({
    getSession: jest.fn(),
}));

jest.mock("../player-setting", () => ({
    getPlayerSetting: jest.fn(),
}));

jest.mock("../storage-manager", () => ({
    StorageManager: {
        get: jest.fn(),
    },
    localStorageKeys: {
        operator: "operator",
    },
}));

describe("url-helper", () => {
    beforeEach(() => {
        // Reset all mocks before each test
        jest.clearAllMocks();

        // Reset window.location
        delete (window as any).location;
        window.location = new URL("https://test-domain.com") as any;
    });

    describe("getBaseGameUrl", () => {
        it("should return correct URL", () => {
            const result = getBaseGameUrl(1);
            expect(result).toBe("https://test-domain.com/direct-client-1");
        });

        it("should throw error when clientUrlFormat is not set", () => {
            // Temporarily override the mock
            const originalSettings = { ...appSettings };
            (appSettings as any).clientUrlFormat = "";

            expect(() => getBaseGameUrl(1)).toThrow("Domain URL format is not set");

            // Restore the original settings
            Object.assign(appSettings, originalSettings);
        });

        it("should handle dev mode", () => {
            // Temporarily override the mock
            const originalSettings = { ...appSettings };
            (appSettings as any).isDev = true;

            const result = getBaseGameUrl(1);
            expect(result).toBe("https://{host}/direct-client-1");

            // Restore the original settings
            Object.assign(appSettings, originalSettings);
        });

        it("should handle subdomain correctly", () => {
            // Arrange
            const originalSettings = { ...appSettings };
            appSettings.clientUrlFormat = "https://game-{gameId}.{host}";
            Object.defineProperty(window, "location", {
                value: { host: "test.example.com" },
                writable: true,
            });

            // Act
            const result = getBaseGameUrl(456);

            // Assert
            expect(result).toBe("https://game-456.example.com");

            // Cleanup
            Object.assign(appSettings, originalSettings);
        });

        it("should handle multiple subdomains correctly", () => {
            // Arrange
            const originalSettings = { ...appSettings };
            appSettings.clientUrlFormat = "https://game-{gameId}.{host}";
            Object.defineProperty(window, "location", {
                value: { host: "sub1.sub2.example.com" },
                writable: true,
            });

            // Act
            const result = getBaseGameUrl(456);

            // Assert
            expect(result).toBe("https://game-456.example.com");

            // Cleanup
            Object.assign(appSettings, originalSettings);
        });

        it("should not modify root domain", () => {
            // Arrange
            const originalSettings = { ...appSettings };
            appSettings.clientUrlFormat = "https://game-{gameId}.{host}";
            Object.defineProperty(window, "location", {
                value: { host: "example.com" },
                writable: true,
            });

            // Act
            const result = getBaseGameUrl(456);

            // Assert
            expect(result).toBe("https://game-456.example.com");

            // Cleanup
            Object.assign(appSettings, originalSettings);
        });
    });

    describe("getGameUrl", () => {
        beforeEach(() => {
            (SessionManager.getSession as jest.Mock).mockReturnValue({
                ss: "test-session",
                username: "testuser",
                language: "en",
                system: 1,
            });
            (PlayerSetting.getPlayerSetting as jest.Mock).mockReturnValue({
                musicEnable: true,
                sfxEnable: true,
            });
            (StorageManager.get as jest.Mock).mockImplementation((key) => {
                if (key === localStorageKeys.operator) {
                    return "testOperator";
                }
                return null;
            });
        });

        it("should return complete game URL with encoded parameters", () => {
            const result = getGameUrl(1, [1, 2, 3]);
            expect(result).toContain(
                "https://test-domain.com/direct-client-1?params=encoded_ss=test-session&uname=testuser&lang=en&appType=1&purl=encoded_https%3A%2F%2Ftest-domain.com%2F&rurl=encoded_https%3A%2F%2Ftest-domain.com%2F&musicEnable=true&sfxEnable=true&isUserGesture=false&op=testOperator&supportedGamesId=2%2C3"
            );
            expect(Base64Util.base64Encode).toHaveBeenCalled();
        });

        it("should include all required parameters in encoded form", () => {
            const result = getGameUrl(1, [1, 2, 3]);
            const encodedParams = result.split("params=")[1];
            expect(Base64Util.base64Encode).toHaveBeenCalledWith(expect.stringContaining("ss=test-session"));
            expect(Base64Util.base64Encode).toHaveBeenCalledWith(expect.stringContaining("uname=testuser"));
            expect(Base64Util.base64Encode).toHaveBeenCalledWith(expect.stringContaining("lang=en"));
            expect(Base64Util.base64Encode).toHaveBeenCalledWith(expect.stringContaining("appType=1"));
            expect(Base64Util.base64Encode).toHaveBeenCalledWith(expect.stringContaining("op=testOperator"));
        });

        it("should handle missing operator value", () => {
            (StorageManager.get as jest.Mock).mockReturnValue(null);
            const result = getGameUrl(1, [1, 2, 3]);
            expect(result).toContain(
                "https://test-domain.com/direct-client-1?params=encoded_ss=test-session&uname=testuser&lang=en&appType=1&purl=encoded_https%3A%2F%2Ftest-domain.com%2F&rurl=encoded_https%3A%2F%2Ftest-domain.com%2F&musicEnable=true&sfxEnable=true&isUserGesture=false&op=null"
            );
            expect(Base64Util.base64Encode).toHaveBeenCalledWith(expect.not.stringContaining("op="));
        });
    });

    describe("getParamCurrentUrl", () => {
        beforeEach(() => {
            window.location = new URL("https://test-domain.com?test=value") as any;
        });

        it("should return parameter value when exists", () => {
            const result = getParamCurrentUrl("test");
            expect(result).toBe("value");
        });

        it("should return null when parameter doesn't exist", () => {
            const result = getParamCurrentUrl("nonexistent");
            expect(result).toBeNull();
        });
    });

    describe("buildUrlWithPath", () => {
        it("should combine domain and path", () => {
            const result = buildServiceUrlWithPath("/test-path");
            expect(result).toBe("https://test-domain.com/test-path");
        });
    });

    describe("getQueryParameters", () => {
        it("should return empty object when no parameters", () => {
            window.location = new URL("https://test-domain.com") as any;
            const result = getQueryParameters();
            expect(result).toEqual({});
        });

        it("should parse and return all parameters when token exists", () => {
            // Mock window.location using a URLSearchParams object instead
            const searchParams = new URLSearchParams(
                "token=test-token&lang=en&gameId=1&appType=2&ref=true&op=testOp&rurl=https://redirect.com"
            );

            // Mock globalThis.location and history
            const mockHref = "https://test-domain.com/test?" + searchParams.toString();
            Object.defineProperty(globalThis, "location", {
                value: {
                    search: `?${searchParams.toString()}`,
                    origin: "https://test-domain.com",
                    href: mockHref,
                },
                writable: true,
            });

            Object.defineProperty(globalThis, "history", {
                value: {
                    pushState: jest.fn(),
                },
                writable: true,
            });

            const result = getQueryParameters();
            expect(result).toEqual({
                token: "test-token",
                lang: "en",
                gameId: 1,
                appType: 2,
                isDirectMode: true,
                redirectUrl: "https://redirect.com",
                isThirdParty: true,
                operator: "testOp",
            });
        });

        it("should handle missing optional parameters", () => {
            // Mock window.location using a URLSearchParams object with only required parameters
            const searchParams = new URLSearchParams("token=test-token");

            // Mock globalThis.location and history
            const mockHref = "https://test-domain.com/test?" + searchParams.toString();
            Object.defineProperty(globalThis, "location", {
                value: {
                    search: `?${searchParams.toString()}`,
                    origin: "https://test-domain.com",
                    href: mockHref,
                },
                writable: true,
            });

            Object.defineProperty(globalThis, "history", {
                value: {
                    pushState: jest.fn(),
                },
                writable: true,
            });

            const result = getQueryParameters();
            expect(result).toEqual({
                token: "test-token",
                lang: "en",
                gameId: 0,
                appType: 1,
                isDirectMode: false,
                redirectUrl: "",
                isThirdParty: false,
                operator: null,
            });
        });
    });

    describe("getBaseServiceUrl", () => {
        const originalWindow = { ...window };

        beforeEach(() => {
            // Reset window.location
            Object.defineProperty(window, "location", {
                value: { host: "test.example.com" },
                writable: true,
            });
        });

        afterEach(() => {
            // Restore window
            Object.defineProperty(window, "location", {
                value: originalWindow.location,
                writable: true,
            });
        });

        it("should throw error when serviceDomain is not set", () => {
            appSettings.serviceDomain = "";
            expect(() => getBaseServiceUrl()).toThrow("Service domain is not set");
        });

        it("should return serviceDomain as is when in dev mode", () => {
            appSettings.isDev = true;
            appSettings.serviceDomain = "https://dev-api.example.com";
            expect(getBaseServiceUrl()).toBe("https://dev-api.example.com");
        });

        it("should replace {host} with root domain in production mode", () => {
            appSettings.isDev = false;
            appSettings.serviceDomain = "https://api.{host}";
            expect(getBaseServiceUrl()).toBe("https://api.example.com");
        });
    });
});
