import React from "react";
import { useTranslation } from "react-i18next";

interface TimeOutProps {
    theme: string;
}

const TimeOut: React.FC<TimeOutProps> = ({ theme }) => {
    const { t } = useTranslation("common");
    return (
        <div className="error-page">
            <img alt="SessionTimeout" className="error-background" src="/images/error-session-light.svg" />
            <p className="session-timeout-title">
                {/* TODO: Will add i18n later */}
                {/* {t("message_session_timeout")} */}
                Your session has timed out or you have not logged in yet. <br />
                Please close the current windows and try to login again.
            </p>
        </div>
    );
};

export default TimeOut;
