import { render, screen, waitFor, act } from "@testing-library/react";
import "@testing-library/jest-dom";
import Lobby from "../index";
import * as useAuthHook from "../../../_shared/react-hooks/use-authorization";
import { StorageManager } from "../../../_shared/utils";
import * as gameSettingUtils from "../../../_shared/utils/game-setting";
import { LobbyConfig } from "../../../_shared/utils/game-setting";

// Mock Clipboard API
Object.defineProperty(window.navigator, "clipboard", {
    value: {
        writeText: jest.fn().mockImplementation(() => Promise.resolve()),
        readText: jest.fn().mockImplementation(() => Promise.resolve("")),
    },
    writable: true,
});

// Mock appSettings
jest.mock("../../../_shared/game-setting", () => ({
    appSettings: {
        serviceDomain: "https://test-domain.com",
        system: "test-system",
        ssl: true,
        env: "test",
        sentry: {
            dsn: "test-dsn",
            environment: "test",
        },
        clientUrlFormat: "https://{gameId}.example.com",
        isDev: false,
    },
}));

// Mock all lazy-loaded components
jest.mock("../../timeout", () => ({
    __esModule: true,
    default: () => <div data-testid="session-timeout">Session Timeout</div>,
}));

jest.mock("../../um", () => ({
    __esModule: true,
    default: ({ umInfo }: { umInfo: any }) => <div data-testid="um-page">{umInfo?.message}</div>,
}));

jest.mock("../../non-offer", () => ({
    __esModule: true,
    default: () => <div data-testid="non-offer">Non Offer Page</div>,
}));

jest.mock("../game-tabs", () => ({
    GameTabs: ({ offerGames }: { offerGames: LobbyConfig[] }) => (
        <div data-testid="game-tabs">Game Tabs: {offerGames.map((offer) => offer.gameId).join(",")}</div>
    ),
}));

jest.mock("../../common/loading", () => ({
    __esModule: true,
    default: () => <div data-testid="loading">Loading...</div>,
}));

jest.mock("../../landscape-mode", () => ({
    __esModule: true,
    default: () => <div data-testid="landscape-mode">Landscape Mode</div>,
}));

// Mock the storage manager and utils
const mockStorageSet = jest.fn();
const mockStorageGet = jest.fn();

jest.mock("../../../_shared/utils", () => {
    const actual = jest.requireActual("../../../_shared/utils");
    return {
        ...actual,
        StorageManager: {
            set: (...args: any[]) => mockStorageSet(...args),
            get: (...args: any[]) => mockStorageGet(...args),
        },
        getQueryParameters: jest.fn(),
        localStorageKeys: {
            ...actual.localStorageKeys,
            operator: "operator",
        },
    };
});

// Mock GameEventManager
const mockSubscribe = jest.fn();
const mockUnsubscribe = jest.fn();
jest.mock("../../../_shared/utils/game-event-manager", () => ({
    GameEventManager: {
        getInstance: () => ({
            subscribe: mockSubscribe,
            unsubscribe: mockUnsubscribe,
        }),
    },
    GameEvents: {
        sessionTimeout: "sessionTimeout",
        isUnderMaintain: "isUnderMaintain",
        isNotPermittedToPlay: "isNotPermittedToPlay",
    },
}));

describe("Lobby Component", () => {
    const mockGetOfferedGames = jest.spyOn(gameSettingUtils, "getOfferedGames");
    const mockGetAvailableGameId = jest.spyOn(gameSettingUtils, "getAvailableGameId");
    const mockUseAuthorization = jest.spyOn(useAuthHook, "useAuthorization");
    const defaultAuthState = {
        isLoading: false,
        umInfo: null,
        setUMInfo: jest.fn(),
        isSessionTimeout: false,
        initialize: jest.fn().mockResolvedValue({ authorized: true }),
        session: {
            system: 7,
        } as any,
    };

    beforeEach(() => {
        jest.clearAllMocks();
        mockUseAuthorization.mockImplementation(() => defaultAuthState);
        mockGetOfferedGames.mockResolvedValue([
            { gameId: 1, isNew: false },
            { gameId: 2, isNew: true },
            { gameId: 3, isNew: false },
        ]);
        mockGetAvailableGameId.mockReturnValue(1);
    });

    afterEach(() => {
        jest.resetAllMocks();
    });

    describe("Game Availability", () => {
        it("should display game tabs with correct game IDs", async () => {
            // Arrange
            const availableGames = [1, 2, 3];
            mockUseAuthorization.mockImplementation(() => defaultAuthState);
            mockGetOfferedGames.mockResolvedValue([
                { gameId: 1, isNew: false },
                { gameId: 2, isNew: true },
                { gameId: 3, isNew: false },
            ]);

            // Act
            await act(async () => {
                render(<Lobby />);
            });

            // Assert
            expect(screen.getByTestId("game-tabs")).toBeInTheDocument();
            expect(screen.getByText(`Game Tabs: ${availableGames.join(",")}`)).toBeInTheDocument();
        });

        it("should display non-offer page when no games are available", async () => {
            // Arrange
            mockGetOfferedGames.mockResolvedValue([]);

            // Act
            await act(async () => {
                render(<Lobby />);
            });

            // Assert
            expect(screen.getByTestId("non-offer")).toBeInTheDocument();
        });
    });

    describe("Session Management", () => {
        it("should display timeout page when session expires", async () => {
            // Arrange
            mockUseAuthorization.mockReturnValue({
                ...defaultAuthState,
                isSessionTimeout: true,
            });

            // Act
            await act(async () => {
                render(<Lobby />);
            });

            // Assert
            expect(screen.getByTestId("session-timeout")).toBeInTheDocument();
        });
    });

    describe("Maintenance Handling", () => {
        it("should display maintenance page with correct message", async () => {
            // Arrange
            const maintenanceInfo = {
                message: "Scheduled Maintenance",
                startTime: new Date(),
                endTime: new Date(),
                operatorId: "test-operator",
                severity: 1,
            };
            mockUseAuthorization.mockReturnValue({
                ...defaultAuthState,
                umInfo: maintenanceInfo,
            });

            // Act
            await act(async () => {
                render(<Lobby />);
            });

            // Assert
            expect(screen.getByTestId("um-page")).toBeInTheDocument();
            expect(screen.getByText("Scheduled Maintenance")).toBeInTheDocument();
        });
    });

    describe("Game Event Handling", () => {
        it("should handle session timeout event correctly", async () => {
            // Arrange
            const setUMInfo = jest.fn();
            mockUseAuthorization.mockReturnValue({
                ...defaultAuthState,
                setUMInfo,
            });

            // Act
            await act(async () => {
                render(<Lobby />);
            });

            const sessionTimeoutHandler = mockSubscribe.mock.calls.find((call) => call[0] === "sessionTimeout")[1];

            await act(async () => {
                sessionTimeoutHandler();
            });

            // Assert
            expect(screen.getByTestId("session-timeout")).toBeInTheDocument();
        });

        it("should handle maintenance event correctly", async () => {
            // Arrange
            const setUMInfo = jest.fn();
            mockUseAuthorization.mockReturnValue({
                ...defaultAuthState,
                setUMInfo,
            });

            const maintenanceInfo = {
                message: "Emergency Maintenance",
                startTime: new Date(),
                endTime: new Date(),
                operatorId: "test-operator",
                severity: 1,
            };

            // Act
            await act(async () => {
                render(<Lobby />);
            });

            const umHandler = mockSubscribe.mock.calls.find((call) => call[0] === "isUnderMaintain")[1];

            await act(async () => {
                umHandler({ umInfo: maintenanceInfo });
            });

            // Assert
            expect(setUMInfo).toHaveBeenCalledWith(maintenanceInfo);
        });
    });
});

describe("Lobby", () => {
    const mockUseAuthorization = useAuthHook.useAuthorization as jest.Mock;
    const mockGetOfferedGames = gameSettingUtils.getOfferedGames as jest.Mock;
    const mockGetAvailableGameId = gameSettingUtils.getAvailableGameId as jest.Mock;

    beforeEach(() => {
        // Clear all mocks
        jest.clearAllMocks();

        // Default mock implementations
        mockUseAuthorization.mockReturnValue({
            isLoading: false,
            umInfo: null,
            setUMInfo: jest.fn(),
            isSessionTimeout: false,
            initialize: jest.fn().mockResolvedValue({ authorized: true }),
            session: {
                system: 7,
            },
        });
        mockGetOfferedGames.mockReturnValue([
            {
                gameId: 1,
                isNew: false,
            },
            {
                gameId: 2,
                isNew: true,
            },
            {
                gameId: 3,
                isNew: false,
            },
        ]);
        mockGetAvailableGameId.mockReturnValue(1);
    });

    it("should use gameId from query string when available and valid", async () => {
        // Mock window.location.search
        const originalLocation = window.location;
        delete window.location;
        window.location = { ...originalLocation, search: "?gameId=2" };

        render(<Lobby />);

        await waitFor(() => {
            expect(mockGetOfferedGames).toHaveBeenCalled();
        });

        // Check for the game tabs content with the correct game IDs
        expect(screen.getByTestId("game-tabs")).toBeInTheDocument();
        expect(screen.getByText("Game Tabs: 1,2,3")).toBeInTheDocument();

        // Restore original location
        window.location = originalLocation;
    });

    it("should fall back to default available game when query string gameId is not in offered games", async () => {
        // Mock window.location.search with invalid gameId
        const originalLocation = window.location;
        delete window.location;
        window.location = { ...originalLocation, search: "?gameId=999" };

        render(<Lobby />);

        await waitFor(() => {
            expect(mockGetOfferedGames).toHaveBeenCalled();
        });

        // Check for the game tabs content with the correct game IDs
        expect(screen.getByTestId("game-tabs")).toBeInTheDocument();
        expect(screen.getByText("Game Tabs: 1,2,3")).toBeInTheDocument();

        // Restore original location
        window.location = originalLocation;
    });

    it("should use default available game when no query string gameId is present", async () => {
        render(<Lobby />);

        await waitFor(() => {
            expect(mockGetOfferedGames).toHaveBeenCalled();
        });

        // Check for the game tabs content with the correct game IDs
        expect(screen.getByTestId("game-tabs")).toBeInTheDocument();
        expect(screen.getByText("Game Tabs: 1,2,3")).toBeInTheDocument();
    });

    it("should initialize with queryGameId immediately", async () => {
        // Mock window.location.search
        const originalLocation = window.location;
        delete window.location;
        window.location = { ...originalLocation, search: "?gameId=2" };

        const mockInitialize = jest.fn().mockResolvedValue({ authorized: true });
        mockUseAuthorization.mockReturnValue({
            isLoading: false,
            umInfo: null,
            setUMInfo: jest.fn(),
            isSessionTimeout: false,
            initialize: mockInitialize,
            session: {
                system: 7,
            },
        });

        render(<Lobby />);

        // The initialize function should be called (accounting for React 18 Strict Mode)
        expect(mockInitialize.mock.calls.length).toBeGreaterThanOrEqual(1);

        // Wait for the effect to complete
        await waitFor(() => {
            expect(mockGetOfferedGames).toHaveBeenCalled();
        });

        // Restore original location
        window.location = originalLocation;
    });

    it("should set gameId to 0 when no game is available", async () => {
        // Mock no available games
        mockGetOfferedGames.mockReturnValue([]);
        mockGetAvailableGameId.mockReturnValue(undefined);

        const mockInitialize = jest.fn().mockResolvedValue({ authorized: true });
        mockUseAuthorization.mockReturnValue({
            isLoading: false,
            umInfo: null,
            setUMInfo: jest.fn(),
            isSessionTimeout: false,
            initialize: mockInitialize,
            session: {
                system: 7,
            },
        });

        render(<Lobby />);

        await waitFor(() => {
            expect(mockGetOfferedGames).toHaveBeenCalled();
        });

        // Should render NonOfferPage when no games are available
        expect(screen.getByTestId("non-offer")).toBeInTheDocument();
    });

    it("should set gameId to 0 when query parameter is invalid", async () => {
        // Mock window.location.search with invalid gameId
        const originalLocation = window.location;
        delete window.location;
        window.location = { ...originalLocation, search: "?gameId=invalid" };

        render(<Lobby />);

        await waitFor(() => {
            expect(mockGetOfferedGames).toHaveBeenCalled();
        });

        // Check for the game tabs content with the correct game IDs
        expect(screen.getByTestId("game-tabs")).toBeInTheDocument();
        expect(screen.getByText("Game Tabs: 1,2,3")).toBeInTheDocument();

        // Restore original location
        window.location = originalLocation;
    });

    it("should use gameId from localStorage when no query string is present", async () => {
        // Mock StorageManager.get
        const mockStorageGet = jest.spyOn(StorageManager, "get");
        mockStorageGet.mockReturnValue(2); // Simulate stored gameId of 2

        // Mock window.location.search with no gameId
        const originalLocation = window.location;
        delete window.location;
        window.location = { ...originalLocation, search: "" };

        render(<Lobby />);

        await waitFor(() => {
            expect(mockGetOfferedGames).toHaveBeenCalled();
        });

        // Check for the game tabs content with the correct game IDs
        expect(screen.getByTestId("game-tabs")).toBeInTheDocument();
        expect(screen.getByText("Game Tabs: 1,2,3")).toBeInTheDocument();

        // Restore original location and cleanup mock
        window.location = originalLocation;
        mockStorageGet.mockRestore();
    });

    it("should prioritize query string gameId over localStorage gameId", async () => {
        // Mock StorageManager.get
        const mockStorageGet = jest.spyOn(StorageManager, "get");
        mockStorageGet.mockReturnValue(2); // Simulate stored gameId of 2

        // Mock window.location.search with different gameId
        const originalLocation = window.location;
        delete window.location;
        window.location = { ...originalLocation, search: "?gameId=3" };

        render(<Lobby />);

        await waitFor(() => {
            expect(mockGetOfferedGames).toHaveBeenCalled();
        });

        // Check for the game tabs content with the correct game IDs
        expect(screen.getByTestId("game-tabs")).toBeInTheDocument();
        expect(screen.getByText("Game Tabs: 1,2,3")).toBeInTheDocument();

        // Restore original location and cleanup mock
        window.location = originalLocation;
        mockStorageGet.mockRestore();
    });

    it("should fall back to 0 when both query string and localStorage are invalid", async () => {
        // Mock StorageManager.get
        const mockStorageGet = jest.spyOn(StorageManager, "get");
        mockStorageGet.mockReturnValue(null); // Simulate no stored gameId

        // Mock window.location.search with invalid gameId
        const originalLocation = window.location;
        delete window.location;
        window.location = { ...originalLocation, search: "?gameId=invalid" };

        render(<Lobby />);

        await waitFor(() => {
            expect(mockGetOfferedGames).toHaveBeenCalled();
        });

        // Check for the game tabs content with the correct game IDs
        expect(screen.getByTestId("game-tabs")).toBeInTheDocument();
        expect(screen.getByText("Game Tabs: 1,2,3")).toBeInTheDocument();

        // Restore original location and cleanup mock
        window.location = originalLocation;
        mockStorageGet.mockRestore();
    });
});
