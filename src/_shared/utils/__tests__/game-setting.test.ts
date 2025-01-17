import { getGameIdsByCurrencyGroup, getOfferedGameIdsByCurrencyGroup, getAvailableGameId } from "../game-setting";
import { GroupCurrency } from "../../consts";
import { AuthorizeResponse } from "sc-user-service-client/dist/auth";

jest.mock("../../consts/games-by-currency-group", () => {
    const mockGamesByCurrencyGroup = {
        ["GrUSD"]: [4, 5, 6],
        ["Default"]: [1, 2, 3],
    };
    return {
        gamesByCurrencyGroup: mockGamesByCurrencyGroup,
    };
});

describe("game-setting", () => {
    describe("getGameIdsByCurrencyGroup", () => {
        it("should return game IDs for a given currency group", () => {
            const result = getGameIdsByCurrencyGroup("GrUSD");
            expect(result).toEqual([4, 5, 6]);
        });

        it("should return default game IDs if currency group is not found", () => {
            const result = getGameIdsByCurrencyGroup("NonExistentGroup");
            expect(result).toEqual([1, 2, 3]);
        });
    });

    describe("getOfferedGameIdsByCurrencyGroup", () => {
        it("should return offered game IDs filtered by currency group", () => {
            const authorizeInfo: AuthorizeResponse = {
                user: {
                    currencyGroup: "GrUSD",
                    offerGames: [{ gameId: 4 }, { gameId: 7 }],
                },
            } as any;

            const result = getOfferedGameIdsByCurrencyGroup(authorizeInfo);
            expect(result).toEqual([4]);
        });

        it("should return an empty array if no offered games match the currency group", () => {
            const authorizeInfo: AuthorizeResponse = {
                user: {
                    currencyGroup: "GrUSD",
                    offerGames: [{ gameId: 7 }],
                },
            } as any;

            const result = getOfferedGameIdsByCurrencyGroup(authorizeInfo);
            expect(result).toEqual([]);
        });

        it("should return an empty array if authorizeInfo is null", () => {
            const result = getOfferedGameIdsByCurrencyGroup(null as any);
            expect(result).toEqual([]);
        });
    });

    describe("getAvailableGameId", () => {
        it("should return the first available game ID that is enabled", () => {
            const offeredGameIds = [4, 5, 6];
            const authorizeInfo: AuthorizeResponse = {
                user: {
                    enabledGameIds: [5, 6],
                },
            } as any;

            const result = getAvailableGameId(offeredGameIds, authorizeInfo);
            expect(result).toBe(5);
        });

        it("should return undefined if no offered game IDs are enabled", () => {
            const offeredGameIds = [7, 8, 9];
            const authorizeInfo: AuthorizeResponse = {
                user: {
                    enabledGameIds: [5, 6],
                },
            } as any;

            const result = getAvailableGameId(offeredGameIds, authorizeInfo);
            expect(result).toBeUndefined();
        });

        it("should return undefined if authorizeInfo is null", () => {
            const offeredGameIds = [4, 5, 6];
            const result = getAvailableGameId(offeredGameIds, null as any);
            expect(result).toBeUndefined();
        });
    });
});
