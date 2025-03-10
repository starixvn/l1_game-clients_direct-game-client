import "@testing-library/jest-dom";
import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { GameTabs } from "../game-tabs";
import { GameEventManager, StorageManager } from "../../../_shared/utils";
import { useTolgee } from "@tolgee/react";

// Mock dependencies
jest.mock("@tolgee/react", () => ({
    useTolgee: jest.fn(),
}));
const mockSubscribe = jest.fn();
jest.mock("../../../_shared/utils", () => ({
    StorageManager: {
        get: jest.fn(),
        set: jest.fn(),
    },
    localStorageKeys: {
        selectedGameId: "selectedGameId",
    },
    getGameUrl: jest.fn((gameId) => `http://game-${gameId}/`),
    getGameLocalizationUrl: jest.fn((gameId) => `http://game-${gameId}/localization.json`),
    getIconGameTabUrl: jest.fn((gameId) => `http://game-${gameId}/icon.png`),
    GameEvents: { backLobby: "backLobby" },
    GameEventManager: { getInstance: () => ({ subscribe: mockSubscribe, unsubscribe: jest.fn() }) },
}));
jest.mock("../game-frame", () => ({
    GameFrame: jest.fn(() => <div data-testid="game-frame" />),
}));

// Mock fetch
global.fetch = jest.fn();

// Mock scrollIntoView
window.HTMLElement.prototype.scrollIntoView = jest.fn();

describe("GameTabs", () => {
    const mockGameOfferIds = [1, 2, 3];
    const defaultProps = {
        gameOfferIds: mockGameOfferIds,
        availableGameId: undefined,
        tabHeight: 800,
        setAvailableGameId: jest.fn(),
    };

    beforeEach(() => {
        jest.clearAllMocks();
        (useTolgee as jest.Mock).mockReturnValue({ getLanguage: () => "en" });
        (global.fetch as jest.Mock).mockImplementation((url) => {
            const gameId = url.split("game-")[1][0];
            return Promise.resolve({
                ok: true,
                json: () =>
                    Promise.resolve({
                        gameNames: {
                            en: `Test Game ${gameId}`,
                        },
                    }),
            });
        });
    });

    test("should initialize with first game when no previously selected game exists", async () => {
        // Arrange
        (StorageManager.get as jest.Mock).mockReturnValue(undefined);

        // Act
        render(<GameTabs {...defaultProps} />);

        // Assert
        await waitFor(() => {
            expect(StorageManager.set).toHaveBeenCalledWith("selectedGameId", 1);
        });
    });

    test("should initialize with previously selected game from storage", async () => {
        // Arrange
        (StorageManager.get as jest.Mock).mockReturnValue(2);

        // Act
        render(<GameTabs {...defaultProps} />);

        // Assert
        await waitFor(() => {
            expect(StorageManager.set).toHaveBeenCalledWith("selectedGameId", 2);
        });
    });

    test("should initialize with availableGameId when provided", async () => {
        // Arrange
        (StorageManager.get as jest.Mock).mockReturnValueOnce(undefined);
        const propsWithAvailableGame = {
            ...defaultProps,
            availableGameId: 3,
        };

        // Act
        render(<GameTabs {...propsWithAvailableGame} />);

        // Assert
        await waitFor(() => {
            expect(StorageManager.set).toHaveBeenCalledWith("selectedGameId", 3);
        });
    });

    test("should switch tabs when clicking on a different game tab", async () => {
        // Arrange
        const mockSetAvailableGameId = jest.fn();
        render(<GameTabs {...defaultProps} setAvailableGameId={mockSetAvailableGameId} />);
        await waitFor(() => screen.getByText("Test Game 1"));

        // Act
        const secondTab = screen.getAllByRole("tab")[1];
        fireEvent.click(secondTab);

        // Assert
        await waitFor(() => {
            expect(StorageManager.set).toHaveBeenCalledWith("selectedGameId", 2);
            expect(mockSetAvailableGameId).toHaveBeenCalledWith(2);
        });
    });

    test("should display fallback game name when API request fails", async () => {
        // Arrange
        (global.fetch as jest.Mock).mockRejectedValue(new Error("Network error"));

        // Act
        render(<GameTabs {...defaultProps} />);

        // Assert
        await waitFor(() => {
            expect(screen.getByText("game-1")).toBeInTheDocument();
        });
    });

    test("should fetch and display game names for all tabs", async () => {
        // Arrange
        const gameNames = {
            1: "Game One",
            2: "Game Two",
            3: "Game Three",
        };

        (global.fetch as jest.Mock).mockImplementation((url) => {
            const gameId = url.split("game-")[1][0];
            return Promise.resolve({
                ok: true,
                json: () =>
                    Promise.resolve({
                        gameNames: {
                            en: gameNames[gameId],
                        },
                    }),
            });
        });

        // Act
        render(<GameTabs {...defaultProps} />);

        // Assert
        await waitFor(() => {
            Object.values(gameNames).forEach((gameName) => {
                expect(screen.getByText(gameName)).toBeInTheDocument();
            });
        });
    });

    test("should update iframe source when switching tabs", async () => {
        // Arrange
        const mockSetAvailableGameId = jest.fn();
        render(<GameTabs {...defaultProps} setAvailableGameId={mockSetAvailableGameId} />);
        await waitFor(() => screen.getByText("Test Game 1"));

        // Act
        const secondTab = screen.getAllByRole("tab")[1];
        fireEvent.click(secondTab);

        // Assert
        const gameFrame = screen.getByTestId("game-frame");
        await waitFor(() => {
            expect(gameFrame).toBeInTheDocument();
            expect(StorageManager.set).toHaveBeenCalledWith("selectedGameId", 2);
            expect(mockSetAvailableGameId).toHaveBeenCalledWith(2);
        });
    });

    test("should display game icons for each tab", async () => {
        // Arrange & Act
        render(<GameTabs {...defaultProps} />);

        // Assert
        await waitFor(() => {
            mockGameOfferIds.forEach((gameId) => {
                const icon = screen.getByAltText(`game-${gameId}`);
                expect(icon).toBeInTheDocument();
                expect(icon).toHaveAttribute("src", `http://game-${gameId}/icon.png`);
            });
        });
    });
});
