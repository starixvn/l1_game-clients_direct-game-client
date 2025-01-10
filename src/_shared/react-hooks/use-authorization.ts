import { useState } from "react";
import { authorize, autoCreateNickname, sso, verifySession } from "../services/auth-service";
import { SSOResponse, UMInfo } from "sc-user-service-client/dist/auth";
import { localStorageKeys, StorageManager, storeSessionData } from "../utils";
import { languageMapping, locales } from "../consts";
import { tolgee } from "../../tolgee";

export const useAuthorization = (token: string, appType: number, language: string) => {
    const [isLoading, setIsLoading] = useState(true);
    const [isSessionTimeout, setIsSessionTimeout] = useState(false);
    const [umInfo, setUMInfo] = useState<UMInfo | null>(null);

    const loadSession = async (token: string | undefined) => {
        return token ? sso(token, appType) : verifySession();
    };

    const loadLanguage = async (session: SSOResponse) => {
        const oldLang = StorageManager.get<string>(localStorageKeys.language);
        const lang = languageMapping[language] || languageMapping[session?.language] || oldLang || locales.en;
        await tolgee.changeLanguage(lang);
        StorageManager.set(localStorageKeys.language, lang);
        return lang;
    };

    const isUM = (session: SSOResponse) => {
        return session?.isUM;
    };

    const isTimeoutSession = (session: SSOResponse) => {
        const isTimeout = !session || (!session?.isUM && !session?.isAuthenticated);
        return isTimeout;
    };

    const handleAuthorization = async (session: SSOResponse, authorizeInfo: any) => {
        let response = authorizeInfo;
        if (!authorizeInfo?.authorized) {
            response = await autoCreateNickname(session);
            if (!response?.authorized) {
                setIsSessionTimeout(true);
            }
        }
        return response;
    };

    const initialize = async () => {
        try {
            const session = await loadSession(token);
            await loadLanguage(session);
            if (!session || isTimeoutSession(session)) {
                setIsSessionTimeout(true);
                return null;
            }

            storeSessionData(session);

            if (isUM(session)) {
                setUMInfo(session.umInfo);
                return;
            }

            const authorizeInfo = await authorize(session);
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
