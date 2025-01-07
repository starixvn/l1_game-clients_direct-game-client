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
};

export const getBaseGameUrl = (gameId: number) => {
    let baseUrl = `${appSettings.gameDomain}/direct-client-${gameId}/`;
    if (process.env.NODE_ENV === "development") {
        //baseUrl = `http://localhost:7456`;
        baseUrl = `http://localhost:7456/web-mobile/web-mobile/index.html`;

        if (gameId === 2) {
            //baseUrl = `http://localhost:7456`;
        }
    }

    return baseUrl;
};

export const getGameUrl = (gameId: number) => {
    const { token, lang, appType } = loadURLContext();

    let baseUrl = getBaseGameUrl(gameId);
    const gameUrl = token
        ? `${baseUrl}?token=${token}&lang=${lang}&purl=${Base64Util.base64Encode(window.location.href)}&appType=${appType}`
        : `${baseUrl}?${buildSessionParams()}`;

    return gameUrl;
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

export const buildUrlWithPath = (path: string) => {
    const { gameDomain } = appSettings;
    return `${gameDomain}${path}`;
};

export function parseContextFromURL(): URLContextModel | undefined {
    const params = new URLSearchParams(window.location?.search);
    // Reload page
    if (Array.from(params.values()).length === 0) {
        return;
    }

    const token = params.get("token") || "";
    const lang = params.get("lang");
    const gameId = Number(params.get("gameId") || 0);
    const appType = Number(params.get("appType") || 0);
    const isDirectMode = !!params.get("ref");
    const redirectUrl = isDirectMode ? params.get("rurl") : "";
    const isThirdParty = isDirectMode && !!redirectUrl;

    return { token, lang, gameId, appType, isDirectMode, redirectUrl, isThirdParty, firstSSOToLobby: true };
}

export function loadURLContext(): URLContextModel {
    const contextFromURL = parseContextFromURL();
    const contextFromLocalStorage = StorageManager?.get(localStorageKeys.url) || null;

    if (!!contextFromURL) {
        const contextString = { ...contextFromURL, token: contextFromURL.token };

        globalThis.history.pushState(null, "", globalThis.location?.href.split("?")[0]);
        StorageManager?.set(localStorageKeys.url, contextString);
    }

    return contextFromURL || contextFromLocalStorage;
}
