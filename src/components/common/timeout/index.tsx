import React from "react";
import "./styles.scss";
import { ResourceTypes } from "../../../_shared/consts";
import { useTranslator } from "../../../_shared/react-hooks/use-translator";

interface TimeOutProps {
    theme: string;
}

const TimeOut: React.FC<TimeOutProps> = ({ theme }) => {
    const { t } = useTranslator([ResourceTypes.COMMON]);
    return (
        <div className="error-page">
            <img alt="SessionTimeout" className="error-background" src="/images/error-session-light.svg" />
            <p className="session-timeout-title">{t("message_session_timeout")}</p>
        </div>
    );
};

export default TimeOut;
