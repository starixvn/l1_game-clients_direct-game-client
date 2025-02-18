import React, { useState, useEffect } from "react";
import { getPromotionTournamentIconUrl } from "../../_shared/utils/url-helper";
import { deviceInfo } from "../../_shared/utils/device-detect-wrapper";
import { DIRECT_GAME_VIEWPORT } from "../common/viewport-setting";

const { isMobile } = deviceInfo;
const timeShowIcon = 1000 * 15;

export const PromotionTournamentIcon: React.FC<{ tabHeight?: number; setIsShowIcon: Function }> = ({ setIsShowIcon, tabHeight = 0 }) => {
    const [left, setLeft] = useState<number | string>(0);

    useEffect(() => {
        setTimeout(() => {
            setIsShowIcon(false);
        }, timeShowIcon);
    }, []);

    const calculateDimensions = () => {
        const currentRatio = window.innerWidth / window.innerHeight;
        const isDesktop = (currentRatio > DIRECT_GAME_VIEWPORT.aspectRatio && isMobile) || !isMobile;
        const height = window.innerHeight - tabHeight;
        const width = Math.floor(height * DIRECT_GAME_VIEWPORT.aspectRatio);
        if (isDesktop) {
            const l = (window.innerWidth - +width) / 2;
            setLeft((l < 0 ? 0 : l) + "px");
        } else {
            setLeft("0px");
        }
    };

    useEffect(() => {
        const handleResize = () => {
            calculateDimensions();
        };
        handleResize();
        window.addEventListener("resize", handleResize);
        return () => window.removeEventListener("resize", handleResize);
    }, []);

    return (
        <iframe
            className="promotion-tournament-icon"
            src={getPromotionTournamentIconUrl()}
            title="icon"
            style={{ "--left-icon": `${left}` } as React.CSSProperties}
        />
    );
};
