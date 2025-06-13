import React, { useCallback, useEffect, useState } from "react";
import "./landscape-mode.scss";
import { ResourceTypes } from "../../_shared/consts";
import { useTranslator } from "../../_shared/react-hooks";
import { deviceInfo } from "../../_shared/utils/device-detect-wrapper";

const orientationType = { portrait: "portrait", landscape: "landscape" };
const orientationChange = "orientationchange";
const ORIENTATION_DELAY = 200;

const LandscapeMode = () => {

    const { t } = useTranslator([ResourceTypes.COMMON]);
    const [orientation, setOrientation] = useState(() =>
        window.innerHeight < window.innerWidth ? orientationType.landscape : orientationType.portrait
    );
    const { isMobileOnly } = deviceInfo;
    const handleOrientation = useCallback(() => {
        setTimeout(() => {
            setOrientation(window.innerHeight < window.innerWidth ? orientationType.landscape : orientationType.portrait);
        }, ORIENTATION_DELAY);
    }, []);

    useEffect(() => {
        if (isMobileOnly) {
            window.addEventListener(orientationChange, handleOrientation);
        }
        return () => {
            if (isMobileOnly) {
                window.removeEventListener(orientationChange, handleOrientation);
            }
        };
    }, [handleOrientation]);

    if (!isMobileOnly || orientation !== orientationType.landscape) {
        return null;
    }

    // return (
    //     <div className="landscape-mode" data-testid="landscape-mode-component">
    //         <img src="/images/landscape-icon.svg" alt="landscape-icon" />
    //         <p className="info">{t("rotateDevice")}</p>
    //     </div>
    // );
};

export default LandscapeMode;
