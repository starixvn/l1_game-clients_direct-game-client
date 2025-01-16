import { renderHook, act } from "@testing-library/react";
import { useAuthorization } from "../use-authorization";
import * as authService from "../../services/auth-service";
import { StorageManager, storeSessionData } from "../../utils";
import { tolgee } from "../../../tolgee";
import { localStorageKeys } from "../../utils";
import { getQueryParameters } from "../../utils";

// Mock appSettings
jest.mock("../../game-setting", () => ({
    appSettings: {
        serviceDomain: "https://test-domain.com",
        system: "test-system",
        ssl: true,
        env: "test",
    },
}));

// Mock all external dependencies
jest.mock("../../services/auth-service");
jest.mock("../../utils", () => ({
    StorageManager: {
        get: jest.fn(),
        set: jest.fn(),
        remove: jest.fn(),
    },
    localStorageKeys: {
        language: "language",
        operator: "operator",
        selectedGameId: "selectedGameId",
    },
    storeSessionData: jest.fn(),
    getQueryParameters: jest.fn(),
}));
jest.mock("../../../tolgee", () => ({
    tolgee: {
        changeLanguage: jest.fn(),
    },
}));

describe("useAuthorization", () => {
    const mockToken = "test-token";
    const mockAppType = 1;
    const mockLanguage = "en";
    const mockOperator = "test-operator";
    let originalConsoleLog: any;

    beforeEach(() => {
        // Store original console.log
        originalConsoleLog = console.log;
        // Suppress authorization error logs
        console.log = (message: string, ...args: any[]) => {
            if (typeof message === 'string' && !message.includes('Authorization error:')) {
                originalConsoleLog(message, ...args);
            }
        };

        jest.clearAllMocks();
        // Add query parameter mock setup
        (getQueryParameters as jest.Mock).mockReturnValue({
            token: mockToken,
            appType: mockAppType,
            lang: mockLanguage,
            operator: mockOperator,
        });
    });

    afterEach(() => {
        // Restore original console.log
        console.log = originalConsoleLog;
    });

    describe("initialize", () => {
        it("should handle successful authorization flow for regular user", async () => {
            const mockSession = {
                isUM: false,
                isAuthenticated: true,
                language: "en",
            };
            const mockAuthorizeResponse = {
                authorized: true,
            };

            (authService.sso as jest.Mock).mockResolvedValue(mockSession);
            (authService.authorize as jest.Mock).mockResolvedValue(mockAuthorizeResponse);
            (StorageManager.get as jest.Mock).mockReturnValue("en");

            const { result } = renderHook(() => useAuthorization());

            await act(async () => {
                await result.current.initialize();
            });

            expect(result.current.isLoading).toBe(false);
            expect(result.current.isSessionTimeout).toBe(false);
            expect(result.current.umInfo).toBeNull();
            expect(authService.sso).toHaveBeenCalledWith(mockToken, mockAppType);
            expect(authService.authorize).toHaveBeenCalledWith(mockSession);
        });

        it("should handle UM user flow", async () => {
            const mockUMInfo = {
                message: "Test UM Message",
                startTime: new Date(),
                endTime: new Date(),
                operatorId: "test-operator",
                severity: 1,
            };
            const mockSession = {
                isUM: true,
                umInfo: mockUMInfo,
                language: "en",
            };

            (authService.sso as jest.Mock).mockResolvedValue(mockSession);

            const { result } = renderHook(() => useAuthorization());

            await act(async () => {
                await result.current.initialize();
            });

            expect(result.current.isLoading).toBe(false);
            expect(result.current.umInfo).toEqual(mockUMInfo);
            expect(result.current.isSessionTimeout).toBe(false);
        });

        it("should handle session timeout", async () => {
            const mockSession = {
                isUM: false,
                isAuthenticated: false,
            };

            (authService.sso as jest.Mock).mockResolvedValue(mockSession);

            const { result } = renderHook(() => useAuthorization());

            await act(async () => {
                await result.current.initialize();
            });

            expect(result.current.isLoading).toBe(false);
            expect(result.current.isSessionTimeout).toBe(true);
        });

        it("should handle unauthorized user with successful auto-create nickname", async () => {
            const mockSession = {
                isUM: false,
                isAuthenticated: true,
            };
            const mockUnauthorizedResponse = {
                authorized: false,
            };
            const mockAutoCreateResponse = {
                authorized: true,
            };

            (authService.sso as jest.Mock).mockResolvedValue(mockSession);
            (authService.authorize as jest.Mock).mockResolvedValue(mockUnauthorizedResponse);
            (authService.autoCreateNickname as jest.Mock).mockResolvedValue(mockAutoCreateResponse);

            const { result } = renderHook(() => useAuthorization());

            await act(async () => {
                await result.current.initialize();
            });

            expect(result.current.isLoading).toBe(false);
            expect(result.current.isSessionTimeout).toBe(false);
            expect(authService.autoCreateNickname).toHaveBeenCalledWith(mockSession);
        });

        it("should handle unauthorized user with failed auto-create nickname", async () => {
            const mockSession = {
                isUM: false,
                isAuthenticated: true,
            };
            const mockUnauthorizedResponse = {
                authorized: false,
            };
            const mockAutoCreateResponse = {
                authorized: false,
            };

            (authService.sso as jest.Mock).mockResolvedValue(mockSession);
            (authService.authorize as jest.Mock).mockResolvedValue(mockUnauthorizedResponse);
            (authService.autoCreateNickname as jest.Mock).mockResolvedValue(mockAutoCreateResponse);

            const { result } = renderHook(() => useAuthorization());

            await act(async () => {
                await result.current.initialize();
            });

            expect(result.current.isLoading).toBe(false);
            expect(result.current.isSessionTimeout).toBe(true);
        });

        it("should handle error during initialization", async () => {
            (authService.sso as jest.Mock).mockRejectedValue(new Error("Test error"));

            const { result } = renderHook(() => useAuthorization());

            await act(async () => {
                const response = await result.current.initialize();
                expect(response).toBeNull();
            });

            expect(result.current.isLoading).toBe(false);
        });

        it("should verify session when no token is provided", async () => {
            const mockSession = {
                isUM: false,
                isAuthenticated: true,
            };
            const mockAuthorizeResponse = {
                authorized: true,
            };
            (getQueryParameters as jest.Mock).mockReturnValue({});

            (authService.verifySession as jest.Mock).mockResolvedValue(mockSession);
            (authService.authorize as jest.Mock).mockResolvedValue(mockAuthorizeResponse);

            const { result } = renderHook(() => useAuthorization());

            await act(async () => {
                await result.current.initialize();
            });

            expect(authService.verifySession).toHaveBeenCalled();
            expect(result.current.isLoading).toBe(false);
        });

        it("should handle language loading correctly", async () => {
            const mockSession = {
                isUM: false,
                isAuthenticated: true,
                language: "fr",
            };
            const mockAuthorizeResponse = {
                authorized: true,
            };

            (authService.sso as jest.Mock).mockResolvedValue(mockSession);
            (authService.authorize as jest.Mock).mockResolvedValue(mockAuthorizeResponse);
            (StorageManager.get as jest.Mock).mockReturnValue(null);

            const { result } = renderHook(() => useAuthorization());

            await act(async () => {
                await result.current.initialize();
            });

            expect(tolgee.changeLanguage).toHaveBeenCalled();
            expect(StorageManager.set).toHaveBeenCalledWith(localStorageKeys.language, expect.any(String));
        });

        it("should store operator when provided in query parameters", async () => {
            // Arrange
            const mockOperator = "test-operator";
            const mockSession = {
                isUM: false,
                isAuthenticated: true,
            };
            const mockAuthorizeResponse = {
                authorized: true,
            };
            (getQueryParameters as jest.Mock).mockReturnValue({
                operator: mockOperator,
            });
            (authService.verifySession as jest.Mock).mockResolvedValue(mockSession);
            (authService.authorize as jest.Mock).mockResolvedValue(mockAuthorizeResponse);

            // Act
            const { result } = renderHook(() => useAuthorization());
            await act(async () => {
                await result.current.initialize();
            });

            // Assert
            expect(StorageManager.set).toHaveBeenCalledWith(localStorageKeys.operator, mockOperator);
        });

        it("should remove selected game id when token is provided", async () => {
            const mockSession = {
                isUM: false,
                isAuthenticated: true,
            };
            (getQueryParameters as jest.Mock).mockReturnValue({
                token: mockToken,
            });
            const mockAuthorizeResponse = {
                authorized: true,
            };
            (authService.verifySession as jest.Mock).mockResolvedValue(mockSession);
            (authService.authorize as jest.Mock).mockResolvedValue(mockAuthorizeResponse);

            const { result } = renderHook(() => useAuthorization());
            await act(async () => {
                await result.current.initialize();
            });

            expect(StorageManager.remove).toHaveBeenCalledWith(localStorageKeys.selectedGameId);
        });
    });

    describe("state management", () => {
        it("should allow manual update of umInfo", async () => {
            const { result } = renderHook(() => useAuthorization());

            const newUMInfo = {
                message: "New UM Message",
                startTime: new Date(),
                endTime: new Date(),
                operatorId: "test-operator",
                severity: 1,
            };

            act(() => {
                result.current.setUMInfo(newUMInfo);
            });

            expect(result.current.umInfo).toEqual(newUMInfo);
        });
    });
});
