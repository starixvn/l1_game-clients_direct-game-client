import { appSettings } from "../../game-setting";
import Base64Util from "../base64-util";
import * as PlayerSetting from "../player-setting";
import * as SessionManager from "../session-manager";
import { StorageManager, localStorageKeys } from "../storage-manager";
import {
    buildServiceUrlWithPath,
    fetchVersions,
    getBaseGameUrl,
    getBaseServiceUrl,
    getGameUrl,
    getParamCurrentUrl,
    getPromotionTournamentUrl,
    getQueryParameters,
    getRootHost,
    getVersionsRemoteUrl,
} from "../url-helper";

// Mock external dependencies
jest.mock("../../game-setting", () => ({
    appSettings: {
        serviceDomain: "https://test-domain.com",
        clientUrlFormatV2: "https://{host}/site-instant-v2/",
        clientUrlFormatV3: "https://{host}/site-instant-{gameId}/",
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
        it("should return correct V2 URL for V2 games", () => {
            // Test with a game ID that would be considered V2 by FunctionUtil.isGameV2
            const result = getBaseGameUrl(1);
            expect(result).toBe("https://test-domain.com/site-instant-v2/");
        });

        it("should return correct V3 URL for V3 games", () => {
            // Test with a game ID that would be considered V3 by FunctionUtil.isGameV2
            const result = getBaseGameUrl(456);
            expect(result).toBe("https://test-domain.com/site-instant-456/");
        });

        it("should throw error when clientUrlFormatV2 is not set", () => {
            // Temporarily override the mock
            const originalSettings = { ...appSettings };
            (appSettings as any).clientUrlFormatV2 = "";

            expect(() => getBaseGameUrl(1)).toThrow("Domain URL format is not set");

            // Restore the original settings
            Object.assign(appSettings, originalSettings);
        });

        it("should throw error when clientUrlFormatV3 is not set", () => {
            // Temporarily override the mock
            const originalSettings = { ...appSettings };
            (appSettings as any).clientUrlFormatV3 = "";

            expect(() => getBaseGameUrl(456)).toThrow("Domain URL format is not set");

            // Restore the original settings
            Object.assign(appSettings, originalSettings);
        });

        it("should handle dev mode for V2 games", () => {
            // Temporarily override the mock
            const originalSettings = { ...appSettings };
            (appSettings as any).isDev = true;
            Object.defineProperty(window, "location", {
                value: { host: "test.example.com" },
                writable: true,
            });

            const result = getBaseGameUrl(1);
            expect(result).toBe("https://{host}/site-instant-v2/");

            // Restore the original settings
            Object.assign(appSettings, originalSettings);
        });

        it("should handle dev mode for V3 games", () => {
            // Temporarily override the mock
            const originalSettings = { ...appSettings };
            (appSettings as any).isDev = true;

            const result = getBaseGameUrl(456);
            expect(result).toBe("https://{host}/site-instant-456/");

            // Restore the original settings
            Object.assign(appSettings, originalSettings);
        });

        it("should handle subdomain correctly for V3 games", () => {
            // Arrange
            const originalSettings = { ...appSettings };
            appSettings.clientUrlFormatV3 = "https://game-{gameId}.{host}";
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

        it("should handle multiple subdomains correctly for V3 games", () => {
            // Arrange
            const originalSettings = { ...appSettings };
            appSettings.clientUrlFormatV3 = "https://game-{gameId}.{host}";
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

        it("should not modify root domain for V3 games", () => {
            // Arrange
            const originalSettings = { ...appSettings };
            appSettings.clientUrlFormatV3 = "https://game-{gameId}.{host}";
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

        it("should handle subdomain correctly for V2 games", () => {
            // Arrange
            const originalSettings = { ...appSettings };
            appSettings.clientUrlFormatV2 = "https://v2.{host}";
            Object.defineProperty(window, "location", {
                value: { host: "test.example.com" },
                writable: true,
            });

            // Act
            const result = getBaseGameUrl(1);

            // Assert
            expect(result).toBe("https://v2.example.com");

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
                isUserGesture: false,
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
                "https://test-domain.com/site-instant-v2/?gameId=1&params=encoded_ss=test-session&uname=testuser&lang=en&appType=1&purl=encoded_https%3A%2F%2Ftest-domain.com%2F&ref=&rurl=&musicEnable=true&sfxEnable=true&isUserGesture=false&op=testOperator&supportedGamesId=2%2C3"
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
                "https://test-domain.com/site-instant-v2/?gameId=1&params=encoded_ss=test-session&uname=testuser&lang=en&appType=1&purl=encoded_https%3A%2F%2Ftest-domain.com%2F&ref=&rurl=&musicEnable=true&sfxEnable=true&isUserGesture=false&op=null&supportedGamesId=2%2C3"
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
                "token=test-token&lang=en&gameId=1&appType=2&ref=m_direct&op=testOp&rurl=https://redirect.com"
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
                operator: "testOp",
                ref: "m_direct",
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
                operator: null,
                ref: null,
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

    describe("getRootHost", () => {
        it("should return original host when no subdomains exist", () => {
            // Arrange
            const host = "example.com";

            // Act
            const result = getRootHost(host);

            // Assert
            expect(result).toBe("example.com");
        });

        it("should strip single subdomain from host", () => {
            // Arrange
            const host = "game.example.com";

            // Act
            const result = getRootHost(host);

            // Assert
            expect(result).toBe("example.com");
        });

        it("should strip multiple subdomains from host", () => {
            // Arrange
            const host = "dev.game.example.com";

            // Act
            const result = getRootHost(host);

            // Assert
            expect(result).toBe("example.com");
        });
    });

    describe("getVersionsRemoteUrl", () => {
        beforeEach(() => {
            // Mock Date.now() to return a fixed timestamp for consistent testing
            jest.spyOn(Date, "now").mockReturnValue(1234567890123);
        });

        afterEach(() => {
            jest.restoreAllMocks();
        });

        it("should construct correct versions URL for V3 games", () => {
            // Arrange
            const gameId = 123;
            const expectedUrl = "https://test-domain.com/site-instant-123/remote/versions.json?v=1234567890123";

            // Act
            const result = getVersionsRemoteUrl(gameId);

            // Assert
            expect(result).toBe(expectedUrl);
        });

        it("should construct correct versions URL for V2 games", () => {
            // Arrange
            const gameId = 1;
            const expectedUrl = "https://test-domain.com/site-instant-v2/remote/versions.json?v=1234567890123";

            // Act
            const result = getVersionsRemoteUrl(gameId);

            // Assert
            expect(result).toBe(expectedUrl);
        });

        it("should include timestamp query parameter", () => {
            // Arrange
            const gameId = 123;

            // Act
            const result = getVersionsRemoteUrl(gameId);

            // Assert
            expect(result).toMatch(/\?v=\d+$/);
        });
    });

    describe("fetchVersions", () => {
        beforeEach(() => {
            global.fetch = jest.fn();
        });

        it("should return version data when fetch succeeds", async () => {
            // Arrange
            const mockVersions = { banner: "1.0", icon: "2.0", localization: "3" };
            (global.fetch as jest.Mock).mockResolvedValueOnce({
                ok: true,
                json: () => Promise.resolve(mockVersions),
            });

            // Act
            const result = await fetchVersions(123);

            // Assert
            expect(result).toEqual(mockVersions);
        });

        it("should return default values when fetch fails", async () => {
            // Arrange
            (global.fetch as jest.Mock).mockRejectedValueOnce(new Error("Network error"));

            // Act
            const result = await fetchVersions(123);

            // Assert
            expect(result).toEqual({ banner: "", icon: "", localization: "0" });
        });
    });

    describe("getPromotionTournamentUrl", () => {
        it("should throw error when domains are not set", () => {
            // Arrange
            const originalSettings = { ...appSettings };
            appSettings.promotionDomain = "";
            appSettings.serviceDomain = "";

            // Act & Assert
            expect(() => getPromotionTournamentUrl()).toThrow("Promotion domain is not set");

            // Cleanup
            Object.assign(appSettings, originalSettings);
        });

        it("should replace host placeholder with root domain", () => {
            // Arrange
            const originalSettings = { ...appSettings };
            appSettings.promotionDomain = "https://promo.{host}";
            Object.defineProperty(window, "location", {
                value: { host: "game.test.example.com" },
                writable: true,
            });

            // Act
            const result = getPromotionTournamentUrl();

            // Assert
            expect(result).toBe("https://promo.example.com");

            // Cleanup
            Object.assign(appSettings, originalSettings);
        });
    });
});
