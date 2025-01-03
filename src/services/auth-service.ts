import { SSOResponse } from "sc-user-service-client/dist/auth";

import { localStorageKeys, StorageManager } from "../components/utils/storage-manager";
import { UserClientCommunication } from "./user-client-communication";

const authService = UserClientCommunication?.getUserClientInstance()?.auth;
const lobbyService = UserClientCommunication?.getUserClientInstance()?.lobby;

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

export const getLobbyConfigs = async (userSession: SSOResponse) => {
    return lobbyService?.getLobbyConfigs(userSession.ss, userSession.username);
};
