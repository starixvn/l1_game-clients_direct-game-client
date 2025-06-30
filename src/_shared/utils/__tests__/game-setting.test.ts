import { getAvailableGameId, getOfferedGames } from "../game-setting";

// Mock dependencies
jest.mock("../../services/lobby-service");
jest.mock("../session-manager");
jest.mock("../../game-setting", () => ({
    appSettings: {
        hideGameTab: false,
    },
}));
jest.mock("../../utils/url-helper", () => ({
    getBaseServiceUrl: jest.fn().mockReturnValue("https://example.com"),
}));

describe("getOfferedGames", () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    test("handles empty offerGames array", async () => {
        // Arrange
        const mockAuthorizeInfo: any = {
            user: {
                offerGames: [],
            },
        };

        // Act
        const result = await getOfferedGames(mockAuthorizeInfo);

        // Assert
        expect(result).toEqual([]);
    });

    test("handles offerGames array with valid gameIds", async () => {
        // Arrange
        const mockAuthorizeInfo: any = {
            user: {
                offerGames: [{ gameId: 9 }, { gameId: 103 }],
            },
        };

        // Act
        const result = await getOfferedGames(mockAuthorizeInfo);

        // Assert
        expect(result).toEqual([
            { gameId: 9, isNew: false },
            { gameId: 103, isNew: true },
        ]);
    });
});

describe("getAvailableGameId", () => {
    test("returns first matching game ID between offered and enabled games", () => {
        // Arrange
        const offeredGameIds = [1, 2, 3, 4];
        const authorizeInfo: any = {
            user: {
                enabledGameIds: [2, 4, 6],
            },
        };

        // Act
        const result = getAvailableGameId(offeredGameIds, authorizeInfo);

        // Assert
        expect(result).toBe(2);
    });

    test("returns undefined when no matching games found", () => {
        // Arrange
        const offeredGameIds = [1, 3, 5];
        const authorizeInfo: any = {
            user: {
                enabledGameIds: [2, 4, 6],
            },
        };

        // Act
        const result = getAvailableGameId(offeredGameIds, authorizeInfo);

        // Assert
        expect(result).toBeUndefined();
    });

    test("handles empty enabledGameIds array", () => {
        // Arrange
        const offeredGameIds = [1, 2, 3];
        const authorizeInfo: any = {
            user: {
                enabledGameIds: [],
            },
        };

        // Act
        const result = getAvailableGameId(offeredGameIds, authorizeInfo);

        // Assert
        expect(result).toBeUndefined();
    });
});
