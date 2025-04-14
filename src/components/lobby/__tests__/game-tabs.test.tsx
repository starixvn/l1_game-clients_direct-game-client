import "@testing-library/jest-dom";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { GameTabs } from "../game-tabs";
import { StorageManager } from "../../../_shared/utils";
import { useTolgee } from "@tolgee/react";
import * as useGameResourcesHook from "../../../_shared/react-hooks/use-game-resources";

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
    const mockOfferGames = [
        { gameId: 1, isNew: false },
        { gameId: 2, isNew: true },
        { gameId: 3, isNew: false },
    ];
    const defaultProps = {
        offerGames: mockOfferGames,
        availableGameId: undefined,
        tabHeight: 800,
        setAvailableGameId: jest.fn(),
    };
    const mockUseGameNames = jest.spyOn(useGameResourcesHook, "useGameNames");
    const mockUseGameIcons = jest.spyOn(useGameResourcesHook, "useGameIcons");
    const gameNames = {
        1: "Game One",
        2: "Game Two",
        3: "Game Three",
    };
    const gameIcons = {
        1: "http://game-1/icon.png",
        2: "http://game-2/icon.png",
        3: "http://game-3/icon.png",
    };
    beforeEach(() => {
        jest.clearAllMocks();
        (useTolgee as jest.Mock).mockReturnValue({ getLanguage: () => "en" });
        mockUseGameNames.mockImplementation(() => gameNames);
        mockUseGameIcons.mockImplementation(() => gameIcons);
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
        await waitFor(() => screen.getByText("Game One"));

        // Act
        const secondTab = screen.getAllByRole("tab")[1];
        fireEvent.click(secondTab);

        // Assert
        await waitFor(() => {
            expect(StorageManager.set).toHaveBeenCalledWith("selectedGameId", 2);
            expect(mockSetAvailableGameId).toHaveBeenCalledWith(2);
        });
    });

    test("should fetch and display game names for all tabs", async () => {
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
        await waitFor(() => screen.getByText("Game One"));

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
            mockOfferGames.forEach((game) => {
                const icon = screen.getByAltText(`game-${game.gameId}`);
                expect(icon).toBeInTheDocument();
                expect(icon).toHaveAttribute("src", `http://game-${game.gameId}/icon.png`);
            });
        });
    });

    test.each([
        ['en', '/images/new-tag/en.png'],
        ['vi', '/images/new-tag/vi.png'],
        ['th', '/images/new-tag/th.png'],
        ['zh_cn', '/images/new-tag/zh_cn.png'],
        ['zh_tw', '/images/new-tag/zh_tw.png'],
    ])('should show correct new-tag image for %s language', async (language, expectedImagePath) => {
        // Arrange
        (useTolgee as jest.Mock).mockImplementation(() => ({
            getLanguage: () => language
        }));

        // Act
        render(<GameTabs {...defaultProps} />);

        // Assert
        await waitFor(() => {
            const newTag = screen.getByAltText("new-tag");
            expect(newTag).toHaveAttribute("src", expectedImagePath);
        });
    });

    test("should display 'NEW' tag for new game", async () => {
        // Arrange
        render(<GameTabs {...defaultProps} />);

        // Assert
        await waitFor(() => {
            const newGameTab = screen.getAllByRole("tab")[1]; // Game 2 is marked as new
            const newTag = newGameTab.querySelector('img[alt="new-tag"]');
            expect(newTag).toBeInTheDocument();
        });
    });

    test("should not display 'NEW' tag for non-new games", async () => {
        // Arrange
        render(<GameTabs {...defaultProps} />);

        // Assert
        await waitFor(() => {
            const regularGameTab = screen.getAllByRole("tab")[0]; // Game 1 is not new
            const newTag = regularGameTab.querySelector('img[alt="new-tag"]');
            expect(newTag).not.toBeInTheDocument();
        });
    });
});
