import React, { useEffect, useRef, useState } from "react";
import { Tab, Tabs } from "react-bootstrap";
import { useTolgee } from "@tolgee/react";
import { getGameLocalizationUrl, getGameUrl, getIconGameTabUrl, localStorageKeys, StorageManager } from "../../_shared/utils";
import { GameFrame } from "./game-frame";

interface GameTabsProps {
    gameOfferIds: number[];
    availableGameId: number | undefined;
    tabHeight: number;
}

export const GameTabs: React.FC<GameTabsProps> = ({ gameOfferIds, availableGameId, tabHeight }) => {
    const currentLanguage = useTolgee().getLanguage();
    const [activeKey, setActiveKey] = useState(0);
    const [iframeSrc, setIframeSrc] = useState<string>();
    const [gameNames, setGameNames] = useState<Record<number, string>>({});
    const [iconUrls, setIconUrls] = useState<Record<number, string>>({});

    const tabRefs = useRef<(HTMLDivElement | null)[]>([]);

    const setSelectedGameId = (gameId: number) => {
        setActiveKey(gameOfferIds.indexOf(gameId));
        StorageManager.set(localStorageKeys.selectedGameId, gameId);
        setIframeSrc(getGameUrl(gameId, gameOfferIds));

        const index = gameOfferIds.indexOf(gameId);
        tabRefs.current[index]?.scrollIntoView({ behavior: "smooth", block: "nearest", inline: "center" });
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

    const getGameName = async (gameId: number) => {
        const url = getGameLocalizationUrl(gameId);
        try {
            const response = await fetch(url);
            if (response.ok) {
                const data = await response.json();
                return { [gameId]: data.gameNames?.[currentLanguage] || `game-${gameId}` };
            }
        } catch (error) {
            console.error(`Error fetching game name for game ${gameId}:`, error);
        }
        return { [gameId]: `game-${gameId}` };
    };

    useEffect(() => {
        const fetchGameNames = async () => {
            const names = await Promise.all(gameOfferIds.map((gameId) => getGameName(gameId)));
            const gameNames = names.reduce((result, gameName) => ({ ...result, ...gameName }), {});
            setGameNames(gameNames);
        };
        fetchGameNames();
    }, []);

    useEffect(() => {
        
        const fetchIconUrls = async () => {
            const urls = await Promise.all(
                gameOfferIds.map(async (gameId) => {
                    const url = await getIconGameTabUrl(gameId);
                    return { [gameId]: url };
                })
            );
            const iconUrls = urls.reduce((result, iconUrl) => ({ ...result, ...iconUrl }), {});
            setIconUrls(iconUrls);
        };
        fetchIconUrls();
        
    }, [gameOfferIds]);

    
    useEffect(() => { 
        if (tabRefs.current[activeKey]) {
            setTimeout(() => {
                tabRefs.current[activeKey]?.scrollIntoView({
                    behavior: 'smooth',
                    block: 'nearest',
                    inline: 'center',
                }); 
            }, 100);
        }
    },[activeKey])

    return (
        <Tabs activeKey={activeKey} onSelect={(k) => k && handleTabSelect(+k)}>
            {gameOfferIds.map((gameId, index) => {
                const isActive = activeKey === index;
                return (
                    <Tab
                        eventKey={index}
                        title={
                            <div ref={(el) => (tabRefs.current[index] = el)} className={`tab-title ${isActive && iconUrls[gameId] ? "active" : ""}`}>
                               {
                                iconUrls[gameId] ? <>
                                    <img src={iconUrls[gameId]} alt={`game-${gameId}`} className={`tab-icon ${!isActive ? "inactive" : ""}`} />
                                    {gameNames[gameId]}
                                 </> : <div className="skeleton">
                                    <div className="skeleton-img"/>
                                    <div className="skeleton-text"/>
                                </div>
                                
                               }
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
