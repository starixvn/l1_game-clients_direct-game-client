import { AuthorizeResponse } from "sc-user-service-client/dist/auth";
import { gamesByCurrencyGroup } from "../game-setting";
import { GroupCurrency } from "../consts";

export const getGameIdsByCurrencyGroup = (currencyGroup: string) => {
    return gamesByCurrencyGroup[currencyGroup] || gamesByCurrencyGroup[GroupCurrency.Default];
};

export const getOfferedGameIdsByCurrencyGroup = (authorizeInfo: AuthorizeResponse) => {
    const currencyGroup = authorizeInfo?.user?.currencyGroup;
    const gameIds = authorizeInfo?.user?.offerGames?.map((game: any) => +game?.gameId) || [];
    const gameIdsByCurrencyGroup = getGameIdsByCurrencyGroup(currencyGroup);

    return gameIdsByCurrencyGroup.filter((gameId) => gameIds.includes(gameId));
};

export const getAvailableGameId = (offeredGameIds: number[], authorizeInfo: AuthorizeResponse): number | undefined => {
    const enabledGameIds = authorizeInfo?.user?.enabledGameIds || [];
    return offeredGameIds.find((gameId) => enabledGameIds.includes(gameId));
};
