import { appSettings } from "../game-setting";

export const getGameUrl = (gameId: number) => {
    const token = getParamCurrentUrl("token");
    const lang = getParamCurrentUrl("lang");
    const ref = getParamCurrentUrl("ref");
    const url = `${appSettings.gameDomain}/direct-client-${gameId}/?token=${token}&lang=${lang}&ref=${ref}`;

    return url;
};

const getParamCurrentUrl = (param: string): string | null => {
    const parsedUrl = new URL(window.location.href);
    return parsedUrl.searchParams.get(param);
};
