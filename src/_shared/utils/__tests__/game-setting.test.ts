import { getOfferedGameIds, getAvailableGameId } from "../game-setting";
import { getLobbyConfigs } from "../../services/lobby-service";
import { getSession } from "../session-manager";
import { appSettings } from "../../game-setting";

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

describe("getOfferedGameIds", () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    test("returns filtered game IDs when hideGameTab is false", async () => {
        // Arrange
        const mockAuthorizeInfo: any = {
            user: {
                offerGames: [{ gameId: "1" }, { gameId: "2" }, { gameId: "3" }],
            },
        };
        const mockSession = { ss: "testSession", username: "testUser" };
        (getSession as jest.Mock).mockReturnValue(mockSession);
        (getLobbyConfigs as jest.Mock).mockResolvedValue({ gameIds: [1, 2] });

        // Act
        const result = await getOfferedGameIds(mockAuthorizeInfo);

        // Assert
        expect(result).toEqual([1, 2]);
        expect(getLobbyConfigs).toHaveBeenCalledWith("testSession", "testUser");
    });

    test("returns only offered games when hideGameTab is true", async () => {
        // Arrange
        const mockAuthorizeInfo: any = {
            user: {
                offerGames: [{ gameId: "1" }, { gameId: "2" }],
            },
        };
        (appSettings.hideGameTab as boolean) = true;

        // Act
        const result = await getOfferedGameIds(mockAuthorizeInfo);

        // Assert
        expect(result).toEqual([1, 2]);
        expect(getLobbyConfigs).not.toHaveBeenCalled();
    });

    test("handles empty offerGames array", async () => {
        // Arrange
        const mockAuthorizeInfo: any = {
            user: {
                offerGames: [],
            },
        };
        const mockSession = { ss: "testSession", username: "testUser" };
        (getSession as jest.Mock).mockReturnValue(mockSession);
        (getLobbyConfigs as jest.Mock).mockResolvedValue({ gameIds: [1, 2, 3] });

        // Act
        const result = await getOfferedGameIds(mockAuthorizeInfo);

        // Assert
        expect(result).toEqual([]);
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
