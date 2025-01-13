import { AuthorizeResponse } from "sc-user-service-client/dist/auth";
import { getOfferedGameIds } from "../game-setting";
import { gameSettings } from "../../game-setting";

// Mock the gameSettings import
jest.mock("../../game-setting", () => ({
    gameSettings: [
        { id: 1, order: 2 },
        { id: 2, order: 1 },
        { id: 3, order: 3 }
    ]
}));

describe("getOfferedGameIds", () => {
    it("should return empty array when authorizeInfo is null", () => {
        const result = getOfferedGameIds(null);
        expect(result).toEqual([]);
    });

    it("should return empty array when user is null", () => {
        const authorizeInfo = {
            authorized: true,
            user: null
        } as AuthorizeResponse;
        const result = getOfferedGameIds(authorizeInfo);
        expect(result).toEqual([]);
    });

    it("should return empty array when offerGames is null", () => {
        const authorizeInfo = {
            authorized: true,
            user: {}
        } as AuthorizeResponse;
        const result = getOfferedGameIds(authorizeInfo);
        expect(result).toEqual([]);
    });

    it("should filter and sort games by order", () => {
        const authorizeInfo = {
            authorized: true,
            user: {
                offerGames: [
                    { gameId: "2" },
                    { gameId: "1" }
                ]
            }
        } as unknown as AuthorizeResponse;

        const result = getOfferedGameIds(authorizeInfo);
        expect(result).toEqual([2, 1]); // Sorted by order (2 has order 1, 1 has order 2)
    });

    it("should handle string gameIds and convert them to numbers", () => {
        const authorizeInfo = {
            authorized: true,
            user: {
                offerGames: [
                    { gameId: "1" }
                ]
            }
        } as unknown as AuthorizeResponse;

        const result = getOfferedGameIds(authorizeInfo);
        expect(result).toEqual([1]);
    });

    it("should handle mixed number and string gameIds", () => {
        const authorizeInfo = {
            authorized: true,
            user: {
                offerGames: [
                    { gameId: 2 },
                    { gameId: "1" }
                ]
            }
        } as unknown as AuthorizeResponse;

        const result = getOfferedGameIds(authorizeInfo);
        expect(result).toEqual([2, 1]); // Sorted by order
    });

    it("should filter out games that are not in gameSettings", () => {
        const authorizeInfo = {
            authorized: true,
            user: {
                offerGames: [
                    { gameId: "999" }, // Non-existent game
                    { gameId: "1" }    // Existing game
                ]
            }
        } as unknown as AuthorizeResponse;

        const result = getOfferedGameIds(authorizeInfo);
        expect(result).toEqual([1]);
    });

    it("should handle empty offerGames array", () => {
        const authorizeInfo = {
            authorized: true,
            user: {
                offerGames: []
            }
        } as unknown as AuthorizeResponse;

        const result = getOfferedGameIds(authorizeInfo);
        expect(result).toEqual([]);
    });
}); 