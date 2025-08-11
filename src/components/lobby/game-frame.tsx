import React, { useCallback, useEffect, useRef, useState } from "react";
import { deviceInfo } from "../../_shared/utils/device-detect-wrapper";
import FunctionUtil from "../../_shared/utils/function-util";
import { GameEventManager, GameEvents } from "../../_shared/utils/game-event-manager";
import { storePlayerSetting } from "../../_shared/utils/player-setting";
import { INSTANT_LANDSCAPE_GAME_VIEWPORT, INSTANT_PORTRAIT_GAME_VIEWPORT } from "../common/viewport-setting";
import { GameContainer } from "./styles/game-frame.style";

declare global {
    interface Window {
        resetMetaViewport: Function;
    }
}

interface GameFrameProps {
    gameId: number;
    iframeSrc: string;
    tabHeight?: number;
}
const { isMobile } = deviceInfo;

export const GameFrame: React.FC<GameFrameProps> = ({ gameId, iframeSrc, tabHeight }) => {
    const wrapperIframeRef = useRef<HTMLIFrameElement>(null);
    const containerRef = useRef<HTMLDivElement>(null);
    const viewport = tabHeight === 45 ? INSTANT_LANDSCAPE_GAME_VIEWPORT : INSTANT_PORTRAIT_GAME_VIEWPORT;

    const [dimensions, setDimensions] = useState<{
        width: number | string;
        height: number | string;
    }>({ width: viewport.width, height: viewport.height });

    const calculateDimensions = (isPortraitMode: boolean) => {
        const height = window.innerHeight - tabHeight;
        const width = Math.floor(height * viewport.aspectRatio);
        isPortraitMode ? setDimensions({ width, height }) : setDimensions({ width: "100%", height: "100%" });
    };

    useEffect(() => {
        const handleResize = () => {
            const isPortraitMode = FunctionUtil.isPortrait();
            calculateDimensions(isPortraitMode);
        };

        handleResize();
        window.addEventListener("resize", handleResize);
        return () => window.removeEventListener("resize", handleResize);
    }, [tabHeight, viewport]);

    const cssIframeStyle = () => {
        const isPortraitMode = FunctionUtil.isPortrait();
        const width = typeof dimensions.width === 'number' ? dimensions.width * 2 : dimensions.width;
        const height = typeof dimensions.height === 'number' ? dimensions.height * 2 : dimensions.height;

        return {
            width,
            height,
            ...(isPortraitMode && {
                transform: "scale(0.5)",
                transformOrigin: "bottom left",
                position: "absolute",
                bottom: 0,
                left: 0,
            })
        } as React.CSSProperties;
    };

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
            { event: GameEvents.copyToClipboard, handler: handleCopyToClipboard },
        ];
        const gameEventManager = GameEventManager.getInstance();
        const subscribers = listeners.map(({ event, handler }) => gameEventManager.subscribe(event, handler));

        return () => {
            subscribers.forEach((id) => gameEventManager.unsubscribe(id));
            clearTimeout(timeoutResize);
        };
    }, [handleCopyToClipboard]);

    useEffect(() => {
        GameEventManager.getInstance().notify(GameEvents.loading, true);
    }, [iframeSrc]);

    useEffect(() => {
        window.resetMetaViewport?.();
    }, []);

    return (
            <GameContainer
                ref={containerRef}
                $gameId={gameId}
        >
            <div style={{ position: 'relative', width: dimensions.width, height: dimensions.height }}>
                <iframe id="game-iframe"
                    ref={(el) => {
                        if (el) {
                            wrapperIframeRef.current = el;
                        }
                    }}
                    title={`Game ${gameId}`}
                    src={iframeSrc}
                    style={cssIframeStyle()}
                />
            </div>
        </GameContainer>
    );
};
