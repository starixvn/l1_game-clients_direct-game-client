import { renderHook } from "@testing-library/react";
import { StorageManager, localStorageKeys } from "../../utils";
import { useRedirectUrl } from "../use-redirect-url";

// Mock the StorageManager
jest.mock("../../utils", () => ({
    StorageManager: {
        get: jest.fn(),
        remove: jest.fn(),
    },
    localStorageKeys: {
        returnUrl: "returnUrl",
    },
}));

describe("useRedirectUrl Hook", () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it("should return the redirectUrl when it is defined", () => {
        // Arrange
        const mockUrl = "http://example.com";
        (StorageManager.get as jest.Mock).mockReturnValue(mockUrl);

        // Act
        const { result } = renderHook(() => useRedirectUrl());

        // Assert
        expect(result.current).toBe(mockUrl);
        expect(StorageManager.remove).toHaveBeenCalledWith(localStorageKeys.returnUrl);
    });

    it('should return an empty string when redirectUrl is "undefined"', () => {
        // Arrange
        (StorageManager.get as jest.Mock).mockReturnValue("undefined");

        // Act
        const { result } = renderHook(() => useRedirectUrl());

        // Assert
        expect(result.current).toBe("");
        expect(StorageManager.remove).toHaveBeenCalledWith(localStorageKeys.returnUrl);
    });
});
