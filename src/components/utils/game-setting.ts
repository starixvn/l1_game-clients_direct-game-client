import { AuthorizeResponse } from "sc-user-service-client/dist/auth";
import { gameSettings } from "../game-setting";
import { IGameSetting } from "../game-setting/type";

const getSortedGameSettings = (authorizeInfo: AuthorizeResponse): IGameSetting[] => {
    const offerGamesIds = getOfferGamesIds(authorizeInfo);
    return gameSettings.filter((game) => offerGamesIds.includes(game.id)).sort((a, b) => a.order - b.order);
};

export const getOfferGamesIds = (authorizeInfo: AuthorizeResponse): number[] => {
    return authorizeInfo?.user?.offerGames?.map((game: any) => +game?.gameId) || [];
};

export const getAndHandleGameOfferIds = (authorizeInfo: AuthorizeResponse, callbackFn: Function) => {
    const gameOfferIds = getSortedGameSettings(authorizeInfo).map((game) => game.id);
    if (gameOfferIds.length > 0) {
        callbackFn(gameOfferIds);
    }
};
