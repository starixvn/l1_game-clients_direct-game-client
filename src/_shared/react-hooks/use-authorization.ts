import { useState } from "react";
import { authorize, autoCreateNickname, sso, verifySession } from "../services/auth-service";
import { SSOResponse, AuthorizeResponse, UMInfo } from "sc-user-service-client/dist/auth";
import { getQueryParameters, localStorageKeys, StorageManager, storeSessionData } from "../utils";
import { languageMapping, locales } from "../consts";
import { tolgee } from "../../tolgee";

export const useAuthorization = () => {
    const [isLoading, setIsLoading] = useState(true);
    const [isSessionTimeout, setIsSessionTimeout] = useState(false);
    const [umInfo, setUMInfo] = useState<UMInfo | null>(null);

    const loadSession = async (token: string | undefined, appType: number) => {
        return token ? sso(token, appType) : verifySession();
    };

    const loadLanguage = async (session: SSOResponse, languageCode: string) => {
        const oldLang = StorageManager.get<string>(localStorageKeys.language);
        const lang = languageMapping[languageCode] || languageMapping[session?.language] || oldLang || locales.en;
        await tolgee.changeLanguage(lang);
        StorageManager.set(localStorageKeys.language, lang);
        return lang;
    };

    const isUM = (session: SSOResponse) => {
        return session?.isUM;
    };

    const isTimeoutSession = (session: SSOResponse) => {
        return !session || (!session?.isUM && !session?.isAuthenticated);
    };

    const handleAuthorization = async (session: SSOResponse, authorizeInfo: AuthorizeResponse) => {
        let response = authorizeInfo;
        if (!authorizeInfo?.authorized) {
            response = await autoCreateNickname(session);
            if (!response?.authorized) {
                setIsSessionTimeout(true);
            }
        }
        return response;
    };

    const initialize = async (): Promise<AuthorizeResponse | null> => {
        try {
            const queryParameters = getQueryParameters();
            const { token, appType, lang: language, operator } = queryParameters;
            const session = await loadSession(token, appType);
            await loadLanguage(session, language);
            if (!session || isTimeoutSession(session)) {
                setIsSessionTimeout(true);
                return null;
            }

            storeSessionData(session);

            if (isUM(session)) {
                setUMInfo(session.umInfo);
                return null;
            }

            operator && StorageManager.set(localStorageKeys.operator, operator);
            token && StorageManager.remove(localStorageKeys.selectedGameId);
            const authorizeInfo = (await authorize(session)) as AuthorizeResponse;
            return await handleAuthorization(session, authorizeInfo);
        } catch (error) {
            console.log("Authorization error: ", error);
            return null;
        } finally {
            setIsLoading(false);
        }
    };

    return {
        isLoading,
        umInfo,
        setUMInfo,
        isSessionTimeout,
        initialize,
    };
};
