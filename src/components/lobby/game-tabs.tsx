import React, { useEffect, useState } from "react";
import { Tab, Tabs } from "react-bootstrap";

import { useTranslator } from "../../_shared/react-hooks/use-translator";
import { getBaseGameUrl, getGameUrl, localStorageKeys, StorageManager } from "../../_shared/utils";
import { GameFrame } from "./game-frame";

interface GameTabsProps {
    gameOfferIds: number[];
    availableGameId: number | undefined;
    tabHeight: number;
}

export const GameTabs: React.FC<GameTabsProps> = ({ gameOfferIds, availableGameId, tabHeight }) => {
    const { t } = useTranslator();
    const [activeKey, setActiveKey] = useState(0);
    const [iframeSrc, setIframeSrc] = useState<string>();

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
                                    src={`${getBaseGameUrl(gameId)}remote/icon/icon-game-tab.png`}
                                    alt={t(`gameNames.${gameId}`)}
                                    className={`tab-icon ${!isActive ? "inactive" : ""}`}
                                />
                                {t(`gameNames.${gameId}`)}
                            </div>
                        }
                        key={gameId}
                        unmountOnExit={true}
                    >
                        {isActive && <GameFrame gameId={gameId} iframeSrc={iframeSrc} tabHeight={tabHeight} />}
                    </Tab>
                );
            })}
        </Tabs>
    );
};
