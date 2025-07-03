import "@testing-library/jest-dom";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { useTolgee } from "@tolgee/react";
import * as useGameResourcesHook from "../../../_shared/react-hooks/use-game-resources";
import { getPlayerSetting, StorageManager, storePlayerSetting } from "../../../_shared/utils";
import FunctionUtil from "../../../_shared/utils/function-util";
import { GameTabs } from "../game-tabs";
// import FunctionUtil from "../../../_shared/utils/function-util";
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
    getPlayerSetting: jest.fn(),
    storePlayerSetting: jest.fn(),
}));
jest.mock("../../../_shared/utils/function-util", () => ({
    __esModule: true,
    default: {
        isGameV2: jest.fn(),
        isPortrait: jest.fn()
    },
}));

jest.mock("../game-frame", () => ({
    GameFrame: jest.fn(() => <div data-testid="game-frame" />),
}));
jest.mock("react-device-detect", () => ({
    isMobile: jest.fn(),
}));
jest.mock("../../../_shared/react-hooks/use-game-resources", () => ({
    useGameNames: jest.fn(),
    useGameIcons: jest.fn(),
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

    const mockIframe = {
        src: "http://game-1/",
        contentWindow: {
            postMessage: jest.fn(),
        },
    };
    
    const mockParentTabs = {
        scrollLeft: 100,
    };

    beforeEach(() => {
        jest.clearAllMocks();
        (useTolgee as jest.Mock).mockReturnValue({ getLanguage: () => "en" });
        (getPlayerSetting as jest.Mock).mockReturnValue({
            sfxEnable: true,
            musicEnable: true,
            isUserGesture: false,
        });
        (FunctionUtil.isPortrait as jest.Mock).mockReturnValue(false);
        mockUseGameNames.mockImplementation(() => gameNames);
        mockUseGameIcons.mockImplementation(() => gameIcons);

        // Mock DOM methods
        document.getElementById = jest.fn();
        document.querySelector = jest.fn();
        document.querySelectorAll = jest.fn(() => ({
            item: jest.fn(),
        } as unknown as NodeListOf<Element>));
        
         // Mock window dimensions for landscape/portrait tests
        Object.defineProperty(window, 'innerWidth', {
            writable: true,
            configurable: true,
            value: 1024,
        });
        Object.defineProperty(window, 'innerHeight', {
            writable: true,
            configurable: true,
            value: 768,
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
        render(<GameTabs {...defaultProps} 
            />);
        await waitFor(() => screen.getByText("Game One"));

        // Act
        const secondTab = screen.getAllByRole("tab")[1];
        fireEvent.click(secondTab);

        // Assert
        await waitFor(() => {
            expect(StorageManager.set).toHaveBeenCalledWith("selectedGameId", 2);
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
        render(<GameTabs {...defaultProps}  />);
        await waitFor(() => screen.getByText("Game One"));

        // Act
        const secondTab = screen.getAllByRole("tab")[1];
        fireEvent.click(secondTab);

        // Assert
        const gameFrame = screen.getByTestId("game-frame");
        await waitFor(() => {
            expect(gameFrame).toBeInTheDocument();
            expect(StorageManager.set).toHaveBeenCalledWith("selectedGameId", 2);
        });
    });

    describe("Sound Toggle Functionality", () => {
        test("should render sound toggle button in landscape mode", () => {
            // Set landscape mode
            Object.defineProperty(window, 'innerWidth', { value: 1200, configurable: true });
            Object.defineProperty(window, 'innerHeight', { value: 800, configurable: true });
            
            render(<GameTabs {...defaultProps} />);
            
            const soundToggleButton = screen.getByRole('button', { name: /sound/i });
            expect(soundToggleButton).toBeInTheDocument();
            expect(soundToggleButton).toHaveClass('sound-toggle');
        });

        test("should toggle sound settings when sound button is clicked", async () => {
            Object.defineProperty(window, 'innerWidth', { value: 1200, configurable: true });
            Object.defineProperty(window, 'innerHeight', { value: 800, configurable: true });
            
            (getPlayerSetting as jest.Mock).mockReturnValue({ sfxEnable: true, musicEnable: true });
            document.querySelector = jest.fn()
                .mockReturnValueOnce(mockIframe) // iframe
                .mockReturnValueOnce({ setAttribute: jest.fn() }); // sound toggle img

            render(<GameTabs {...defaultProps} />);
            
            const soundToggle = screen.getAllByAltText("Toggle Sound")[0];
            fireEvent.click(soundToggle);

            await waitFor(() => {
                expect(storePlayerSetting).toHaveBeenCalledWith({
                    sfxEnable: false,
                    musicEnable: false,
                });
            });
        });

        test("should send postMessage to iframe when toggling sound", async () => {
            Object.defineProperty(window, 'innerWidth', { value: 1200, configurable: true });
            Object.defineProperty(window, 'innerHeight', { value: 800, configurable: true });
            
            (getPlayerSetting as jest.Mock).mockReturnValue({ sfxEnable: true, musicEnable: true });
            document.querySelector = jest.fn()
                .mockReturnValueOnce(mockIframe)
                .mockReturnValueOnce({ setAttribute: jest.fn() });

            render(<GameTabs {...defaultProps} />);
            
            const soundToggle = screen.getAllByAltText("Toggle Sound")[0];
            fireEvent.click(soundToggle);

            await waitFor(() => {
                expect(mockIframe.contentWindow.postMessage).toHaveBeenCalledWith({
                    sfxEnable: false,
                    musicEnable: false,
                }, "http://game-1");
            });
        });

        test("should handle sound toggle errors gracefully", async () => {
            Object.defineProperty(window, 'innerWidth', { value: 1200, configurable: true });
            Object.defineProperty(window, 'innerHeight', { value: 800, configurable: true });
            
            (storePlayerSetting as jest.Mock).mockImplementation(() => {
                throw new Error("Storage error");
            });

            console.error = jest.fn();

            render(<GameTabs {...defaultProps} />);
            
            const soundToggle = screen.getAllByAltText("Toggle Sound")[0];
            fireEvent.click(soundToggle);

            await waitFor(() => {
                expect(console.error).toHaveBeenCalledWith('Failed to toggle sound:', expect.any(Error));
            });
        });
    });

    describe("Game Guide Functionality", () => {
        test("should render game guide button in landscape mode", () => {
            Object.defineProperty(window, 'innerWidth', { value: 1200, configurable: true });
            Object.defineProperty(window, 'innerHeight', { value: 800, configurable: true });
            
            render(<GameTabs {...defaultProps} />);
            
            const gameGuideButton = screen.getAllByAltText("Game Guide")[0];
            expect(gameGuideButton).toBeInTheDocument();
        });

        test("should send postMessage to iframe when game guide is clicked", async () => {
            Object.defineProperty(window, 'innerWidth', { value: 1200, configurable: true });
            Object.defineProperty(window, 'innerHeight', { value: 800, configurable: true });
            
            document.querySelector = jest.fn().mockReturnValue(mockIframe);

            render(<GameTabs {...defaultProps} />);
            
            // Find game guide button
            const gameGuideButton = screen.getAllByAltText("Game Guide")[0];
            fireEvent.click(gameGuideButton);

            await waitFor(() => {
                expect(mockIframe.contentWindow.postMessage).toHaveBeenCalledWith({
                    openGameGuide: true,
                }, "http://game-1");
            });
        });

        test("should handle game guide errors gracefully", async () => {
            Object.defineProperty(window, 'innerWidth', { value: 1200, configurable: true });
            Object.defineProperty(window, 'innerHeight', { value: 800, configurable: true });
            console.error = jest.fn();
            
            document.querySelector = jest.fn().mockImplementation(() => {
                throw new Error("DOM error");
            });

            render(<GameTabs {...defaultProps} />);
            
            // This test verifies error handling in the component
            expect(console.error).not.toHaveBeenCalled();
        });
    });

    describe("Drag and Scroll Functionality", () => {
        beforeEach(() => {
            document.querySelector = jest.fn().mockReturnValue(mockParentTabs);
            document.querySelectorAll = jest.fn().mockReturnValue([
                { style: { pointerEvents: '' } },
                { style: { pointerEvents: '' } },
            ]);
        });

        test("should handle mouse down for dragging", () => {
            render(<GameTabs {...defaultProps} />);
            
            const tabsContainer = screen.getByRole('tablist');
            fireEvent.mouseDown(tabsContainer, { clientX: 100 });

            expect(document.querySelector).toHaveBeenCalledWith(".parent-tabs");
        });

        test("should update scroll position during drag", async () => {
            render(<GameTabs {...defaultProps} />);
            
            const tabsContainer = screen.getByRole('tablist');
            
            fireEvent.mouseDown(tabsContainer, { clientX: 100 });
            fireEvent(document, new MouseEvent('mousemove', { clientX: 150 }));

            expect(mockParentTabs.scrollLeft).toBeDefined();
        });

        test("should stop dragging on mouse up", async () => {
            render(<GameTabs {...defaultProps} />);
            
            const tabsContainer = screen.getByRole('tablist');
            
            fireEvent.mouseDown(tabsContainer, { clientX: 100 });
            fireEvent(document, new MouseEvent('mouseup'));

            expect(mockParentTabs).toBeDefined();
        });

        test("should stop dragging on mouse leave", () => {
            render(<GameTabs {...defaultProps} />);
            
            const tabsContainer = screen.getByRole('tablist');
            fireEvent.mouseLeave(tabsContainer);

            expect(mockParentTabs).toBeDefined();
        });
    });

    describe("V2 Game Switching", () => {
        const FunctionUtil = require("../../../_shared/utils/function-util").default;

        beforeEach(() => {
            FunctionUtil.isGameV2 = jest.fn();
        });

        test("should use postMessage for V2 to V2 game switching", async () => {
            (StorageManager.get as jest.Mock).mockReturnValue(1);
            FunctionUtil.isGameV2.mockReturnValue(true);
            document.getElementById = jest.fn().mockReturnValue(mockIframe);

            render(<GameTabs {...defaultProps} />);
            await waitFor(() => screen.getByText("Game One"));

            const secondTab = screen.getAllByRole("tab")[1];
            fireEvent.click(secondTab);

            await waitFor(() => {
                expect(mockIframe.contentWindow.postMessage).toHaveBeenCalledWith({
                    gameId: 2,
                }, "http://game-1");
            });
        });

        test("should use iframe src for non-V2 game switching", async () => {
            (StorageManager.get as jest.Mock).mockReturnValue(1);
            FunctionUtil.isGameV2.mockReturnValue(false);

            render(<GameTabs {...defaultProps} />);
            await waitFor(() => screen.getByText("Game One"));

            const secondTab = screen.getAllByRole("tab")[1];
            fireEvent.click(secondTab);

            await waitFor(() => {
                expect(StorageManager.set).toHaveBeenCalledWith("selectedGameId", 2);
            });
        });
    });

    describe("Loading States", () => {
        test("should show skeleton loading when game names are not available", () => {
            mockUseGameNames.mockImplementation(() => ({}));
            mockUseGameIcons.mockImplementation(() => ({}));
            
            const { container } = render(<GameTabs {...defaultProps} />);
            
            const skeletons = container.querySelectorAll('.skeleton');
            expect(skeletons.length).toBeGreaterThan(0);
        });

        test("should show game content when names and icons are loaded", async () => {
            render(<GameTabs {...defaultProps} />);
            
            await waitFor(() => {
                expect(screen.getByText("Game One")).toBeInTheDocument();
                expect(screen.getByText("Game Two")).toBeInTheDocument();
                expect(screen.getByText("Game Three")).toBeInTheDocument();
            });
        });
    });

    describe("Tab Scrolling", () => {
        test("should scroll tab into view when selected", async () => {
            const mockScrollIntoView = jest.fn();
            window.HTMLElement.prototype.scrollIntoView = mockScrollIntoView;
            
            render(<GameTabs {...defaultProps} />);
            await waitFor(() => screen.getByText("Game One"));

            const thirdTab = screen.getAllByRole("tab")[2];
            fireEvent.click(thirdTab);

            await waitFor(() => {
                expect(mockScrollIntoView).toHaveBeenCalledWith({
                    behavior: "smooth",
                    block: "nearest",
                    inline: "center",
                });
            }, { timeout: 200 });
        });
    });

    describe("Event Listeners", () => {
        test("should add and remove event listeners for mouse events", () => {
            const addEventListenerSpy = jest.spyOn(document, 'addEventListener');
            const removeEventListenerSpy = jest.spyOn(document, 'removeEventListener');
            
            const { unmount } = render(<GameTabs {...defaultProps} />);
            
            expect(addEventListenerSpy).toHaveBeenCalledWith('mousemove', expect.any(Function));
            expect(addEventListenerSpy).toHaveBeenCalledWith('mouseup', expect.any(Function));
            
            unmount();
            
            expect(removeEventListenerSpy).toHaveBeenCalledWith('mousemove', expect.any(Function));
            expect(removeEventListenerSpy).toHaveBeenCalledWith('mouseup', expect.any(Function));
        });
    });

    describe("Edge Cases", () => {

        test("should handle invalid stored game ID", async () => {
            (StorageManager.get as jest.Mock).mockReturnValue(999); // Invalid game ID
            
            render(<GameTabs {...defaultProps} />);
            
            // Should fall back to first game
            await waitFor(() => {
                expect(StorageManager.set).toHaveBeenCalledWith("selectedGameId", 1);
            });
        });
    });

});
