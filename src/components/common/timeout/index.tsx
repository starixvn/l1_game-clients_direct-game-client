import React, { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import errorSessionLight from "../../../../public/images/error-session-light.svg";
import errorSessionDark from "../../../../public/images/error-session-dark.svg";
import { Themes } from "../../consts";

interface TimeOutProps {
    theme: string;
}

const TimeOut: React.FC<TimeOutProps> = ({ theme }) => {
    const { t } = useTranslation("common");
    const errorSession = theme === Themes.light ? errorSessionLight : errorSessionDark;
    return (
        <div className="error-page">
            <img alt="SessionTimeout" className="error-background" src={errorSession} />
            <p className="session-timeout-title">
                {/* TODO: Will add i18n later */}
                {/* {t("message_session_timeout")} */}
                Your session has timed out or you have not logged in yet. <br /> Please close the current windows and try to login again.
            </p>
        </div>
    );
};

export default TimeOut;
