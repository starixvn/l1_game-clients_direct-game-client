import React, { useCallback, useEffect, useRef, useState } from "react";


import FunctionUtil from "../../_shared/utils/function-util";
import { GameEventManager, GameEvents } from "../../_shared/utils/game-event-manager";
import { storePlayerSetting } from "../../_shared/utils/player-setting";
import { GameContainer } from "./styles/game-frame.style";
import { getBaseGameUrl } from "../../_shared/utils/url-helper";
import { deviceInfo } from "../../_shared/utils/device-detect-wrapper";

interface GameFrameProps {
    gameId: number;
    iframeSrc: string;
    tabHeight?: number;
}

// Default game window configuration
const GAME_CONFIG = {
    width: 828,
    height: 1078,
    aspectRatio: 828 / 1078,
};

export const GameFrame: React.FC<GameFrameProps> = ({ gameId, iframeSrc, tabHeight = 0 }) => {
    const wrapperIframeRef = useRef<HTMLIFrameElement>(null);
    const containerRef = useRef<HTMLDivElement>(null);
    const [dimensions, setDimensions] = useState<{
        width: number | string;
        height: number | string;
    }>({ width: GAME_CONFIG.width, height: GAME_CONFIG.height });
    const [isDesktopView, setIsDesktopView] = useState(false);

    const { isMobile } = deviceInfo;

    const calculateDimensions = useCallback(() => {
        const height = window.innerHeight - tabHeight;
        const width = Math.floor(height * GAME_CONFIG.aspectRatio);
        isDesktopView ? setDimensions({ width, height }) : setDimensions({ width: "100%", height: "100%" });
    }, [tabHeight, isDesktopView]);

    const calculateDesktopView = useCallback(() => {
        const currentRatio = window.innerWidth / window.innerHeight;
        setIsDesktopView((currentRatio > GAME_CONFIG.aspectRatio && isMobile) || !isMobile);
    }, []);

    useEffect(() => {
        calculateDesktopView();
        calculateDimensions();
        const handleResize = () => {
            calculateDesktopView();
            calculateDimensions();
        };
        window.addEventListener("resize", handleResize);
        return () => window.removeEventListener("resize", handleResize);
    }, [calculateDimensions]);

    const postMessageToMicroSite = useCallback(
        (data: any) => {
            wrapperIframeRef?.current?.contentWindow?.postMessage(data, wrapperIframeRef?.current?.src);
        },
        [wrapperIframeRef]
    );

    const handleCopyToClipboard = useCallback(
        async (data: any) => {
            const copySuccessfully = await FunctionUtil.copyText(data.copyToClipboard);
            postMessageToMicroSite({ copySuccessfully });
        },
        [postMessageToMicroSite]
    );

    useEffect(() => {
        const listeners = [
            { event: GameEvents.musicEnable, handler: storePlayerSetting },
            { event: GameEvents.sfxEnable, handler: storePlayerSetting },
            { event: GameEvents.isUserGesture, handler: storePlayerSetting },
            { event: GameEvents.copyToClipboard, handler: handleCopyToClipboard },
        ];
        const gameEventManager = GameEventManager.getInstance();
        const subscribers = listeners.map(({ event, handler }) => gameEventManager.subscribe(event, handler));

        return () => {
            subscribers.forEach((id) => gameEventManager.unsubscribe(id));
        };
    }, [handleCopyToClipboard]);

    return (
        <GameContainer ref={containerRef} $gameId={gameId} $height={dimensions.height} $remoteGameBackgroundUrl={`${getBaseGameUrl(gameId)}remote/background/game-background.webp`}>
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
