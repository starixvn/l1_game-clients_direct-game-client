import React, { useCallback, useEffect } from "react";
import { Tab, Tabs } from "react-bootstrap";
import { getImageUrl } from "../../_shared/utils/icon-helper";
import { storePlayerSetting } from "../../_shared/utils/player-setting";
import { GameEventManager, GameEvents } from "../../_shared/utils/game-event-manager";
import FunctionUtil from "../../_shared/utils/function-util";
import { useTranslator } from "../../_shared/react-hooks/use-translator";

interface GameTabsProps {
    activeKey: number;
    gameOfferIds: number[];
    onTabSelect: (index: number) => void;
    iframeSrc: string;
    wrapperIframeRef: React.RefObject<HTMLIFrameElement>;
}

export const GameTabs: React.FC<GameTabsProps> = ({ activeKey, gameOfferIds, onTabSelect, iframeSrc, wrapperIframeRef }) => {
    const { t } = useTranslator();

    const postMessageToMicroSite = useCallback(
        (data: any) => {
            wrapperIframeRef?.current?.contentWindow?.postMessage(data, wrapperIframeRef.current.src);
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
    }, []);

    return (
        <Tabs activeKey={activeKey} onSelect={(k) => k && onTabSelect(+k)}>
            {gameOfferIds.map((gameOfferId, index) => {
                const isActive = activeKey === index;
                return (
                    <Tab
                        eventKey={index}
                        title={
                            <div className={`tab-title ${isActive ? "active" : ""}`}>
                                <img src={getImageUrl(gameOfferId, isActive)} alt={t(`gameNames.${gameOfferId}`)} className="tab-icon" />
                                {t(`gameNames.${gameOfferId}`)}
                            </div>
                        }
                        key={gameOfferId}
                        unmountOnExit={true}
                    >
                        <iframe ref={wrapperIframeRef} title={`Game ${gameOfferId}`} width="100%" height="100%" src={iframeSrc} />
                    </Tab>
                );
            })}
        </Tabs>
    );
};
