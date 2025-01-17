import { render, screen, act } from "@testing-library/react";
import "@testing-library/jest-dom";
import { GameFrame } from "../game-frame";

jest.mock("../../../_shared/utils/url-helper", () => ({
    getGameBackgroundUrl: jest.fn(() => "/background/game-background.webp"),
}));

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
    });

    it("renders iframe with correct dimensions", () => {
        render(<GameFrame {...defaultProps} />);

        const iframe = screen.getByTitle("Game 123");
        expect(iframe).toBeInTheDocument();
        expect(iframe).toHaveAttribute("width", "741"); // Math.floor((1000 - 34) * (828/1078))
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
        expect(iframe).toHaveAttribute("width", "588"); // Math.floor((800 - 34) * (828/1078))
        expect(iframe).toHaveAttribute("height", "766"); // 800 - 34
    });

    it("uses default tabHeight of 0 when not provided", () => {
        render(<GameFrame gameId={123} iframeSrc="https://example.com/game" />);

        const iframe = screen.getByTitle("Game 123");
        expect(iframe).toHaveAttribute("width", "768"); // Math.floor(1000 * (828/1078))
        expect(iframe).toHaveAttribute("height", "1000"); // window.innerHeight - 0
    });
});
