import { useState } from "react";
import { authorize, autoCreateNickname, sso, verifySession } from "../services/auth-service";
import { AuthorizeResponse, SSOResponse } from "sc-user-service-client/dist/auth";
import { storeSessionData } from "../utils";

export const useAuthorization = (token: string, appType: number) => {
    const [isLoading, setIsLoading] = useState(true);
    const [authorizeResponse, setAuthorizeResponse] = useState<AuthorizeResponse>(null);
    const [isSessionTimeout, setIsSessionTimeout] = useState(false);

    const loadSession = async (token: string) => {
        return token ? sso(token, appType) : verifySession();
    };

    const isTimeoutSession = (session: SSOResponse) => {
        return !session || (!session?.isUM && !session?.isAuthenticated);
    };

    const handleAuthorization = async (session: SSOResponse, authorizeInfo: any) => {
        let response = authorizeInfo;
        if (!authorizeInfo?.authorized) {
            response = await autoCreateNickname(session);
            if (!response?.authorized) {
                setIsSessionTimeout(true);
            }
        }
        setAuthorizeResponse(response);
        return response;
    };

    const initialize = async () => {
        try {
            const session = await loadSession(token);
            if (!session || isTimeoutSession(session)) {
                setIsSessionTimeout(true);
                return null;
            }

            storeSessionData(session);
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
        authorizeResponse,
        isSessionTimeout,
        initialize,
    };
};
