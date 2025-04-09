import React, { useCallback, useEffect, useRef, useState } from "react";
import { deviceInfo } from "../../_shared/utils/device-detect-wrapper";
import FunctionUtil from "../../_shared/utils/function-util";
import { GameEventManager, GameEvents } from "../../_shared/utils/game-event-manager";
import { storePlayerSetting } from "../../_shared/utils/player-setting";
import { getGameBackgroundUrl } from "../../_shared/utils/url-helper";
import { DEFAULT_GAME_VIEWPORT, DIRECT_GAME_VIEWPORT } from "../common/viewport-setting";
import { GameContainer } from "./styles/game-frame.style";

interface GameFrameProps {
    gameId: number;
    iframeSrc: string;
    tabHeight?: number;
}
const { isMobile } = deviceInfo;

export const GameFrame: React.FC<GameFrameProps> = ({ gameId, iframeSrc, tabHeight = 0 }) => {
    const wrapperIframeRef = useRef<HTMLIFrameElement>(null);
    const containerRef = useRef<HTMLDivElement>(null);
    const viewport = tabHeight === 0 ? DEFAULT_GAME_VIEWPORT : DIRECT_GAME_VIEWPORT;

    const [dimensions, setDimensions] = useState<{
        width: number | string;
        height: number | string;
    }>({ width: viewport.width, height: viewport.height });

    const calculateDimensions = (isDesktop: boolean) => {
        const height = window.innerHeight - tabHeight;
        const width = Math.floor(height * viewport.aspectRatio);
        isDesktop ? setDimensions({ width, height }) : setDimensions({ width: "100%", height: "100%" });
    };

    const calculateDesktopView = () => {
        const currentRatio = window.innerWidth / window.innerHeight;
        return (currentRatio > viewport.aspectRatio && isMobile) || !isMobile;
    };

    useEffect(() => {
        const handleResize = () => {
            const isDesktop = calculateDesktopView();
            calculateDimensions(isDesktop);
        };
        handleResize();
        window.addEventListener("resize", handleResize);
        return () => window.removeEventListener("resize", handleResize);
    }, [tabHeight, viewport]);

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
