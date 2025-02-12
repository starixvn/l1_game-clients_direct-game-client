import { appSettings } from "../game-setting";
import Base64Util from "./base64-util";
import { getSession } from "./session-manager";
import { getPlayerSetting } from "./player-setting";
import { localStorageKeys, StorageManager } from "./storage-manager";
import { locales } from "../consts";

export type VersionsModel = {
    banner: string;
    icon: string;
    localization: number;
};

export type URLContextModel = {
    token?: string;
    lang?: string;
    gameId?: number;
    isDirectMode?: boolean;
    redirectUrl?: string;
    backToLobby?: boolean;
    backToRedirectUrl?: Function;
    firstSSOToLobby?: boolean;
    appType?: number;
    operator?: string;
    ref?: string;
};

export const getRootHost = (host: string): string => {
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

export const getVersionsRemoteUrl = (gameId: number) => {
    return `${getBaseGameUrl(gameId)}remote/versions.json`;
};

export const fetchVersions = async (gameId: number): Promise<VersionsModel> => {
    try {
        const response = await fetch(getVersionsRemoteUrl(gameId));
        if (response.ok) {
            return response.json() as Promise<VersionsModel>;
        }
    } catch (error) {
        console.error(`Error fetching versions for game ${gameId}:`, error);
    }
    return { banner: "", icon: "", localization: 0 };
};

export const getIconGameTabUrl = async (gameId: number) => {
    const versions = await fetchVersions(gameId);
    const versionsIcon = versions.icon;
    return `${getBaseGameUrl(gameId)}remote/icon/icon-game-tab.png?v=${versionsIcon}`;
};

export const getGameBackgroundUrl = (gameId: number) => {
    return `${getBaseGameUrl(gameId)}remote/background/game-background.webp`;
};

export const getGameLocalizationUrl = (gameId: number) => {
    return `${getBaseGameUrl(gameId)}remote/localization.json`;
};

export const getGameUrl = (gameId: number, offeredGamesId: number[]) => {
    const baseUrl = getBaseGameUrl(gameId);
    return `${baseUrl}?${buildSessionParams(offeredGamesId.filter((id) => id !== gameId))}`;
};

const buildSessionParams = (offeredGamesId: number[]) => {
    const sessionInfo = getSession();
    const operator = StorageManager.get(localStorageKeys.operator);
    const ref = StorageManager.get<string>(localStorageKeys.ref) || "";
    const returnUrl = StorageManager.get<string>(localStorageKeys.returnUrl) || "";
    const playerSetting = getPlayerSetting();
    const params: any = {
        ss: sessionInfo.ss,
        uname: sessionInfo.username,
        lang: sessionInfo.language,
        appType: sessionInfo.system,
        purl: Base64Util.base64Encode(window.location.href),
        ref: ref,
        rurl: returnUrl,
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
        const ref = params.get("ref");
        const operator = params.get("op");
        const redirectUrl = isDirectMode || appSettings.hideGameTab ? params.get("rurl") : "";
        globalThis.history.pushState(null, "", globalThis.location?.href.split("?")[0]);
        return { token, lang, gameId, appType, isDirectMode, redirectUrl, operator, ref };
    }

    return {};
}
