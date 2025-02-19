import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import "@testing-library/jest-dom";
import ReturnToURLButton from "../index";
import { backToRedirectUrl } from "../../../../_shared/utils";
import { useTranslator, useRedirectUrl } from "../../../../_shared/react-hooks";

jest.mock("../../../../_shared/utils", () => ({
    backToRedirectUrl: jest.fn(),
}));

jest.mock("../../../../_shared/react-hooks", () => ({
    useTranslator: jest.fn(),
    useRedirectUrl: jest.fn(),
}));

describe("ReturnToURLButton", () => {
    const redirectUrl = "https://example.com";

    const mockTranslate = jest.fn((key) => `translated_${key}`);
    const mockBackToRedirectUrl = jest.fn();

    beforeEach(() => {
        jest.clearAllMocks();

        // Setup useTranslator mock
        (useTranslator as jest.Mock).mockReturnValue({
            t: mockTranslate,
        });

        // Setup backToRedirectUrl mock
        (backToRedirectUrl as jest.Mock).mockImplementation(mockBackToRedirectUrl);

        // Setup useRedirectUrl mock
        (useRedirectUrl as jest.Mock).mockReturnValue(redirectUrl);
    });

    it("should not render if there is no redirect URL", () => {
        // Arrange
        (useRedirectUrl as jest.Mock).mockReturnValue(null);

        // Act
        const { container } = render(<ReturnToURLButton />);

        // Assert
        expect(container.firstChild).toBeNull();
    });

    it("should render correctly with translated message", () => {
        // Arrange
        (useRedirectUrl as jest.Mock).mockReturnValue(redirectUrl);

        // Act
        render(<ReturnToURLButton />);

        // Assert
        const button = screen.getByRole("button");
        expect(button).toBeInTheDocument();
        expect(button).toHaveClass("back-button");

        const image = screen.getByAltText("Back Icon");
        expect(image).toBeInTheDocument();
        expect(image).toHaveAttribute("src", "/images/timeout/ic-back.png");
        expect(image).toHaveClass("back-icon");
    });

    it("should call backToRedirectUrl with the correct URL when clicked", () => {
        // Arrange
        (useRedirectUrl as jest.Mock).mockReturnValue(redirectUrl);

        // Act
        render(<ReturnToURLButton />);
        fireEvent.click(screen.getByRole("button"));

        // Assert
        expect(mockBackToRedirectUrl).toHaveBeenCalledWith(redirectUrl);
    });

    it("should call the translation function with the correct key", () => {
        // Arrange
        (useRedirectUrl as jest.Mock).mockReturnValue(redirectUrl);

        // Act
        render(<ReturnToURLButton />);

        // Assert
        expect(mockTranslate).toHaveBeenCalledWith("back");
    });
});
