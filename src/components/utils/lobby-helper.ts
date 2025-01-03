import { AuthorizeResponse } from "sc-user-service-client/dist/auth";
import { LobbyConfigs } from "sc-user-service-client/dist/lobby";

export interface ILobbyConfigs {
    name: string;
    currencyGroupIds: string[];
    miniPanelGameIds: number[];
    categories: IGameCategory[];
}

export interface IGameCategory {
    name: any;
    gameSettings: IGameSetting[];
}

export interface IGameSetting {
    gameId: number;
    bigSize: boolean;
    newTag: boolean;
}

export const getOfferGamesIds = (authorizeInfo: AuthorizeResponse): number[] => {
    return authorizeInfo?.user?.offerGames?.map((game: any) => +game?.gameId) || [];
};

export const getLobbyGameIds = (lobbyConfigs: ILobbyConfigs): number[] => {
    const gameIds = lobbyConfigs?.categories?.[0]?.gameSettings?.map((setting) => setting.gameId);
    return gameIds;
};

export const getLobbyGamesIds = (lobbyConfigs: ILobbyConfigs, authorizeInfo: AuthorizeResponse) => {
    const offerGamesIds = getOfferGamesIds(authorizeInfo);
    const lobbyGameIds = getLobbyGameIds(lobbyConfigs);
    const filteredGameIds = lobbyGameIds?.filter((gameId) => offerGamesIds.includes(gameId));
    return filteredGameIds;
};

export const getAndHandleGameOfferIds = (authorizeInfo: AuthorizeResponse, lobbyConfigs: LobbyConfigs, callbackFn: Function) => {
    const gameOfferIds = getLobbyGamesIds(lobbyConfigs, authorizeInfo);
    if (gameOfferIds.length > 0) {
        callbackFn(gameOfferIds);
    }
};
