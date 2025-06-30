import { renderHook, waitFor } from "@testing-library/react";
import { useTolgee } from "@tolgee/react";
import { getGameLocalizationUrl, getIconGameTabUrl } from "../../utils/url-helper";
import { useGameIcons, useGameNames } from "../use-game-resources";

// Mock dependencies
jest.mock("@tolgee/react", () => ({
    useTolgee: jest.fn(),
}));

jest.mock("../../utils/url-helper", () => ({
    getGameLocalizationUrl: jest.fn(),
    getIconGameTabUrl: jest.fn(),
}));

describe("useGameNames", () => {
    const mockTolgee = { getLanguage: jest.fn().mockReturnValue("en") };

    beforeEach(() => {
        jest.clearAllMocks();
        (useTolgee as jest.Mock).mockReturnValue(mockTolgee);
        global.fetch = jest.fn();
    });

    it("should fetch and return game names for given game IDs", async () => {
        // Arrange
        const gameIds = [1, 2];
        const mockResponseGameV3 = {
            gameNames: {
                en: "Test Game",
            },
        };
        const mockResponseGameV2 = {
            gameNames: {
                1: { en: "Test Game" },
                2: { en: "Test Game" },
            },
        };
        (global.fetch as jest.Mock)
            .mockResolvedValueOnce({
                ok: true,
                json: () => Promise.resolve(mockResponseGameV3),
            })
            .mockResolvedValueOnce({
                ok: true,
                json: () => Promise.resolve(mockResponseGameV3),
            })
            .mockResolvedValueOnce({
                ok: true,
                json: () => Promise.resolve(mockResponseGameV2),
            })
            .mockResolvedValueOnce({
                ok: true,
                json: () => Promise.resolve(mockResponseGameV2),
            });

        (getGameLocalizationUrl as jest.Mock).mockImplementation((id) => `url-${id}`);

        // Act
        const { result } = renderHook(() => useGameNames(gameIds));

        // Assert
        await waitFor(() => {
            expect(result.current).toEqual({
                1: "Test Game",
                2: "Test Game",
            });
        });
        expect(getGameLocalizationUrl).toHaveBeenCalledTimes(4);
        expect(global.fetch).toHaveBeenCalledTimes(4);
    });

    it("should return fallback game names when API request fails", async () => {
        // Arrange
        const gameIds = [1];
        (global.fetch as jest.Mock).mockRejectedValue(new Error("Network error"));

        // Act
        const { result } = renderHook(() => useGameNames(gameIds));

        // Assert
        await waitFor(() => {
            expect(result.current).toEqual({
                1: "game-1",
            });
        });
    });

    it("should update game V2 names when language changes", async () => {
        // Arrange
        const gameIds = [1];
        const mockResponseEn = {
            gameNames: { 1: { en: "English Name" } },
        };
        const mockResponseDe = {
            gameNames: { 1: { de: "German Name" } },
        };

        (global.fetch as jest.Mock).mockResolvedValueOnce({
            ok: true,
            json: () => Promise.resolve(mockResponseEn),
        });
        (getGameLocalizationUrl as jest.Mock).mockImplementation((id) => `url-${id}`);

        // Act
        const { result, rerender } = renderHook(() => useGameNames(gameIds));

        // Assert initial language
        await waitFor(() => {
            expect(result.current).toEqual({
                1: "English Name",
            });
        });

        // Change language and rerender
        mockTolgee.getLanguage.mockReturnValue("de");
        (global.fetch as jest.Mock).mockResolvedValueOnce({
            ok: true,
            json: () => Promise.resolve(mockResponseDe),
        });
        rerender();

        await waitFor(() => {
            expect(result.current).toEqual({
                1: "German Name",
            });
        });
    });

    // it("should update game V3 names when language changes", async () => {
    //     // Arrange
    //     const gameIds = [2];


    //     const mockResponseV3En = {
    //         gameNames: { en: "English Name" },
    //     };
    //     const mockResponseV3De = {
    //         gameNames: { de: "German Name" },
    //     };

    //     (global.fetch as jest.Mock).mockResolvedValueOnce({
    //         ok: true,
    //         json: () => Promise.resolve(mockResponseV3En),
    //     });
    //     (getGameLocalizationUrl as jest.Mock).mockImplementation((id) => `url-${id}`);

    //     // Act
    //     const { result, rerender } = renderHook(() => useGameNames(gameIds));

    //     // Assert initial language
    //     await waitFor(() => {
    //         expect(result.current).toEqual({
    //             2: "English Name",
    //         });
    //     });

    //     // Change language and rerender
    //     mockTolgee.getLanguage.mockReturnValue("de");
    //     (global.fetch as jest.Mock).mockResolvedValueOnce({
    //         ok: true,
    //         json: () => Promise.resolve(mockResponseV3De),
    //     });
    //     rerender();

    //     await waitFor(() => {
    //         expect(result.current).toEqual({
    //             2: "German Name",
    //         });
    //     });
    // });
});

describe("useGameIcons", () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it("should fetch and return icon URLs for given game IDs", async () => {
        // Arrange
        const gameIds = [1, 2];
        (getIconGameTabUrl as jest.Mock).mockImplementation((id) => Promise.resolve(`icon-url-${id}`));

        // Act
        const { result } = renderHook(() => useGameIcons(gameIds));

        // Assert
        await waitFor(() => {
            expect(result.current).toEqual({
                1: "icon-url-1",
                2: "icon-url-2",
            });
        });
        expect(getIconGameTabUrl).toHaveBeenCalledTimes(4);
    });

    it("should update icon URLs when game IDs change", async () => {
        // Arrange
        const initialGameIds = [1];
        (getIconGameTabUrl as jest.Mock).mockImplementation((id) => Promise.resolve(`icon-url-${id}`));

        // Act
        const { result, rerender } = renderHook((props) => useGameIcons(props), {
            initialProps: initialGameIds,
        });

        // Assert initial render
        await waitFor(() => {
            expect(result.current).toEqual({
                1: "icon-url-1",
            });
        });

        // Rerender with new game IDs
        rerender([1, 2]);

        await waitFor(() => {
            expect(result.current).toEqual({
                1: "icon-url-1",
                2: "icon-url-2",
            });
        });
    });
});
