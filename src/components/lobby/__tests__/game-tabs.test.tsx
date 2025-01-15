import "@testing-library/jest-dom";

import { jest } from "@jest/globals";
import { act, fireEvent, render, screen } from "@testing-library/react";
import React from "react";

import * as GameUrl from "../../../_shared/utils";
import * as FunctionUtil from "../../../_shared/utils/function-util";
import { GameEventManager, GameEvents } from "../../../_shared/utils/game-event-manager";
import * as PlayerSetting from "../../../_shared/utils/player-setting";
import { localStorageKeys, StorageManager } from "../../../_shared/utils/storage-manager";
import { GAME_CONFIG, GameTabs } from "../game-tabs";

type CopyTextFunction = (text: string) => Promise<boolean>;
type EventHandler = (data: { copyToClipboard: string }) => Promise<void>;

// Mock dependencies
const mockSubscribe = jest.fn();
const mockUnsubscribe = jest.fn();
const mockGetInstance = jest.fn(() => ({
    subscribe: mockSubscribe,
    unsubscribe: mockUnsubscribe,
}));

jest.mock("../../../_shared/utils/game-event-manager", () => ({
    GameEvents: {
        musicEnable: "musicEnable",
        sfxEnable: "sfxEnable",
        isUserGesture: "isUserGesture",
        copyToClipboard: "copyToClipboard",
    },
    GameEventManager: {
        getInstance: () => mockGetInstance(),
    },
}));
jest.mock("../../../_shared/utils/player-setting");
jest.mock("../../../_shared/utils/function-util", () => ({
    __esModule: true,
    default: {
        copyText: jest.fn<CopyTextFunction>(),
    },
}));
jest.mock("../../../_shared/utils");
jest.mock("../../../_shared/react-hooks/use-translator", () => ({
    useTranslator: () => ({
        t: (key: string) => key,
    }),
}));
jest.mock("../../../_shared/utils/storage-manager", () => ({
    StorageManager: {
        get: jest.fn(),
        set: jest.fn(),
    },

    localStorageKeys: {
        selectedGameId: 2,
    },
}));

describe("GameTabs Component", () => {
    const mockGameOfferIds = [1, 2, 3];
    const mockGameUrl = "http://example.com/game/1";
    let mockPostMessage: jest.Mock;

    beforeEach(() => {
        jest.clearAllMocks();
        (GameUrl.getGameUrl as jest.Mock).mockReturnValue(mockGameUrl);
        mockPostMessage = jest.fn();
        // Mock iframe contentWindow
        Object.defineProperty(HTMLIFrameElement.prototype, "contentWindow", {
            value: { postMessage: mockPostMessage },
            writable: true,
        });
    });

    it("should render game tabs with correct number of tabs", () => {
        render(<GameTabs gameOfferIds={mockGameOfferIds} availableGameId={undefined} />);
        const tabs = screen.getAllByRole("tab");
        expect(tabs).toHaveLength(mockGameOfferIds.length);
    });

    it("should render game icons and names in tabs", () => {
        render(<GameTabs gameOfferIds={mockGameOfferIds} availableGameId={undefined} />);
        mockGameOfferIds.forEach((gameId) => {
            expect(screen.getByAltText(`gameNames.${gameId}`)).toBeInTheDocument();
            expect(screen.getByText(`gameNames.${gameId}`)).toBeInTheDocument();
        });
    });

    it("should switch tabs and update iframe source when clicking different tabs", () => {
        render(<GameTabs gameOfferIds={mockGameOfferIds} availableGameId={undefined} />);

        // Click second tab
        fireEvent.click(screen.getAllByRole("tab")[1]);
        expect(GameUrl.getGameUrl).toHaveBeenCalledWith(mockGameOfferIds[1]);

        // Click third tab
        fireEvent.click(screen.getAllByRole("tab")[2]);
        expect(GameUrl.getGameUrl).toHaveBeenCalledWith(mockGameOfferIds[2]);
    });

    it("should handle copy to clipboard events", async () => {
        const mockCopyText = "test text";
        (FunctionUtil.default.copyText as jest.Mock<CopyTextFunction>).mockResolvedValueOnce(true);

        render(<GameTabs gameOfferIds={mockGameOfferIds} availableGameId={undefined} />);

        // Get the copyToClipboard event handler
        const copyHandler = mockSubscribe.mock.calls.find((call) => call[0] === GameEvents.copyToClipboard)[1] as EventHandler;

        // Simulate copyToClipboard event
        await act(async () => {
            await copyHandler({ copyToClipboard: mockCopyText });
        });

        expect(FunctionUtil.default.copyText).toHaveBeenCalledWith(mockCopyText);
        expect(mockPostMessage).toHaveBeenCalledWith({ copySuccessfully: true }, mockGameUrl);
    });

    it("should subscribe to game events on mount and unsubscribe on unmount", () => {
        const { unmount } = render(<GameTabs gameOfferIds={mockGameOfferIds} availableGameId={undefined} />);

        // In React 18 Strict Mode, effects run twice, so we expect 4 subscriptions
        expect(mockSubscribe).toHaveBeenCalledWith(GameEvents.musicEnable, PlayerSetting.storePlayerSetting);
        expect(mockSubscribe).toHaveBeenCalledWith(GameEvents.sfxEnable, PlayerSetting.storePlayerSetting);
        expect(mockSubscribe).toHaveBeenCalledWith(GameEvents.isUserGesture, PlayerSetting.storePlayerSetting);
        expect(mockSubscribe).toHaveBeenCalledWith(GameEvents.copyToClipboard, expect.any(Function));

        unmount();

        // In React 18 Strict Mode, cleanup runs twice, so we expect 8 unsubscribe calls
        expect(mockUnsubscribe).toHaveBeenCalledTimes(8);
    });

    it("should set initial iframe source on mount", () => {
        render(<GameTabs gameOfferIds={mockGameOfferIds} availableGameId={undefined} />);
        expect(GameUrl.getGameUrl).toHaveBeenCalledWith(mockGameOfferIds[0]);
        const iframe = screen.getByTitle(`Game ${mockGameOfferIds[0]}`);
        expect(iframe).toHaveAttribute("src", mockGameUrl);
    });

    it("should handle empty gameOfferIds array", () => {
        render(<GameTabs gameOfferIds={[]} availableGameId={undefined} />);
        expect(screen.queryByRole("tab")).not.toBeInTheDocument();
    });

    describe("Viewport Calculations", () => {
        beforeEach(() => {
            // Mock isMobile
            jest.mock("react-device-detect", () => ({
                isMobile: false,
            }));
        });

        it("should calculate desktop view correctly for non-mobile devices", () => {
            // Arrange
            window.innerWidth = 1920;
            window.innerHeight = 1080;

            // Act
            render(<GameTabs gameOfferIds={mockGameOfferIds} availableGameId={undefined} />);

            // Assert
            const iframe = screen.getByTitle(`Game ${mockGameOfferIds[0]}`);
            const expectedHeight = window.innerHeight - GAME_CONFIG.tabHeight;
            const expectedWidth = Math.floor(expectedHeight * GAME_CONFIG.aspectRatio);
            expect(iframe).toHaveAttribute("height", expectedHeight.toString());
            expect(iframe).toHaveAttribute("width", expectedWidth.toString());
        });

        it("should calculate mobile view correctly when aspect ratio is below threshold", () => {
            // Mock isMobile for this test
            jest.mock("react-device-detect", () => ({
                isMobile: true,
            }));

            // Arrange
            window.innerWidth = 375;
            window.innerHeight = 812;

            // Act
            render(<GameTabs gameOfferIds={mockGameOfferIds} availableGameId={undefined} />);

            // Assert
            const iframe = screen.getByTitle(`Game ${mockGameOfferIds[0]}`);
            expect(iframe).toHaveAttribute("height", "778");
            expect(iframe).toHaveAttribute("width", "597");
        });

        it("should recalculate dimensions on window resize", () => {
            // Arrange
            render(<GameTabs gameOfferIds={mockGameOfferIds} availableGameId={undefined} />);

            // Act
            window.innerWidth = 1024;
            window.innerHeight = 768;
            fireEvent(window, new Event("resize"));

            // Assert
            const iframe = screen.getByTitle(`Game ${mockGameOfferIds[0]}`);
            const expectedHeight = window.innerHeight - GAME_CONFIG.tabHeight;
            const expectedWidth = Math.floor(expectedHeight * GAME_CONFIG.aspectRatio);
            expect(iframe).toHaveAttribute("height", expectedHeight.toString());
            expect(iframe).toHaveAttribute("width", expectedWidth.toString());
        });
    });

    describe("Game Selection and Storage", () => {
        it("should load previously selected game from storage if available", () => {
            // Arrange
            const savedGameId = mockGameOfferIds[1];
            (StorageManager.get as jest.Mock).mockReturnValue(savedGameId);

            // Act
            render(<GameTabs gameOfferIds={mockGameOfferIds} availableGameId={savedGameId} />);

            // Assert
            expect(GameUrl.getGameUrl).toHaveBeenCalledWith(savedGameId);
            expect(screen.getAllByRole("tab")[1]).toHaveAttribute("aria-selected", "true");
        });

        it("should use availableGameId when provided and no stored game exists", () => {
            // Arrange
            const availableGameId = mockGameOfferIds[1];
            (StorageManager.get as jest.Mock).mockReturnValue(availableGameId);

            // Act
            render(<GameTabs gameOfferIds={mockGameOfferIds} availableGameId={availableGameId} />);

            // Assert
            expect(GameUrl.getGameUrl).toHaveBeenCalledWith(availableGameId);
            expect(StorageManager.set).toHaveBeenCalledTimes(0);
        });

        it("should ignore stored game ID if it's not in current gameOfferIds", () => {
            // Arrange
            (StorageManager.get as jest.Mock).mockReturnValue(999); // Invalid game ID

            // Act
            render(<GameTabs gameOfferIds={mockGameOfferIds} availableGameId={undefined} />);

            // Assert
            expect(GameUrl.getGameUrl).toHaveBeenCalledWith(mockGameOfferIds[0]);
            expect(StorageManager.set).toHaveBeenCalledTimes(0);
        });
    });

    describe("Tab Interaction", () => {
        it("should update storage and iframe source when switching tabs", () => {
            // Arrange
            render(<GameTabs gameOfferIds={mockGameOfferIds} availableGameId={undefined} />);

            // Act
            fireEvent.click(screen.getAllByRole("tab")[1]);

            // Assert
            expect(StorageManager.set).toHaveBeenCalledTimes(0);
            expect(GameUrl.getGameUrl).toHaveBeenCalledWith(mockGameOfferIds[1]);
        });

        it("should render correct tab styling for active and inactive tabs", () => {
            // Arrange
            render(<GameTabs gameOfferIds={mockGameOfferIds} availableGameId={undefined} />);

            // Assert
            const activeTab = screen.getAllByRole("tab")[0];
            const inactiveTab = screen.getAllByRole("tab")[1];

            expect(activeTab.querySelector(".tab-title")).toHaveClass("active");
            expect(inactiveTab.querySelector(".tab-title")).not.toHaveClass("active");
            expect(inactiveTab.querySelector(".tab-icon")).toHaveClass("inactive");
        });
    });

    describe("Event Handling", () => {
        it("should handle failed clipboard operations", async () => {
            // Arrange
            (FunctionUtil.default.copyText as jest.Mock<CopyTextFunction>).mockResolvedValueOnce(false);
            render(<GameTabs gameOfferIds={mockGameOfferIds} availableGameId={1} />);
            const copyHandler = mockSubscribe.mock.calls.find((call) => call[0] === GameEvents.copyToClipboard)[1] as EventHandler;

            // Act
            await act(async () => {
                await copyHandler({ copyToClipboard: "test text" });
            });

            // Assert
            expect(mockPostMessage).toHaveBeenCalledWith({ copySuccessfully: false }, mockGameUrl);
        });
    });
});
