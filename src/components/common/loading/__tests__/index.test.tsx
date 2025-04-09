import React from "react";
import { render, screen } from "@testing-library/react";
import "@testing-library/jest-dom";
import Loading from "../index";
import { AppTypes } from "../../../../_shared/consts";

// Mock the getSession utility
jest.mock("../../../../_shared/utils", () => ({
    getSession: jest.fn(),
}));

describe("Loading Component", () => {
    beforeEach(() => {
        // Clear URL parameters before each test
        window.history.pushState({}, "", "/");
    });

    test("should render fake-tab-menu when appType is DIRECT from URL params", () => {
        // Arrange
        window.history.pushState({}, "", `?appType=${AppTypes.DIRECT}`);

        // Act
        render(<Loading />);

        // Assert
        expect(screen.getByTestId("fake-tab-menu")).toBeInTheDocument();
    });

    test("should render fake-tab-menu when appType is DIRECT from session", () => {
        // Arrange
        const mockSession = { system: AppTypes.DIRECT };
        jest.requireMock("../../../../_shared/utils").getSession.mockReturnValue(mockSession);

        // Act
        render(<Loading />);

        // Assert
        expect(screen.getByTestId("fake-tab-menu")).toBeInTheDocument();
    });

    test("should not render fake-tab-menu when appType is not DIRECT", () => {
        // Arrange
        const mockSession = { system: AppTypes.LOBBY };
        jest.requireMock("../../../../_shared/utils").getSession.mockReturnValue(mockSession);

        // Act
        render(<Loading />);

        // Assert
        expect(screen.queryByTestId("fake-tab-menu")).not.toBeInTheDocument();
    });

    test("should default to appType 0 when no type is provided in URL or session", () => {
        // Arrange
        jest.requireMock("../../../../_shared/utils").getSession.mockReturnValue(null);

        // Act
        render(<Loading />);

        // Assert
        expect(screen.queryByTestId("fake-tab-menu")).not.toBeInTheDocument();
    });
});
