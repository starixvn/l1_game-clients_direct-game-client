import React from "react";
import "./styles.scss";
import { useRedirectUrl, useTranslator } from "../../../_shared/react-hooks";
import { ResourceTypes } from "../../../_shared/consts";
import { backToRedirectUrl } from "../../../_shared/utils";

const ReturnToURLButton: React.FC = () => {
    const { t } = useTranslator([ResourceTypes.COMMON]);

    const redirectUrl = useRedirectUrl();
    if (!redirectUrl) {
        return null;
    }

    const handleBackToReturnURL = () => {
        backToRedirectUrl(redirectUrl);
    };

    return (
        <button onClick={handleBackToReturnURL} className="back-button">
            <img src="/images/timeout/ic-back.png" alt="Back Icon" className="back-icon" />
            {t(`back`)}
        </button>
    );
};

export default ReturnToURLButton;
