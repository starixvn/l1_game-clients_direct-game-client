import { render, screen } from "@testing-library/react";
import TimeOut from "../index";
import { clearSessionData, StorageManager, localStorageKeys } from "../../../_shared/utils";
import { useTranslator } from "../../../_shared/react-hooks";
import "@testing-library/jest-dom";

// Disable React.StrictMode for tests
jest.mock("react", () => ({
    ...jest.requireActual("react"),
    StrictMode: ({ children }) => children,
}));

// Mock the dependencies
jest.mock("../../../_shared/utils", () => ({
    clearSessionData: jest.fn(),
    StorageManager: {
        get: jest.fn(),
        remove: jest.fn(),
    },
    localStorageKeys: {
        returnUrl: "returnUrl",
    },
}));

jest.mock("../../../_shared/react-hooks", () => ({
    useTranslator: jest.fn(),
}));

describe("TimeOut Component", () => {
    // Arrange - Setup for all tests
    const mockTranslate = jest.fn((key) => `translated_${key}`);
    const mockClearSessionData = jest.fn();

    beforeEach(() => {
        // Reset all mocks before each test
        jest.clearAllMocks();

        // Setup useTranslator mock
        (useTranslator as jest.Mock).mockReturnValue({
            t: mockTranslate,
        });

        // Setup clearSessionData mock
        (clearSessionData as jest.Mock).mockImplementation(mockClearSessionData);

        (StorageManager.get as jest.Mock).mockReturnValue("https://example.com");
        (StorageManager.remove as jest.Mock).mockImplementation(() => {});
    });

    it("should render correctly with translated message", () => {
        // Act
        render(<TimeOut />);

        // Assert
        // Verify the image is rendered with correct attributes
        const image = screen.getByAltText("SessionTimeout");
        expect(image).toBeInTheDocument();
        expect(image).toHaveAttribute("src", "/images/error-session.svg");
        expect(image).toHaveClass("error-background");

        // Verify the translated message is rendered
        const message = screen.getByText("translated_message_session_timeout");
        expect(message).toBeInTheDocument();
        expect(message).toHaveClass("session-timeout-title");
    });

    it("should call useTranslator with correct resource type", () => {
        // Arrange
        const expectedResourceType = ["InstantGame"];
        (useTranslator as jest.Mock).mockReturnValue({
            t: jest.fn(),
        });

        // Act
        render(<TimeOut />);

        // Assert
        expect(useTranslator).toHaveBeenCalledWith(expectedResourceType);
    });

    it("should call clearSessionData on mount", () => {
        // Arrange
        const strictModeCalls = 2; // React 18 Strict Mode calls effects twice in development

        // Act
        render(<TimeOut />);

        // Assert
        expect(mockClearSessionData).toHaveBeenCalledTimes(strictModeCalls);
    });

    it("should have correct className for error page container", () => {
        // Act
        const { container } = render(<TimeOut />);

        // Assert
        expect(container.firstChild).toHaveClass("error-page");
    });
});
