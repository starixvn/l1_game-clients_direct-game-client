import React from "react";
import { render, screen } from "@testing-library/react";
import "@testing-library/jest-dom";
import Loading from "../index";
import { StorageManager } from "../../../../_shared/utils";
import { useTolgee } from "@tolgee/react";

// Mock dependencies
jest.mock("@tolgee/react", () => ({
    useTolgee: jest.fn(),
}));

jest.mock("../../../../_shared/utils", () => ({
    StorageManager: {
        get: jest.fn(),
    },
    localStorageKeys: {
        operator: "operator",
        language: "language",
    },
}));

describe("Loading Component", () => {
    beforeEach(() => {
        // Reset all mocks before each test
        jest.clearAllMocks();

        // Default Tolgee mock implementation
        (useTolgee as jest.Mock).mockImplementation(() => ({
            getLanguage: () => "en",
        }));
    });

    test("renders basic loading page structure", () => {
        // Arrange
        (StorageManager.get as jest.Mock).mockReturnValue("");

        // Act
        render(<Loading />);

        // Assert
        expect(screen.getByTestId("loading-page")).toBeInTheDocument();
        expect(screen.getByTestId("bg")).toBeInTheDocument();
        expect(screen.getByTestId("loading-icon")).toHaveAttribute("src", "/images/icon-loading.gif");
    });

    test("displays operator logo when operator is provided via URL params", () => {
        // Arrange
        const mockURL = "?op=sp";
        delete window.location;
        window.location = new URL(`http://dummy.com${mockURL}`) as any;

        // Act
        render(<Loading />);

        // Assert
        const logoImg = screen.getByTestId("loading-page").querySelector(".logo-img");
        expect(logoImg).toHaveClass("sp");
    });

    test("displays operator logo when operator is provided via storage", () => {
        // Arrange
        delete window.location;
        window.location = new URL("http://dummy.com") as any;
        (StorageManager.get as jest.Mock).mockImplementation((key) => (key === "operator" ? "vg" : null));

        // Act
        render(<Loading />);

        // Assert
        const logoImg = screen.getByTestId("loading-page").querySelector(".logo-img");
        expect(logoImg).toHaveClass("vg");
    });

    test("uses correct language for logo text from URL params", () => {
        // Arrange
        delete window.location;
        window.location = new URL("http://dummy.com?lang=zh-CN") as any;
        (StorageManager.get as jest.Mock).mockReturnValue("");
        (useTolgee as jest.Mock).mockImplementation(() => ({
            getLanguage: () => "en",
        }));

        // Act
        render(<Loading />);

        // Assert
        const textLogo = screen.getByTestId("text-logo");
        expect(textLogo).toHaveAttribute("src", "/images/logo/text_zh_cn.webp");
    });

    test("falls back to Tolgee language when no language param or storage value exists", () => {
        // Arrange
        delete window.location;
        window.location = new URL("http://dummy.com") as any;
        (StorageManager.get as jest.Mock).mockReturnValue("");
        (useTolgee as jest.Mock).mockImplementation(() => ({
            getLanguage: () => "en",
        }));

        // Act
        render(<Loading />);

        // Assert
        const textLogo = screen.getByTestId("text-logo");
        expect(textLogo).toHaveAttribute("src", "/images/logo/text_en.webp");
    });
});
