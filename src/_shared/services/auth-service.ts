import { SSOResponse } from "sc-user-service-client/dist/auth";

import { appSettings } from "../game-setting";
import UserClientCommunication from "sc-user-service-client/dist/user-client-communication";
import NameGenerator from "../utils/name-generator";
import { randomInteger } from "../utils/number-helper";
import { errorCodes, MAX_AVATAR_ID } from "../consts";
import { getSession, storeSessionData } from "../utils";

const serviceDomain = appSettings.serviceDomain;

const authService = UserClientCommunication?.getUserClientInstance(serviceDomain)?.auth;

export const sso = async (token: string, appType: number): Promise<SSOResponse> => {
    const userSession = await authService?.sso(token, appType);

    if (userSession?.isAuthenticated) {
        storeSessionData(userSession);
    }

    return userSession;
};

export const verifySession = async (): Promise<SSOResponse> => {
    const userSession = getSession();

    if (!userSession?.ss) {
        return userSession;
    }

    const verifySessionResponse = await authService?.verifySession(userSession?.ss, userSession?.username);

    if (verifySessionResponse) {
        userSession.isUM = verifySessionResponse.isUM;
        userSession.umInfo = verifySessionResponse.umInfo;

        if (verifySessionResponse.isSuccessful) {
            storeSessionData(userSession);
        }
    }
    return verifySessionResponse.isSuccessful || userSession.isUM ? userSession : null;
};

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
    const selectedAvatarId = randomInteger(1, MAX_AVATAR_ID);
    let attemptCount = 0;
    let authorizeResponse;
    do {
        const nickname = NameGenerator.generateName();
        authorizeResponse = await createNickname(session, nickname, selectedAvatarId);
        attemptCount++;
    } while (authorizeResponse.errorCode === errorCodes.NICKNAME_EXISTS && attemptCount < 3);

    return authorizeResponse;
};
