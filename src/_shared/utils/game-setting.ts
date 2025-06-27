import { AuthorizeResponse } from "sc-user-service-client/dist/auth";

export type LobbyConfig = {
    gameId: number;
    isNew: boolean;
};

export const getOfferedGames = async (authorizeInfo: AuthorizeResponse): Promise<LobbyConfig[]> => {
    const offeredGameIds = authorizeInfo?.user?.offerGames?.map((game: any) => +game?.gameId);
    return LobbyConfigs.filter((game) => offeredGameIds.includes(game.gameId));
};

const LobbyConfigs = [
    {
        gameId: 9,
        isNew: false,
    },
    {
        gameId: 103,
        isNew: true,
    },
    {
        gameId: 93,
        isNew: false,
    },
    {
        gameId: 1,
        isNew: false,
    },
    {
        gameId: 7,
        isNew: true,
    },
    {
        gameId: 3,
        isNew: false,
    },
    {
        gameId: 45,
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
        gameId: 71,
        isNew: false,
    },
    
    {
        gameId: 80,
        isNew: false,
    }
];


export const getAvailableGameId = (offeredGameIds: number[], authorizeInfo: AuthorizeResponse): number | undefined => {
    const enabledGameIds = authorizeInfo?.user?.enabledGameIds || [];
    return offeredGameIds.find((gameId) => enabledGameIds.includes(gameId));
};
