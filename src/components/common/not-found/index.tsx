import React from "react";
import { useTranslation } from "react-i18next";
import "../errors.scss";
import errorLight from "../../../assets/error-light.svg";

const NotFound: React.FC = () => {
    const { t } = useTranslation("messages");
    return (
        <div className="error-page">
            <img className="error-background small" src={errorLight} alt="error" />
            <p className="info">
                {/* <Trans t={t}>{t("errorOccurred", { errorCode: 404 })}</Trans> */}
                An error has occurred, please contact CSD for details.(404)
            </p>
        </div>
    );
};

export default NotFound;
