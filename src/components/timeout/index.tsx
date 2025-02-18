import React, { useEffect, useState } from "react";
import "./styles.scss";
import { clearSessionData, localStorageKeys, StorageManager } from "../../_shared/utils";
import { useTranslator } from "../../_shared/react-hooks";
import { ResourceTypes } from "../../_shared/consts";
import ReturnToURLButton from "../common/return-to-url-button";

const TimeOut: React.FC = () => {
    const { t } = useTranslator([ResourceTypes.INSTANT_GAME]);
    const [redirectUrl] = useState(() => {
        const url = StorageManager.get<string>(localStorageKeys.returnUrl);
        if (url === "undefined") {
            return "";
        }
        return url;
    });

    useEffect(() => {
        clearSessionData();
        StorageManager.remove(localStorageKeys.returnUrl);
    }, []);
    return (
        <div className="error-page">
            <img alt="SessionTimeout" className="error-background" src="/images/error-session.svg" />
            <p className="session-timeout-title">{t("message_session_timeout")}</p>
            {redirectUrl && <ReturnToURLButton redirectUrl={redirectUrl} />}
        </div>
    );
};

export default TimeOut;
