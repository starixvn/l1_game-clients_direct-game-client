import React from "react";
import "./landscape-mode.module.scss";
import { useTranslator } from "../../../_shared/react-hooks/use-translator";
import { ResourceTypes } from "../../../_shared/consts";

const LandscapeMode = () => {
    const { t } = useTranslator([ResourceTypes.COMMON]);

    return (
        <div className={"landscape-mode"} data-testid="landscape-mode-component">
            <img src="/images/landscape-icon.svg" alt="landscape-icon" />
            <p className={"info"}>{t("rotateDevice")}</p>
        </div>
    );
};

export default LandscapeMode;
