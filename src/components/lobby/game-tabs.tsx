import React, { useCallback, useEffect, useRef, useState } from "react";
import { Tab, Tabs } from "react-bootstrap";
import { isMobile } from "react-device-detect";

import { useTranslator } from "../../_shared/react-hooks/use-translator";
import { getGameUrl, localStorageKeys, StorageManager } from "../../_shared/utils";
import FunctionUtil from "../../_shared/utils/function-util";
import { GameEventManager, GameEvents } from "../../_shared/utils/game-event-manager";
import { storePlayerSetting } from "../../_shared/utils/player-setting";
import { GameContainer } from "./styles/game-tabs.style";

interface GameTabsProps {
    gameOfferIds: number[];
    availableGameId: number | undefined;
}

// Default game window configuration
export const GAME_CONFIG = {
    width: 828,
    height: 1078,
    aspectRatio: 828 / 1078,
    tabHeight: 34, // Height of the tab navigation bar in pixels
};

export const GameTabs: React.FC<GameTabsProps> = ({ gameOfferIds, availableGameId }) => {
    const wrapperIframeRef = useRef<HTMLIFrameElement>(null);
    const containerRef = useRef<HTMLDivElement>(null);
    const { t } = useTranslator();
    const [activeKey, setActiveKey] = useState(0);
    const [iframeSrc, setIframeSrc] = useState<string>();
    const [dimensions, setDimensions] = useState<{
        width: number | string;
        height: number | string;
    }>({
        width: GAME_CONFIG.width,
        height: GAME_CONFIG.height,
    });
    const [isDesktopView, setIsDesktopView] = useState(false);

    const calculateDimensions = useCallback(() => {
        const height = window.innerHeight - GAME_CONFIG.tabHeight;
        const width = Math.floor(height * GAME_CONFIG.aspectRatio);

        isDesktopView ? setDimensions({ width, height }) : setDimensions({ width: "100%", height: "100%" });
    }, [isDesktopView]);

    const calculateDesktopView = useCallback(() => {
        const currentRatio = window.innerWidth / window.innerHeight;
        const desktopThreshold = GAME_CONFIG.aspectRatio;
        setIsDesktopView((currentRatio > desktopThreshold && isMobile) || !isMobile);
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

    const setSelectedGameId = (gameId: number) => {
        setActiveKey(gameOfferIds.indexOf(gameId));
        StorageManager.set(localStorageKeys.selectedGameId, gameId);
        setIframeSrc(getGameUrl(gameId));
    };

    useEffect(() => {
        if (gameOfferIds.length > 0) {
            const oldGameId = StorageManager.get<number | undefined>(localStorageKeys.selectedGameId);
            const gameId = oldGameId && gameOfferIds.includes(oldGameId) ? oldGameId : availableGameId || gameOfferIds[0];
            setSelectedGameId(gameId);
        }
    }, [gameOfferIds, availableGameId]);

    const handleTabSelect = (index: number) => {
        setActiveKey(index);
        const gameId = gameOfferIds[index];
        setSelectedGameId(gameId);
    };

    return (
        <Tabs activeKey={activeKey} onSelect={(k) => k && handleTabSelect(+k)}>
            {gameOfferIds.map((gameId, index) => {
                const isActive = activeKey === index;
                return (
                    <Tab
                        eventKey={index}
                        title={
                            <div className={`tab-title ${isActive ? "active" : ""}`}>
                                <img
                                    src={`/images/icon-${gameId}.png`}
                                    alt={t(`gameNames.${gameId}`)}
                                    className={`tab-icon ${!isActive ? "inactive" : ""}`}
                                />
                                {t(`gameNames.${gameId}`)}
                            </div>
                        }
                        key={gameId}
                        unmountOnExit={true}
                    >
                        {isActive && (
                            <GameContainer ref={containerRef} $gameId={gameId} $height={dimensions.height}>
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
                        )}
                    </Tab>
                );
            })}
        </Tabs>
    );
};
