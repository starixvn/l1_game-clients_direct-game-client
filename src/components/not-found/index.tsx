import React from "react";
import { ResourceTypes } from "../../_shared/consts";
import { useTranslator } from "../../_shared/react-hooks";

const NotFound: React.FC = () => {
    const { t } = useTranslator([ResourceTypes.MESSAGES]);
    return (
        <div className="error-page">
            <img className="error-background small" src="/images/error-light.svg" alt="error" />
            <p className="info">{t("errorOccurred", { errorCode: 404 })}</p>
        </div>
    );
};

export default NotFound;
