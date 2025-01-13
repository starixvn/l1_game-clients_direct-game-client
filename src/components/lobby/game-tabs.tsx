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

export const GameTabs: React.FC<GameTabsProps> = ({ gameOfferIds }) => {
    const wrapperIframeRef = useRef<HTMLIFrameElement>(null);
    const { t } = useTranslator();
    const [activeKey, setActiveKey] = useState(0);
    const [iframeSrc, setIframeSrc] = useState<string>();

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
                            <iframe
                                ref={(el) => {
                                    if (el) {
                                        wrapperIframeRef.current = el;
                                    }
                                }}
                                title={`Game ${gameId}`}
                                width="100%"
                                height="100%"
                                src={iframeSrc}
                            />
                        )}
                    </Tab>
                );
            })}
        </Tabs>
    );
};
