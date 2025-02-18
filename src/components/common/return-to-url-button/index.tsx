import React from "react";
import "./styles.scss";
import { useTranslator } from "../../../_shared/react-hooks";
import { ResourceTypes } from "../../../_shared/consts";
import { backToRedirectUrl } from "../../../_shared/utils";

type ReturnToURLButtonProps = {
    redirectUrl: string;
};

const ReturnToURLButton: React.FC<ReturnToURLButtonProps> = ({ redirectUrl }) => {
    const { t } = useTranslator([ResourceTypes.COMMON]);

    const handleBackToReturnURL = () => {
        backToRedirectUrl(redirectUrl);
    };

    return (
        <button id="btn-back" className={"btn-back"} onClick={handleBackToReturnURL}>
            {t(`back`)}
        </button>
    );
};

export default ReturnToURLButton;
