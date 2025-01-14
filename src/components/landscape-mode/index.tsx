import React, { useCallback, useEffect, useState } from "react";
import "./landscape-mode.scss";
import { ResourceTypes } from "../../_shared/consts";
import { isMobile } from "../../_shared/utils";
import { useTranslator } from "../../_shared/react-hooks";

const orientationType = { portrait: "portrait", landscape: "landscape" };
const orientationChange = "orientationchange";
const ORIENTATION_DELAY = 200;

const isMobileDevice = isMobile();

const LandscapeMode = () => {
    const { t } = useTranslator([ResourceTypes.COMMON]);
    const [orientation, setOrientation] = useState(() =>
        window.innerHeight < window.innerWidth ? orientationType.landscape : orientationType.portrait
    );

    const handleOrientation = useCallback(() => {
        setTimeout(() => {
            setOrientation(window.innerHeight < window.innerWidth ? orientationType.landscape : orientationType.portrait);
        }, ORIENTATION_DELAY);
    }, []);

    useEffect(() => {
        if (isMobileDevice) {
            window.addEventListener(orientationChange, handleOrientation);
            return () => window.removeEventListener(orientationChange, handleOrientation);
        }
    }, [handleOrientation]);

    if (!isMobileDevice || orientation !== orientationType.landscape) return null;

    return (
        <div className="landscape-mode" data-testid="landscape-mode-component">
            <img src="/images/landscape-icon.svg" alt="landscape-icon" />
            <p className="info">{t("rotateDevice")}</p>
        </div>
    );
};

export default LandscapeMode;
