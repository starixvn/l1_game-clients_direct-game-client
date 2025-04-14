import { AuthorizeResponse } from "sc-user-service-client/dist/auth";
import { getLobbyConfigs } from "../services/lobby-service";
import { appSettings } from "../game-setting";
import { getSession } from "./session-manager";
import { AppTypes } from "../consts";
export type LobbyConfig = {
    gameId: number;
    isNew: boolean;
};

export const getOfferedGames = async (authorizeInfo: AuthorizeResponse): Promise<LobbyConfig[]> => {
    const session = getSession();
    const appType = session?.system;
    const offeredGameIds = authorizeInfo?.user?.offerGames?.map((game: any) => +game?.gameId);
    if (appSettings.hideGameTab || appType === AppTypes.LOBBY) {
        return offeredGameIds.map((gameId) => ({ gameId, isNew: false }));
    } else {
        const lobbyGames = await getLobbyGames();
        return lobbyGames.filter((game) => offeredGameIds.includes(game.gameId));
    }
};

const getLobbyGames = async (): Promise<LobbyConfig[]> => {
    const session = getSession();
    const lobbyGames = await getLobbyConfigs(session.ss, session.username);
    if (lobbyGames?.gameIds?.length > 0) {
        return lobbyGames.gameIds.map((gameId) => ({ gameId, isNew: lobbyGames.newGames?.includes(gameId) }));
    }
    return [];
};

export const getAvailableGameId = (offeredGameIds: number[], authorizeInfo: AuthorizeResponse): number | undefined => {
    const enabledGameIds = authorizeInfo?.user?.enabledGameIds || [];
    return offeredGameIds.find((gameId) => enabledGameIds.includes(gameId));
};
