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
        //return lobbyGames.gameIds.map((gameId) => ({ gameId, isNew: lobbyGames.newGames?.includes(gameId) }));
        return getFakeLobbyGames;
    }
    return [];
};

const getFakeLobbyGames = [
    {
        gameId: 93,
        isNew: false,
    },
    {
        gameId: 103,
        isNew: true,
    },
    {
        gameId: 80,
        isNew: false,
    },
    {
        gameId: 71,
        isNew: false,
    },
    {
        gameId: 3,
        isNew: false,
    },
    {
        gameId: 7,
        isNew: true,
    },
    {
        gameId: 9,
        isNew: false,
    },
    {
        gameId: 10,
        isNew: false,
    },
    {
        gameId: 25,
        isNew: false,
    },
    {
        gameId: 45,
        isNew: false,
    },
];


export const getAvailableGameId = (offeredGameIds: number[], authorizeInfo: AuthorizeResponse): number | undefined => {
    const enabledGameIds = authorizeInfo?.user?.enabledGameIds || [];
    return offeredGameIds.find((gameId) => enabledGameIds.includes(gameId));
};
