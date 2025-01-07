import { AuthorizeResponse, SSOResponse } from "sc-user-service-client/dist/auth";

import { localStorageKeys, StorageManager } from "../components/utils/storage-manager";
import { appSettings } from "../components/game-setting";
import UserClientCommunication from "sc-user-service-client/dist/user-client-communication";
import NameGenerator from "../components/utils/name-generator";
import { randomInteger } from "../components/utils/number-helper";
import { MAX_AVATAR_ID } from "../components/consts";

const gameDomain = appSettings.gameDomain;

const authService = UserClientCommunication?.getUserClientInstance(gameDomain)?.auth;

export const sso = async (token: string, appType: number): Promise<SSOResponse> => {
    const userSession = await authService?.sso(token, appType);

    if (userSession?.isAuthenticated) {
        StorageManager.set(localStorageKeys.session, userSession);
    }

    return userSession;
};

export const verifySession = async (): Promise<SSOResponse> => {
    const userSession = StorageManager.get<SSOResponse>(localStorageKeys.session);

    if (!userSession) {
        return null;
    }

    const verifySessionResponse = await authService?.verifySession(userSession?.ss, userSession?.username);

    if (verifySessionResponse) {
        userSession.isUM = verifySessionResponse.isUM;
        userSession.umInfo = verifySessionResponse.umInfo;

        if (verifySessionResponse.isSuccessful) {
            StorageManager.set(localStorageKeys.session, userSession);
        }
    }
    return verifySessionResponse.isSuccessful || userSession.isUM ? userSession : null;
};

export const clearSession = () => StorageManager.remove(localStorageKeys.session);

export const reCheckIn = async (userSession: SSOResponse) => {
    return authService?.reCheckIn(userSession?.ss, userSession?.username);
};

export const createNickname = async (userSession: SSOResponse, nickname: string, avatarId: number) => {
    return authService?.signName(userSession.ss, userSession.username, nickname, avatarId);
};

export const authorize = async (userSession: SSOResponse) => {
    return authService?.authorize(userSession.ss, userSession.username);
};

export const getBalance = async (userSession: SSOResponse) => {
    return authService?.getBalance(userSession.ss, userSession.username);
};

export const autoCreateNickname = async (session: SSOResponse) => {
    const nickname = NameGenerator.generateName();
    const selectedAvatarId = randomInteger(1, MAX_AVATAR_ID);
    const authorizeResponse = (await createNickname(session, nickname, selectedAvatarId)) as AuthorizeResponse;

    return authorizeResponse;
};
