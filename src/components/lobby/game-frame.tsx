import React, { useCallback, useEffect, useRef, useState } from "react";
import { GameEventManager, GameEvents } from "../../_shared/utils/game-event-manager";
import { storePlayerSetting } from "../../_shared/utils/player-setting";
import FunctionUtil from "../../_shared/utils/function-util";

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
    const [dimensions, setDimensions] = useState({ width: GAME_CONFIG.width, height: GAME_CONFIG.height });

    const calculateDimensions = useCallback(() => {
        let height = window.innerHeight - tabHeight;
        let width = Math.floor(height * GAME_CONFIG.aspectRatio);
        setDimensions({ width, height });
    }, [tabHeight]);

    useEffect(() => {
        calculateDimensions();
        window.addEventListener("resize", calculateDimensions);
        return () => window.removeEventListener("resize", calculateDimensions);
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
        <div
            ref={containerRef}
            style={{
                display: "flex",
                justifyContent: "center",
                alignItems: "top",
                backgroundImage: `url(/images/bg-full-${gameId}.webp)`,
                backgroundSize: "cover",
                backgroundPosition: "center",
                width: "100%",
                height: `${Math.max(dimensions.height, containerRef.current?.parentElement?.clientHeight || dimensions.height)}px`,
            }}
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
        </div>
    );
};
