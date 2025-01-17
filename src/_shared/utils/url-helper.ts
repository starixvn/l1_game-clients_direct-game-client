import { appSettings } from "../game-setting";
import Base64Util from "./base64-util";
import { getSession } from "./session-manager";
import { getPlayerSetting } from "./player-setting";
import { localStorageKeys, StorageManager } from "./storage-manager";
import { locales } from "../consts";

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

export const getRootHost = (host: string): string => {
    // Split host by dots and get the last two parts
    const parts = host.split(".");

    if (parts.length <= 2) {
        return host;
    }

    return parts.slice(-2).join(".");
};

export const getBaseServiceUrl = (): string => {
    if (!appSettings.serviceDomain) {
        throw new Error("Service domain is not set");
    }

    if (appSettings.isDev) {
        return appSettings.serviceDomain;
    }

    return appSettings.serviceDomain.replace("{host}", getRootHost(window.location.host));
};

export const getBaseGameUrl = (gameId: number) => {
    if (appSettings.clientUrlFormat === null || appSettings.clientUrlFormat === "") {
        throw new Error("Domain URL format is not set");
    }

    if (appSettings.isDev) {
        return appSettings.clientUrlFormat.replace("{gameId}", gameId.toString());
    }

    return appSettings.clientUrlFormat.replace("{gameId}", gameId.toString()).replace("{host}", getRootHost(window.location.host));
};

export const getIconGameTabUrl = (gameId: number) => {
    return `${getBaseGameUrl(gameId)}remote/icon/icon-game-tab.png`;
};

export const getGameBackgroundUrl = (gameId: number) => {
    return `${getBaseGameUrl(gameId)}remote/background/game-background.webp`;
};

export const getGameLocalizationUrl = (gameId: number) => {
    return `${getBaseGameUrl(gameId)}remote/localization.json`;
};

export const getGameUrl = (gameId: number, offeredGamesId: number[]) => {
    const baseUrl = getBaseGameUrl(gameId);
    return `${baseUrl}?${buildSessionParams(offeredGamesId)}`;
};

const buildSessionParams = (offeredGamesId: number[]) => {
    const sessionInfo = getSession();
    const operator = StorageManager.get(localStorageKeys.operator);
    const playerSetting = getPlayerSetting();
    const params: any = {
        ss: sessionInfo.ss,
        uname: sessionInfo.username,
        lang: sessionInfo.language,
        appType: sessionInfo.system,
        purl: Base64Util.base64Encode(window.location.href),
        rurl: Base64Util.base64Encode(window.location.href),
        musicEnable: playerSetting.musicEnable,
        sfxEnable: playerSetting.sfxEnable,
        isUserGesture: false,
        op: operator,
        supportedGamesId: offeredGamesId,
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

export const buildServiceUrlWithPath = (path: string) => {
    const { serviceDomain } = appSettings;
    return `${serviceDomain}${path}`;
};

export function getQueryParameters(): URLContextModel | undefined {
    const params = new URLSearchParams(window.location?.search);
    // Reload page
    if (Array.from(params.values()).length === 0) {
        return {};
    }

    const token = params.get("token") || "";
    if (token) {
        const lang = params.get("lang") ?? locales.en;
        const gameId = Number(params.get("gameId") || 0);
        const appType = Number(params.get("appType") || 1);
        const isDirectMode = !!params.get("ref");
        const operator = params.get("op");
        const redirectUrl = isDirectMode ? params.get("rurl") : "";
        const isThirdParty = isDirectMode && !!redirectUrl;
        globalThis.history.pushState(null, "", globalThis.location?.href.split("?")[0]);
        return { token, lang, gameId, appType, isDirectMode, redirectUrl, isThirdParty, operator };
    }

    return {};
}
