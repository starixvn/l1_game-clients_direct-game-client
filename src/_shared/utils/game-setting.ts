import { AuthorizeResponse } from "sc-user-service-client/dist/auth";
import { gameSettings } from "../game-setting";

export const getOfferedGameIds = (authorizeInfo: AuthorizeResponse) => {
    const gameIds = authorizeInfo?.user?.offerGames?.map((game: any) => +game?.gameId) || [];
    return gameSettings
        .filter((game) => gameIds.includes(game.id))
        .sort((a, b) => a.order - b.order)
        .map((game) => game.id);
};
