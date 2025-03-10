import { render, screen } from "@testing-library/react";
import NonOffer from "../index";
import { useTranslator, useRedirectUrl } from "../../../_shared/react-hooks";
import "@testing-library/jest-dom";

// Mock the useTranslator hook
jest.mock("../../../_shared/react-hooks", () => ({
    useTranslator: jest.fn(),
    useRedirectUrl: jest.fn(),
}));

describe("NonOffer", () => {
    // Setup mock translator before each test
    beforeEach(() => {
        (useTranslator as jest.Mock).mockReturnValue({
            t: (key: string) => `translated_${key}`,
        });
        (useRedirectUrl as jest.Mock).mockReturnValue("https://example.com");
    });

    // Clear all mocks after each test
    afterEach(() => {
        jest.clearAllMocks();
    });

    it("should render correctly with all elements", () => {
        render(<NonOffer />);

        // Check if the warning image is rendered with correct attributes
        const warningImage = screen.getByAltText("NoGamesOffer");
        expect(warningImage).toBeInTheDocument();
        expect(warningImage).toHaveAttribute("src", "/images/icon-warning.png");
        expect(warningImage).toHaveClass("non-offer-icon");

        // Check if the container and wrapper are rendered
        expect(screen.getByTestId("non-offer-page")).toBeInTheDocument();
        expect(screen.getByTestId("non-offer-title-container")).toBeInTheDocument();
        expect(screen.getByTestId("non-offer-icon-wrapper")).toBeInTheDocument();

        // Check if the title is rendered with correct translation
        const titleElement = screen.getByText("translated_message_no_game_offer");
        expect(titleElement).toBeInTheDocument();
        expect(titleElement).toHaveClass("non-offer-title");
    });

    it("should call useTranslator with correct resource type", () => {
        render(<NonOffer />);
        expect(useTranslator).toHaveBeenCalledWith(["Common"]);
    });

    it("should handle translation function being called", () => {
        const mockTranslate = jest.fn((key) => `translated_${key}`);
        (useTranslator as jest.Mock).mockReturnValue({ t: mockTranslate });

        render(<NonOffer />);
        expect(mockTranslate).toHaveBeenCalledWith("message_no_game_offer");
    });
});
