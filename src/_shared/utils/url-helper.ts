import { appSettings } from "../game-setting";
import Base64Util from "./base64-util";
import { getSession } from "./session-manager";
import { getPlayerSetting } from "./player-setting";
import { localStorageKeys, StorageManager } from "./storage-manager";

export type URLContextModel = {
    token?: string;
    lang?: string;
    gameId?: number;
    isDirectMode?: boolean;
    redirectUrl?: string;
    isThirdParty?: boolean;
    backToLobby?: boolean;
    backToRedirectUrl?: Function;
    firstSSOToLobby?: boolean;
    appType?: number;
    operator?: string;
};

export const getBaseGameUrl = (gameId: number) => {
    let baseUrl = `${appSettings.gameDomain}/direct-client-${gameId}/`;
    // if (process.env.NODE_ENV === "development") {
    //     //baseUrl = `http://localhost:7456`;
    //     baseUrl = `http://localhost:7456/web-mobile/web-mobile/index.html`;

    //     if (gameId === 2) {
    //         //baseUrl = `http://localhost:7456`;
    //     }
    // }

    return baseUrl;
};

export const getGameUrl = (gameId: number) => {
    let baseUrl = getBaseGameUrl(gameId);
    return `${baseUrl}?${buildSessionParams()}`;
};

const buildSessionParams = () => {
    const sessionInfo = getSession();
    const operator = StorageManager.get(localStorageKeys.operator);
    const playerSetting = getPlayerSetting();
    const params: any = {
        ss: sessionInfo.ss,
        uname: sessionInfo.username,
        lang: sessionInfo.language,
        appType: sessionInfo.system,
        purl: Base64Util.base64Encode(window.location.href),
        musicEnable: playerSetting.musicEnable,
        sfxEnable: playerSetting.sfxEnable,
        isUserGesture: playerSetting.isUserGesture,
        op: operator,
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

export const buildUrlWithPath = (path: string) => {
    const { gameDomain } = appSettings;
    return `${gameDomain}${path}`;
};

export function getQueryParameters(): URLContextModel | undefined {
    const params = new URLSearchParams(window.location?.search);
    // Reload page
    if (Array.from(params.values()).length === 0) {
        return {};
    }

    const token = params.get("token") || "";
    if (token) {
        const lang = params.get("lang");
        const gameId = Number(params.get("gameId") || 0);
        const appType = Number(params.get("appType") || 0);
        const isDirectMode = !!params.get("ref");
        const operator = params.get("op");
        const redirectUrl = isDirectMode ? params.get("rurl") : "";
        const isThirdParty = isDirectMode && !!redirectUrl;
        globalThis.history.pushState(null, "", globalThis.location?.href.split("?")[0]);
        return { token, lang, gameId, appType, isDirectMode, redirectUrl, isThirdParty, operator, firstSSOToLobby: true };
    }

    return {};
}
