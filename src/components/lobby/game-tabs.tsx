import React, { useCallback, useEffect, useRef, useState } from "react";
import { Tab, Tabs } from "react-bootstrap";

import { useTranslator } from "../../_shared/react-hooks/use-translator";
import { getGameUrl, localStorageKeys, StorageManager } from "../../_shared/utils";
import FunctionUtil from "../../_shared/utils/function-util";
import { GameEventManager, GameEvents } from "../../_shared/utils/game-event-manager";
import { storePlayerSetting } from "../../_shared/utils/player-setting";

interface GameTabsProps {
    gameOfferIds: number[];
    availableGameId: number | undefined;
}

// Default game window configuration
const GAME_CONFIG = {
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
    const [dimensions, setDimensions] = useState({ width: GAME_CONFIG.width, height: GAME_CONFIG.height });

    const calculateDimensions = useCallback(() => {
        let width = GAME_CONFIG.width;
        let height = GAME_CONFIG.height;

        height = window.innerHeight - GAME_CONFIG.tabHeight;
        width = Math.floor(height * GAME_CONFIG.aspectRatio);

        setDimensions({ width, height });
    }, []);

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
                                    height: `${Math.max(
                                        dimensions.height,
                                        containerRef.current?.parentElement?.clientHeight || dimensions.height
                                    )}px`,
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
                        )}
                    </Tab>
                );
            })}
        </Tabs>
    );
};
