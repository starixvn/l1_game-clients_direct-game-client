import React, { useEffect, useRef, useState } from "react";

import { GameEventManager, GameEvents } from "../../_shared/utils/game-event-manager";
import { storePlayerSetting } from "../../_shared/utils/player-setting";
import { GameContainer } from "./styles/game-frame.style";
import { getGameBackgroundUrl } from "../../_shared/utils/url-helper";
import { deviceInfo } from "../../_shared/utils/device-detect-wrapper";

interface GameFrameProps {
    gameId: number;
    iframeSrc: string;
    tabHeight?: number;
}
const { isMobile } = deviceInfo;

// Default game window configuration
const GAME_CONFIG = {
    width: 828,
    height: 1107,
    aspectRatio: 828 / 1107,
};

export const GameFrame: React.FC<GameFrameProps> = ({ gameId, iframeSrc, tabHeight = 0 }) => {
    const wrapperIframeRef = useRef<HTMLIFrameElement>(null);
    const containerRef = useRef<HTMLDivElement>(null);
    const [dimensions, setDimensions] = useState<{
        width: number | string;
        height: number | string;
    }>({ width: GAME_CONFIG.width, height: GAME_CONFIG.height });

    const calculateDimensions = (isDesktop: boolean) => {
        const height = window.innerHeight - tabHeight;
        const width = Math.floor(height * GAME_CONFIG.aspectRatio);
        isDesktop ? setDimensions({ width, height }) : setDimensions({ width: "100%", height: "100%" });
    };

    const calculateDesktopView = () => {
        const currentRatio = window.innerWidth / window.innerHeight;
        return (currentRatio > GAME_CONFIG.aspectRatio && isMobile) || !isMobile;
    };

    useEffect(() => {
        const handleResize = () => {
            const isDesktop = calculateDesktopView();
            calculateDimensions(isDesktop);
        };
        handleResize();
        window.addEventListener("resize", handleResize);
        return () => window.removeEventListener("resize", handleResize);
    }, [tabHeight]);

    useEffect(() => {
        let timeoutResize: NodeJS.Timeout;
        const triggerResize = () => {
            clearTimeout(timeoutResize);
            timeoutResize = setTimeout(() => {
                window.dispatchEvent(new Event("resize"));
            }, 500);
        };

        const listeners = [
            { event: GameEvents.musicEnable, handler: storePlayerSetting },
            { event: GameEvents.sfxEnable, handler: storePlayerSetting },
            { event: GameEvents.isUserGesture, handler: storePlayerSetting },
            { event: GameEvents.replaceUrl, handler: (data) => window.location.replace(data.replaceUrl) },
            { event: GameEvents.splashEnabled, handler: triggerResize },
        ];
        const gameEventManager = GameEventManager.getInstance();
        const subscribers = listeners.map(({ event, handler }) => gameEventManager.subscribe(event, handler));

        return () => {
            subscribers.forEach((id) => gameEventManager.unsubscribe(id));
            clearTimeout(timeoutResize);
        };
    }, []);

    return (
        <GameContainer
            ref={containerRef}
            $gameId={gameId}
            $height={dimensions.height}
            $remoteGameBackgroundUrl={getGameBackgroundUrl(gameId)}
        >
            <iframe
                ref={(el) => {
                    if (el) {
                        wrapperIframeRef.current = el;
                    }
                }}
                title={`Game ${gameId}`}
                width={dimensions.width}
                height={dimensions.height}
                src={iframeSrc}
            />
        </GameContainer>
    );
};
