import React, { useCallback, useEffect, useRef, useState } from "react";
import { Tab, Tabs } from "react-bootstrap";
import { storePlayerSetting } from "../../_shared/utils/player-setting";
import { GameEventManager, GameEvents } from "../../_shared/utils/game-event-manager";
import FunctionUtil from "../../_shared/utils/function-util";
import { useTranslator } from "../../_shared/react-hooks/use-translator";
import { getGameUrl } from "../../_shared/utils";

interface GameTabsProps {
    gameOfferIds: number[];
}

const ASPECT_RATIO = 828 / 1078;
const TAB_HEIGHT = 48; // Estimated height of the tab bar

export const GameTabs: React.FC<GameTabsProps> = ({ gameOfferIds }) => {
    const wrapperIframeRef = useRef<HTMLIFrameElement>(null);
    const containerRef = useRef<HTMLDivElement>(null);
    const { t } = useTranslator();
    const [activeKey, setActiveKey] = useState(0);
    const [iframeSrc, setIframeSrc] = useState<string>();
    const [dimensions, setDimensions] = useState({ width: 828, height: 1078 });

    const calculateDimensions = useCallback(() => {
        const availableHeight = window.innerHeight - TAB_HEIGHT;
        const availableWidth = window.innerWidth;
        const parentHeight = containerRef.current?.parentElement?.clientHeight || availableHeight;

        let width = 828;
        let height = 1078;

        // Calculate dimensions based on available height
        const heightBasedWidth = Math.floor(availableHeight * ASPECT_RATIO);
        if (heightBasedWidth <= availableWidth) {
            height = availableHeight;
            width = heightBasedWidth;
        } else {
            // If width is too large, calculate based on available width
            width = availableWidth;
            height = Math.floor(width / ASPECT_RATIO);
        }

        setDimensions({ width, height });
    }, []);

    useEffect(() => {
        calculateDimensions();
        window.addEventListener('resize', calculateDimensions);
        return () => window.removeEventListener('resize', calculateDimensions);
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
        const musicListener = GameEventManager.getInstance().subscribe(GameEvents.musicEnable, storePlayerSetting);
        const sfxListener = GameEventManager.getInstance().subscribe(GameEvents.sfxEnable, storePlayerSetting);
        const isUserGestureListener = GameEventManager.getInstance().subscribe(GameEvents.isUserGesture, storePlayerSetting);
        const copyTextListener = GameEventManager.getInstance().subscribe(GameEvents.copyToClipboard, handleCopyToClipboard);

        return () => {
            GameEventManager.getInstance().unsubscribe(musicListener);
            GameEventManager.getInstance().unsubscribe(sfxListener);
            GameEventManager.getInstance().unsubscribe(isUserGestureListener);
            GameEventManager.getInstance().unsubscribe(copyTextListener);
        };
    }, [handleCopyToClipboard]);

    useEffect(() => {
        if (gameOfferIds.length > 0) {
            setIframeSrc(getGameUrl(gameOfferIds[0]));
        }
    }, [gameOfferIds]);

    const handleTabSelect = (index: number) => {
        setActiveKey(index);
        const gameId = gameOfferIds[index];
        setIframeSrc(getGameUrl(gameId));
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
                                    display: 'flex',
                                    justifyContent: 'center',
                                    alignItems: 'top',
                                    backgroundImage: `url(/images/bg-full-${gameId}.webp)`,
                                    backgroundSize: 'cover',
                                    backgroundPosition: 'center',
                                    width: '100%',
                                    height: `${Math.max(dimensions.height, containerRef.current?.parentElement?.clientHeight || dimensions.height)}px`
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
