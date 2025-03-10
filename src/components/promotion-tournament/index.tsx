import React, { useEffect, useState } from "react";
import { appSettings } from "../../_shared/game-setting";
import { GameEventManager, getExistPromotionTournamentUrl, GameEvents } from "../../_shared/utils";
import axios from "axios";

import { PromotionTournamentIcon } from "./promotion-tournament-icon";
import "./styles.scss";
const minutesToMillisecond = 60 * 1000;
const delayTime = appSettings.intervalPromotionByMinute * minutesToMillisecond;

const PromotionTournament: React.FC<{ tabHeight?: number }> = ({ tabHeight = 0 }) => {
    const [isShowIcon, setIsShowIcon] = useState(false);
    const [isLoading, setIsLoading] = useState(true);

    const checkExistPromotion = async () => {
        const isExist = await isExistPromotion();
        setIsShowIcon(isExist);
    };

    const isExistPromotion = async () => {
        try {
            const url = getExistPromotionTournamentUrl();
            const response = await axios.get(url);
            if (response.data?.data) {
                return true;
            }
        } catch (error) {
            console.error(`Get promotion tournament failed: ${error.message}`);
        }
        return false;
    };

    useEffect(() => {
        const interval = setInterval(() => {
            checkExistPromotion();
        }, delayTime);
        checkExistPromotion();
        return () => clearInterval(interval);
    }, []);

    const onVisibilityChange = () => {
        if (document.visibilityState === "hidden") {
            setIsLoading(true);
        }
    };

    useEffect(() => {
        document.addEventListener("visibilitychange", onVisibilityChange);
        return () => document.removeEventListener("visibilitychange", onVisibilityChange);
    }, []);

    const handleSplashEnabled = () => {
        setIsLoading(true);
        setTimeout(() => {
            setIsLoading(false);
        }, 20 * 1000);
        window.dispatchEvent(new Event("resize"));
    };

    useEffect(() => {
        const gameEventManager = GameEventManager.getInstance();
        const listeners = [
            {
                event: GameEvents.splashEnabled,
                handler: handleSplashEnabled,
            },
            {
                event: GameEvents.loading,
                handler: () => setIsLoading(true),
            },
        ];
        const subscribers = listeners.map(({ event, handler }) => gameEventManager.subscribe(event, handler));

        return () => {
            subscribers.forEach((id) => gameEventManager.unsubscribe(id));
        };
    }, []);

    return !isLoading && isShowIcon && <PromotionTournamentIcon tabHeight={tabHeight} setIsShowIcon={setIsShowIcon} />;
};

export default PromotionTournament;
