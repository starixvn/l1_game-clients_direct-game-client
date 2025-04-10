import "@testing-library/jest-dom";
import { act, render, screen } from "@testing-library/react";
import { GameEventManager, GameEvents } from "../../../_shared/utils";
import FunctionUtil from "../../../_shared/utils/function-util";
import { GameFrame } from "../game-frame";

jest.mock("../../../_shared/utils/url-helper", () => ({
    getGameBackgroundUrl: jest.fn(() => "/background/game-background.webp"),
}));

// Mock FunctionUtil.copyText
jest.spyOn(FunctionUtil, 'copyText').mockImplementation(() => Promise.resolve(true));

describe("GameFrame", () => {
    const defaultProps = {
        gameId: 123,
        iframeSrc: "https://example.com/game",
        tabHeight: 34,
    };

    beforeEach(() => {
        // Mock window.innerHeight
        Object.defineProperty(window, "innerHeight", {
            writable: true,
            configurable: true,
            value: 1000,
        });

        // Mock navigator.clipboard
        Object.defineProperty(navigator, 'clipboard', {
            value: {
                writeText: jest.fn().mockResolvedValue(undefined)
            },
            writable: true
        });
    });

    it("renders iframe with correct dimensions", () => {
        render(<GameFrame {...defaultProps} />);

        const iframe = screen.getByTitle("Game 123");
        expect(iframe).toBeInTheDocument();
        expect(iframe).toHaveAttribute("width", "722"); // Math.floor((1000 - 34) * (828/1107))
        expect(iframe).toHaveAttribute("height", "966"); // 1000 - 34
        expect(iframe).toHaveAttribute("src", "https://example.com/game");
    });

    it("applies correct background image", () => {
        render(<GameFrame {...defaultProps} />);

        const container = screen.getByTitle("Game 123").parentElement;
        expect(container).toHaveStyle({
            backgroundImage: "url(/background/game-background.webp)",
        });
    });

    it("updates dimensions on window resize", () => {
        render(<GameFrame {...defaultProps} />);

        act(() => {
            window.innerHeight = 800;
            window.dispatchEvent(new Event("resize"));
        });

        const iframe = screen.getByTitle("Game 123");
        expect(iframe).toHaveAttribute("width", "572"); // Math.floor((800 - 34) * (828/1107))
        expect(iframe).toHaveAttribute("height", "766"); // 800 - 34
    });

    it("uses default tabHeight of 0 when not provided", () => {
        render(<GameFrame gameId={123} iframeSrc="https://example.com/game" />);

        const iframe = screen.getByTitle("Game 123");
        expect(iframe).toHaveAttribute("width", "562"); // Math.floor(1000 * (756/1344))
        expect(iframe).toHaveAttribute("height", "1000"); // window.innerHeight - 0
    });
    
    it("posts message to iframe contentWindow", async () => {
        render(<GameFrame {...defaultProps} />);
        
        const iframe = screen.getByTitle("Game 123");
        const mockContentWindow = {
            postMessage: jest.fn()
        };

        // Mock the iframe contentWindow
        Object.defineProperty(iframe, 'contentWindow', {
            value: mockContentWindow,
            writable: true
        });

        // Trigger postMessage by simulating copyToClipboard event
        await act(async () => {
            GameEventManager.getInstance().notify(GameEvents.copyToClipboard, {
                copyToClipboard: "test text"
            });
        });

        // Verify postMessage was called with correct data
        expect(mockContentWindow.postMessage).toHaveBeenCalledWith(
            { copySuccessfully: true },
            "https://example.com/game"
        );
    });

    it("handles copyToClipboard failure", async () => {
        render(<GameFrame {...defaultProps} />);
        
        const iframe = screen.getByTitle("Game 123");
        const mockContentWindow = {
            postMessage: jest.fn()
        };

        // Mock the iframe contentWindow
        Object.defineProperty(iframe, 'contentWindow', {
            value: mockContentWindow,
            writable: true
        });

        // Mock FunctionUtil.copyText to return false
        jest.spyOn(FunctionUtil, 'copyText').mockResolvedValue(false);

        // Trigger postMessage by simulating copyToClipboard event
        await act(async () => {
            GameEventManager.getInstance().notify(GameEvents.copyToClipboard, {
                copyToClipboard: "test text"
            });
        });

        // Verify copyText was called with correct text
        expect(FunctionUtil.copyText).toHaveBeenCalledWith("test text");

        // Verify postMessage was called with failure result
        expect(mockContentWindow.postMessage).toHaveBeenCalledWith(
            { copySuccessfully: false },
            "https://example.com/game"
        );
    });

    it("handles copyToClipboard success", async () => {
        render(<GameFrame {...defaultProps} />);
        
        const iframe = screen.getByTitle("Game 123");
        const mockContentWindow = {
            postMessage: jest.fn()
        };

        // Mock the iframe contentWindow
        Object.defineProperty(iframe, 'contentWindow', {
            value: mockContentWindow,
            writable: true
        });

        // Mock FunctionUtil.copyText to return true
        jest.spyOn(FunctionUtil, 'copyText').mockResolvedValue(true);

        // Trigger postMessage by simulating copyToClipboard event
        await act(async () => {
            GameEventManager.getInstance().notify(GameEvents.copyToClipboard, {
                copyToClipboard: "test text"
            });
        });

        // Verify copyText was called with correct text
        expect(FunctionUtil.copyText).toHaveBeenCalledWith("test text");

        // Verify postMessage was called with success result
        expect(mockContentWindow.postMessage).toHaveBeenCalledWith(
            { copySuccessfully: true },
            "https://example.com/game"
        );
    });
});
