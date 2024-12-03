import { appSettings } from "../game-setting";
import Base64Util from "./base64-util";
import { getSession } from "./session-manager";
import { getPlayerSetting } from "./player-setting";

export const getBaseGameUrl = (gameId: number) => {
    let baseUrl = `${appSettings.gameDomain}/direct-client-${gameId}/`;
    if (process.env.NODE_ENV === "development") {
        baseUrl = `http://localhost:7456`;
        //baseUrl = `http://localhost:7456/web-mobile/web-mobile/index.html`;

        if (gameId === 2) {
            baseUrl = `http://localhost:7456`;
        }
    }

    return baseUrl;
};

export const getGameUrl = (gameId: number) => {
    const token = getParamCurrentUrl("token");
    const lang = getParamCurrentUrl("lang");
    const appType = getParamCurrentUrl("appType");
    let baseUrl = getBaseGameUrl(gameId);

    return token
        ? `${baseUrl}?token=${token}&lang=${lang}&purl=${Base64Util.base64Encode(window.location.href)}&appType=${appType}`
        : `${baseUrl}?${buildSessionParams()}`;
};

const buildSessionParams = () => {
    const sessionInfo = getSession();
    const playerSetting = getPlayerSetting();
    const params: any = {
        ss: sessionInfo.session,
        uname: sessionInfo.username,
        lang: sessionInfo.language,
        appType: sessionInfo.system,
        purl: Base64Util.base64Encode(window.location.href),
        musicEnable: playerSetting.musicEnable,
        sfxEnable: playerSetting.sfxEnable,
        isUserGesture: playerSetting.isUserGesture,
    };
    const searchParams = new URLSearchParams();
    Object.keys(params).forEach((key) => params[key] !== undefined && searchParams.append(key, params[key]));
    const encodedQueryString = Base64Util.base64Encode(searchParams.toString());

    return `params=${encodedQueryString}`;
};

export const getParamCurrentUrl = (param: string): string | null => {
    const parsedUrl = new URL(window.location.href);
    return parsedUrl.searchParams.get(param);
};
