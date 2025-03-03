import React, { MouseEvent, useEffect, useRef, useState } from "react";
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

    const [isDragging, setIsDragging] = useState<boolean>(false);
    const [startX, setStartX] = useState<number>(0);
    const [scrollLeft, setScrollLeft] = useState<number>(0);


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

    const handleMouseDown = (e: React.MouseEvent) => {
        const parentElement = document.querySelector(".parent-tabs") as HTMLElement;
        if (parentElement) {
          setIsDragging(true);
          setStartX(e.clientX);
          setScrollLeft(parentElement.scrollLeft);
          e.preventDefault();
        }
      };
    const handleMouseMove = (e: MouseEvent) => {
        if (!isDragging) return;
        const parentElement = document.querySelector(".parent-tabs") as HTMLElement;
        if (parentElement) {
            const x = e.clientX - startX;
            parentElement.scrollLeft = scrollLeft - x;
        }
    };
    const handleMouseUp = () => {
        setIsDragging(false);
    };

    useEffect(() => {
        const moveListener = (e: MouseEvent) => handleMouseMove(e);
        const upListener = () => handleMouseUp();

        document.addEventListener("mousemove", moveListener as unknown as EventListener);
        document.addEventListener("mouseup", upListener as unknown as EventListener);

        return () => {
            document.removeEventListener("mousemove", moveListener as unknown as EventListener);
            document.removeEventListener("mouseup", upListener as unknown as EventListener);
        };
    }, [isDragging]);
    return (
        <Tabs 
            activeKey={activeKey} 
            onSelect={(k) => k && handleTabSelect(+k)}
            onMouseDown={handleMouseDown}
            className="parent-tabs"
        >
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
