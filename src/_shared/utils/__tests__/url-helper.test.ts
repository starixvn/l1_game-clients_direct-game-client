import { appSettings } from "../../game-setting";
import Base64Util from "../base64-util";
import * as SessionManager from "../session-manager";
import * as PlayerSetting from "../player-setting";
import { StorageManager, localStorageKeys } from "../storage-manager";
import { getBaseGameUrl, getGameUrl, getParamCurrentUrl, buildUrlWithPath, getQueryParameters, URLContextModel } from "../url-helper";

// Mock external dependencies
jest.mock("../../game-setting", () => ({
    appSettings: {
        gameDomain: "https://test-domain.com",
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
        operator: 'operator'
    }
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
        const originalNodeEnv = process.env.NODE_ENV;

        afterEach(() => {
            process.env.NODE_ENV = originalNodeEnv;
        });

        it("should return production URL when not in development", () => {
            process.env.NODE_ENV = "production";
            const result = getBaseGameUrl(1);
            expect(result).toBe("https://test-domain.com/direct-client-1/");
        });

        it("should return development URL for gameId 2", () => {
            process.env.NODE_ENV = "development";
            const result = getBaseGameUrl(2);
            expect(result).toBe("http://localhost:7456");
        });

        it("should return development URL for other gameIds", () => {
            process.env.NODE_ENV = "development";
            const result = getBaseGameUrl(1);
            expect(result).toBe("http://localhost:7456/web-mobile/web-mobile/index.html");
        });
    });

    describe("getGameUrl", () => {
        beforeEach(() => {
            (SessionManager.getSession as jest.Mock).mockReturnValue({
                ss: "test-session",
                username: "testuser",
                language: "en",
                system: 1
            });
            (PlayerSetting.getPlayerSetting as jest.Mock).mockReturnValue({
                musicEnable: true,
                sfxEnable: true
            });
            (StorageManager.get as jest.Mock).mockImplementation((key) => {
                if (key === localStorageKeys.operator) {
                    return "testOperator";
                }
                return null;
            });
        });

        it("should return complete game URL with encoded parameters", () => {
            const result = getGameUrl(1);
            expect(result).toContain("https://test-domain.com/direct-client-1/?params=");
            expect(Base64Util.base64Encode).toHaveBeenCalled();
        });

        it("should include all required parameters in encoded form", () => {
            const result = getGameUrl(1);
            const encodedParams = result.split("params=")[1];
            expect(Base64Util.base64Encode).toHaveBeenCalledWith(expect.stringContaining("ss=test-session"));
            expect(Base64Util.base64Encode).toHaveBeenCalledWith(expect.stringContaining("uname=testuser"));
            expect(Base64Util.base64Encode).toHaveBeenCalledWith(expect.stringContaining("lang=en"));
            expect(Base64Util.base64Encode).toHaveBeenCalledWith(expect.stringContaining("appType=1"));
            expect(Base64Util.base64Encode).toHaveBeenCalledWith(expect.stringContaining("op=testOperator"));
        });

        it("should handle missing operator value", () => {
            (StorageManager.get as jest.Mock).mockReturnValue(null);
            const result = getGameUrl(1);
            expect(result).toContain("https://test-domain.com/direct-client-1/?params=");
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
            const result = buildUrlWithPath("/test-path");
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
            Object.defineProperty(globalThis, 'location', {
                value: {
                    search: `?${searchParams.toString()}`,
                    origin: 'https://test-domain.com',
                    href: mockHref
                },
                writable: true
            });

            Object.defineProperty(globalThis, 'history', {
                value: {
                    pushState: jest.fn()
                },
                writable: true
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
                firstSSOToLobby: true
            });
        });

        it("should handle missing optional parameters", () => {
            // Mock window.location using a URLSearchParams object with only required parameters
            const searchParams = new URLSearchParams(
                "token=test-token"
            );

            // Mock globalThis.location and history
            const mockHref = "https://test-domain.com/test?" + searchParams.toString();
            Object.defineProperty(globalThis, 'location', {
                value: {
                    search: `?${searchParams.toString()}`,
                    origin: 'https://test-domain.com',
                    href: mockHref
                },
                writable: true
            });

            Object.defineProperty(globalThis, 'history', {
                value: {
                    pushState: jest.fn()
                },
                writable: true
            });

            const result = getQueryParameters();
            expect(result).toEqual({
                token: "test-token",
                lang: null,
                gameId: 0,
                appType: 0,
                isDirectMode: false,
                redirectUrl: "",
                isThirdParty: false,
                operator: null,
                firstSSOToLobby: true
            });
        });
    });
});