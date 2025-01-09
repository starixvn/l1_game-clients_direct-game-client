import React from "react";
import "./styles.scss";
import { useTranslator } from "../../../_shared/react-hooks";
import { ResourceTypes } from "../../../_shared/consts";

const TimeOut: React.FC = () => {
    const { t } = useTranslator([ResourceTypes.INSTANT_GAME]);
    return (
        <div className="error-page">
            <img alt="SessionTimeout" className="error-background" src="/images/error-session.svg" />
            <p className="session-timeout-title">{t("message_session_timeout")}</p>
        </div>
    );
};

export default TimeOut;
