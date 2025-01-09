import React, { useCallback, useEffect, useState } from "react";
import "./landscape-mode.module.scss";
import { useTranslator } from "../../../_shared/react-hooks/use-translator";
import { ResourceTypes } from "../../../_shared/consts";
import { isMobile } from "../../../_shared/utils/device-helper";

const orientationType = { portrait: "portrait", landscape: "landscape" };
const LandscapeMode = () => {
    const { t } = useTranslator([ResourceTypes.COMMON]);
    const [orientation, setOrientation] = useState("");

    const handleOrientation = useCallback(() => {
        setTimeout(() => {
            setOrientation(window.innerHeight < window.innerWidth ? orientationType.landscape : orientationType.portrait);
        }, 200);
    }, []);

    useEffect(() => {
        if (isMobile()) {
            window.addEventListener("orientationchange", handleOrientation);
        }
        return () => {
            window.removeEventListener("orientationchange", handleOrientation);
        };
    }, []);

    return (
        orientation === orientationType.landscape && (
            <div className={"landscape-mode"} data-testid="landscape-mode-component">
                <img src="/images/landscape-icon.svg" alt="landscape-icon" />
                <p className={"info"}>{t("rotateDevice")}</p>
            </div>
        )
    );
};

export default LandscapeMode;
