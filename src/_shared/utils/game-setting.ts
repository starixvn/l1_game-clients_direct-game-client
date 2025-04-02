import { AuthorizeResponse } from "sc-user-service-client/dist/auth";
import { getLobbyConfigs } from "../services/lobby-service";
import { appSettings } from "../game-setting";
import { getSession } from "./session-manager";
import { AppTypes } from "../consts";

export const getOfferedGameIds = async (authorizeInfo: AuthorizeResponse) => {
    const session = getSession();
    const appType = session?.system;
    const offeredGameIds = authorizeInfo?.user?.offerGames?.map((game: any) => +game?.gameId);
    if (appSettings.hideGameTab || appType === AppTypes.LOBBY) {
        return offeredGameIds;
    } else {
        const lobbyGameIds = await getLobbyGameIds();
        return lobbyGameIds.filter((gameId) => offeredGameIds.includes(gameId));
    }
};

const getLobbyGameIds = async () => {
    const session = getSession();
    return (await getLobbyConfigs(session.ss, session.username))?.gameIds || [];
};

export const getAvailableGameId = (offeredGameIds: number[], authorizeInfo: AuthorizeResponse): number | undefined => {
    const enabledGameIds = authorizeInfo?.user?.enabledGameIds || [];
    return offeredGameIds.find((gameId) => enabledGameIds.includes(gameId));
};
