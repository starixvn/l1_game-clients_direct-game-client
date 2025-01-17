import { AuthorizeResponse } from "sc-user-service-client/dist/auth";
import { GroupCurrency } from "../consts";
import { gamesByCurrencyGroup } from "../consts/games-by-currency-group";

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
