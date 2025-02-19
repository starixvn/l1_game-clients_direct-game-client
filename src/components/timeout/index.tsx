import React, { useEffect } from "react";
import "./styles.scss";
import { clearSessionData } from "../../_shared/utils";
import { useTranslator } from "../../_shared/react-hooks";
import { ResourceTypes } from "../../_shared/consts";
import ReturnToURLButton from "../common/return-to-url-button";

const TimeOut: React.FC = () => {
    const { t } = useTranslator([ResourceTypes.INSTANT_GAME]);

    useEffect(() => {
        clearSessionData();
    }, []);
    return (
        <div className="timeout-page" data-testid="timeout-page">
            <img alt="timeout" className="timeout-icon" src="/images/icon-timeout.png" />
            <div className="timeout-title-container" data-testid="timeout-title-container">
                <div className="timeout-icon-wrapper" data-testid="timeout-icon-wrapper"></div>
                <p className="timeout-title">{t("message_session_timeout")}</p>
            </div>
            <ReturnToURLButton />
        </div>
    );
};

export default TimeOut;
