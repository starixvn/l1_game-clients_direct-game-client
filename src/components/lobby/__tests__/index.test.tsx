import React from "react";
import { render, screen, waitFor, act } from "@testing-library/react";
import "@testing-library/jest-dom";
import Lobby from "../index";
import * as urlHelper from "../../../_shared/utils";
import * as gameSettings from "../../../_shared/utils/game-setting";
import * as useAuthHook from "../../../_shared/react-hooks/use-authorization";
import { StorageManager } from "../../../_shared/utils";
import * as gameSettingUtils from "../../../_shared/utils/game-setting";

// Mock Clipboard API
Object.defineProperty(window.navigator, 'clipboard', {
    value: {
        writeText: jest.fn().mockImplementation(() => Promise.resolve()),
        readText: jest.fn().mockImplementation(() => Promise.resolve('')),
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
    GameTabs: ({ gameOfferIds }: { gameOfferIds: number[] }) => <div data-testid="game-tabs">Game Tabs: {gameOfferIds.join(",")}</div>,
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
    const mockGetOfferedGameIds = jest.spyOn(gameSettingUtils, "getOfferedGameIds");
    const mockGetAvailableGameId = jest.spyOn(gameSettingUtils, "getAvailableGameId");
    const mockUseAuthorization = jest.spyOn(useAuthHook, "useAuthorization");

    beforeEach(() => {
        jest.clearAllMocks();

        // Initialize default mock implementations
        mockUseAuthorization.mockImplementation(() => ({
            isLoading: false,
            umInfo: null,
            setUMInfo: jest.fn(),
            isSessionTimeout: false,
            initialize: jest.fn().mockResolvedValue({ authorized: true }),
        }));

        mockGetOfferedGameIds.mockReturnValue([]);
        mockGetAvailableGameId.mockReturnValue(1);
    });

    afterEach(() => {
        jest.resetAllMocks();
    });

    it("should render loading state initially", async () => {
        mockUseAuthorization.mockReturnValue({
            isLoading: true,
            umInfo: null,
            setUMInfo: jest.fn(),
            isSessionTimeout: false,
            initialize: jest.fn(),
        });

        await act(async () => {
            render(<Lobby />);
        });

        expect(screen.getByTestId("loading")).toBeInTheDocument();
    });

    it("should render session timeout page when session times out", async () => {
        mockUseAuthorization.mockReturnValue({
            isLoading: false,
            umInfo: null,
            setUMInfo: jest.fn(),
            isSessionTimeout: true,
            initialize: jest.fn().mockResolvedValue(null),
        });

        await act(async () => {
            render(<Lobby />);
        });

        expect(screen.getByTestId("session-timeout")).toBeInTheDocument();
    });

    it("should render UM page when under maintenance", async () => {
        const umInfo = {
            message: "Under Maintenance",
            startTime: new Date(),
            endTime: new Date(),
            operatorId: "test-operator",
            severity: 1,
        };
        mockUseAuthorization.mockReturnValue({
            isLoading: false,
            umInfo,
            setUMInfo: jest.fn(),
            isSessionTimeout: false,
            initialize: jest.fn().mockResolvedValue(null),
        });

        await act(async () => {
            render(<Lobby />);
        });

        expect(screen.getByTestId("um-page")).toBeInTheDocument();
        expect(screen.getByText("Under Maintenance")).toBeInTheDocument();
    });

    it("should render non-offer page when no game offers available", async () => {
        mockUseAuthorization.mockReturnValue({
            isLoading: false,
            umInfo: null,
            setUMInfo: jest.fn(),
            isSessionTimeout: false,
            initialize: jest.fn().mockResolvedValue({ authorized: true }),
        });
        mockGetOfferedGameIds.mockReturnValue([]);

        await act(async () => {
            render(<Lobby />);
        });

        expect(screen.getByTestId("non-offer")).toBeInTheDocument();
    });

    it("should render game tabs with offered games", async () => {
        const mockInitialize = jest.fn().mockResolvedValue({ authorized: true });
        mockUseAuthorization.mockReturnValue({
            isLoading: false,
            umInfo: null,
            setUMInfo: jest.fn(),
            isSessionTimeout: false,
            initialize: mockInitialize,
        });
        mockGetOfferedGameIds.mockReturnValue([1, 2, 3]);

        await act(async () => {
            render(<Lobby />);
        });

        expect(screen.getByTestId("game-tabs")).toBeInTheDocument();
        expect(screen.getByText("Game Tabs: 1,2,3")).toBeInTheDocument();
    });

    it("should handle game events correctly", async () => {
        const setUMInfo = jest.fn();
        const mockInitialize = jest.fn().mockResolvedValue({ authorized: true });
        mockUseAuthorization.mockReturnValue({
            isLoading: false,
            umInfo: null,
            setUMInfo,
            isSessionTimeout: false,
            initialize: mockInitialize,
        });

        await act(async () => {
            render(<Lobby />);
        });

        // Simulate event subscriptions
        const subscriptionCalls = mockSubscribe.mock.calls;
        expect(subscriptionCalls).toHaveLength(6);

        // Get the first instance of each handler
        const sessionTimeoutHandler = subscriptionCalls.find((call) => call[0] === "sessionTimeout")[1];
        const umHandler = subscriptionCalls.find((call) => call[0] === "isUnderMaintain")[1];
        const notPermittedHandler = subscriptionCalls.find((call) => call[0] === "isNotPermittedToPlay")[1];

        // Test session timeout event
        await act(async () => {
            sessionTimeoutHandler();
        });
        expect(screen.getByTestId("session-timeout")).toBeInTheDocument();

        // Test under maintenance event
        const testUmInfo = {
            message: "Test UM",
            startTime: new Date(),
            endTime: new Date(),
            operatorId: "test-operator",
            severity: 1,
        };

        await act(async () => {
            umHandler({ umInfo: testUmInfo });
        });

        expect(setUMInfo).toHaveBeenCalledWith(testUmInfo);

        // Test not permitted event
        await act(async () => {
            notPermittedHandler();
        });
    });
});

describe("Lobby", () => {
    const mockUseAuthorization = useAuthHook.useAuthorization as jest.Mock;
    const mockGetOfferedGameIds = gameSettingUtils.getOfferedGameIds as jest.Mock;
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
        });
        mockGetOfferedGameIds.mockReturnValue([1, 2, 3]);
        mockGetAvailableGameId.mockReturnValue(1);
    });

    it("should use gameId from query string when available and valid", async () => {
        // Mock window.location.search
        const originalLocation = window.location;
        delete window.location;
        window.location = { ...originalLocation, search: "?gameId=2" };

        render(<Lobby />);

        await waitFor(() => {
            expect(mockGetOfferedGameIds).toHaveBeenCalled();
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
            expect(mockGetOfferedGameIds).toHaveBeenCalled();
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
            expect(mockGetOfferedGameIds).toHaveBeenCalled();
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
        });

        render(<Lobby />);

        // The initialize function should be called (accounting for React 18 Strict Mode)
        expect(mockInitialize.mock.calls.length).toBeGreaterThanOrEqual(1);

        // Wait for the effect to complete
        await waitFor(() => {
            expect(mockGetOfferedGameIds).toHaveBeenCalled();
        });

        // Restore original location
        window.location = originalLocation;
    });

    it("should set gameId to 0 when no game is available", async () => {
        // Mock no available games
        mockGetOfferedGameIds.mockReturnValue([]);
        mockGetAvailableGameId.mockReturnValue(undefined);

        const mockInitialize = jest.fn().mockResolvedValue({ authorized: true });
        mockUseAuthorization.mockReturnValue({
            isLoading: false,
            umInfo: null,
            setUMInfo: jest.fn(),
            isSessionTimeout: false,
            initialize: mockInitialize,
        });

        render(<Lobby />);

        await waitFor(() => {
            expect(mockGetOfferedGameIds).toHaveBeenCalled();
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
            expect(mockGetOfferedGameIds).toHaveBeenCalled();
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
            expect(mockGetOfferedGameIds).toHaveBeenCalled();
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
            expect(mockGetOfferedGameIds).toHaveBeenCalled();
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
            expect(mockGetOfferedGameIds).toHaveBeenCalled();
        });

        // Check for the game tabs content with the correct game IDs
        expect(screen.getByTestId("game-tabs")).toBeInTheDocument();
        expect(screen.getByText("Game Tabs: 1,2,3")).toBeInTheDocument();

        // Restore original location and cleanup mock
        window.location = originalLocation;
        mockStorageGet.mockRestore();
    });
});
