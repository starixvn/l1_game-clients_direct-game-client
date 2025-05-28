import React, { MouseEvent, useEffect, useRef, useState } from "react";
import { Tab, Tabs } from "react-bootstrap";
import { GameEventManager, GameEvents, getGameUrl, getPlayerSetting, localStorageKeys, StorageManager, storePlayerSetting } from "../../_shared/utils";
import { GameFrame } from "./game-frame";
import { isMobile } from "react-device-detect";
import { useGameNames, useGameIcons } from "../../_shared/react-hooks/use-game-resources";
import { LobbyConfig } from "../../_shared/utils/game-setting";
import { useTolgee } from "@tolgee/react";
import styled from "styled-components";

interface GameTabsProps {
    offerGames: LobbyConfig[];
    availableGameId: number | undefined;
    tabHeight: number;
    setAvailableGameId: Function;
}

export const GameTabs: React.FC<GameTabsProps> = ({ offerGames, availableGameId, setAvailableGameId, tabHeight }) => {
    const currentLanguage = useTolgee().getLanguage();
    const tabRefs = useRef<(HTMLDivElement | null)[]>([]);
    const [activeKey, setActiveKey] = useState(0);
    const [iframeSrc, setIframeSrc] = useState<string>();
    const [isDragging, setIsDragging] = useState<boolean>(false);
    const [startX, setStartX] = useState<number>(0);
    const [scrollLeft, setScrollLeft] = useState<number>(0);
    const [isMenuOpen, setIsMenuOpen] = useState<boolean>(false);
    const gameNames = useGameNames(offerGames.map((game) => game.gameId));
    const iconUrls = useGameIcons(offerGames.map((game) => game.gameId));

    const handleMenuClick = () => {
        setIsMenuOpen(!isMenuOpen);
    };

    const setSelectedGameId = (gameId: number) => {
        setActiveKey(offerGames.findIndex((game) => game.gameId === gameId));
        StorageManager.set(localStorageKeys.selectedGameId, gameId);
        setIframeSrc(
            getGameUrl(
                gameId,
                offerGames.map((game) => game.gameId)
            )
        );
        setAvailableGameId(gameId);
        const index = offerGames.findIndex((game) => game.gameId === gameId);
        tabRefs.current[index]?.scrollIntoView({ behavior: "smooth", block: "nearest", inline: "center" });
    };

    const isLandscape = () => {
        if (typeof window !== 'undefined') {
            return window.innerWidth > window.innerHeight;
        }
        return false;
    };

    useEffect(() => {
        if (offerGames.length > 0) {
            const oldGameId = StorageManager.get<number | undefined>(localStorageKeys.selectedGameId);
            const gameId =
                oldGameId && offerGames.some((game) => game.gameId === oldGameId) ? oldGameId : availableGameId || offerGames[0].gameId;
            setSelectedGameId(gameId);
        }
    }, [offerGames, availableGameId]);

    const handleTabSelect = (index: number) => {
        setActiveKey(index);
        const gameId = offerGames[index].gameId;
        setSelectedGameId(gameId);
        setIsMenuOpen(false);
    };

    useEffect(() => {
        if (tabRefs.current[activeKey]) {
            setTimeout(() => {
                tabRefs.current[activeKey]?.scrollIntoView({
                    behavior: "smooth",
                    block: "nearest",
                    inline: "center",
                });
            }, 100);
        }
    }, [activeKey]);

    const handleMouseDown = (e: React.MouseEvent) => {
        const parentElement = document.querySelector(".parent-tabs");
        if (parentElement) {
            setIsDragging(true);
            setStartX(e.clientX);
            setScrollLeft(parentElement.scrollLeft);
            e.preventDefault();
        }
    };
    const handleMouseMove = (e: MouseEvent) => {
        if (!isDragging) {
            document.querySelectorAll("button").forEach((el) => {
                (el as HTMLElement).style.pointerEvents = "";
            });
            return;
        }
        const parentElement = document.querySelector(".parent-tabs");
        if (parentElement) {
            const x = e.clientX - startX;
            parentElement.scrollLeft = scrollLeft - x;
            document.querySelectorAll("button").forEach((el) => {
                (el as HTMLElement).style.pointerEvents = "none";
            });
        }
    };
    const handleMouseUp = () => {
        setIsDragging(false);
    };

    const handleMouseLeave = () => {
        setIsDragging(false);
    };

    const handleTouchStart = () => {
        setIsMenuOpen(false);
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

    const renderIconGame = (gameId: number, isActive: boolean) => {
        return <img src={iconUrls[gameId]} alt={`game-${gameId}`} className={`tab-icon ${!isActive ? "inactive" : ""}`} />;
    };

    const renderNewTag = (isNew: boolean, isMenuOpen = false) => {
        if (!isNew) {
            return <></>;
        }
        return <img src={`/images/new-tag/${currentLanguage}.png`} className={`new-tag ${isMenuOpen ? "menu-open" : ""}`} alt="new-tag" />;
    };

    const SoundToggle = () => {
        const handleSoundToggle = (e: React.MouseEvent) => {
            e.preventDefault();
            try {
                const oldEnableSound = getPlayerSetting().sfxEnable ?? false;
                const newEnableSound = !oldEnableSound;
                storePlayerSetting({ sfxEnable: newEnableSound, musicEnable: newEnableSound });

                const iframe = document.querySelector('iframe');
                if (iframe?.contentWindow) {
                    const targetOrigin = new URL(iframe.src).origin;
                    iframe.contentWindow.postMessage({ 
                        sfxEnable: newEnableSound,
                        musicEnable: newEnableSound 
                    }, targetOrigin);
                }

                const soundToggleImg = document.querySelector('.sound-toggle img');
                if (soundToggleImg) {
                    soundToggleImg.setAttribute('src', `/images/icon_sound${newEnableSound ? '' : '_off'}.png`);
                }
            } catch(error) {
                console.error('Failed to toggle sound:', error);
            }
        };

        return (
            <button 
                type="button" 
                onClick={handleSoundToggle}
                className="sound-toggle"
                style={{ background: 'none', border: 'none', padding: 0 }}
            >
                <img 
                    src={`/images/icon_sound${getPlayerSetting().sfxEnable ? '' : '_off'}.png`}
                    alt="Toggle Sound"
                    width={32}
                    height={32}
                />
            </button>
        );
    };

    const GameGuideButton = () => {
        const handleGameGuide = (e: React.MouseEvent) => {
            e.preventDefault();
            try {
                const iframe = document.querySelector('iframe');
                if (iframe?.contentWindow) {
                    const targetOrigin = new URL(iframe.src).origin;
                    iframe.contentWindow.postMessage({ 
                        openGameGuide: true
                    }, targetOrigin);
                }
            } catch(error) {
                console.error('Failed to open game guide:', error);
            }
        };

        return (
            <button
                type="button"
                onClick={handleGameGuide}
                className="game-guide"
                style={{ background: 'none', border: 'none', padding: 0 }}
            >
               <img 
                    src="/images/icon_guide.png" 
                    alt="Toggle Sound"
                    width={32}
                    height={32}
                />
            </button>
        );
    };

    const GameControls = styled.div`
        display: flex;
        gap: 5px;
    `;

    return (
        <>
            <div style={{ display: 'flex', flexDirection: 'column'}}>

                <div style={{ display: 'flex', alignItems: 'center', width: '100%' }}>
                    <Tabs
                        activeKey={activeKey}
                        onSelect={(k) => k && handleTabSelect(+k)}
                        onMouseLeave={handleMouseLeave}
                        onMouseDown={handleMouseDown}
                        className={`parent-tabs ${isMobile ? "menu-tab-mobile" : ""}`}
                        onTouchStart={handleTouchStart}
                        style={{ flex: 1 }}
                    >
                        {offerGames.map((game, index) => {
                            const isActive = activeKey === index;
                            const gameId = game.gameId;
                            const isNew = game.isNew;
                            return (
                                <Tab
                                    eventKey={index}
                                    title={
                                        <div
                                            ref={(el) => (tabRefs.current[index] = el)}
                                            className={`tab-title ${isActive && iconUrls[gameId] ? "active" : ""}`}
                                        >
                                            {iconUrls[gameId] ? (
                                                <div>
                                                    {/* {renderIconGame(gameId, isActive)} */}
                                                    {gameNames[gameId]}
                                                    {renderNewTag(isNew)}
                                                </div>
                                            ) : (
                                                <div className="skeleton">
                                                    <div className="skeleton-img" />
                                                    <div className="skeleton-text" />
                                                </div>
                                            )}
                                        </div>
                                    }
                                    key={gameId}
                                    unmountOnExit={true}
                                >
                                    
                                </Tab>
                                
                            );
                        })}
                    </Tabs>
                    {isLandscape() && (
                        <GameControls style={{ margin: 2, flexShrink: 0 }}>
                            <SoundToggle />
                            <GameGuideButton />
                        </GameControls>
                    )}
                </div>            
                
                <GameFrame gameId={offerGames[activeKey].gameId} iframeSrc={iframeSrc} tabHeight={tabHeight} />
                
            </div>

            {isMobile && (
                <div className="btn-collapse-menu" onClick={handleMenuClick}>
                    <span />
                    <span />
                    <span />
                </div>
            )}

            {isMenuOpen && isMobile && (
                <>
                    <ul className="mobile-game-list">
                        {offerGames.map((game, index) => {
                            const isActive = activeKey === index;
                            const gameId = game.gameId;
                            const isNew = game.isNew;
                            return (
                                <li
                                    key={gameId}
                                    className={`${isActive && iconUrls[gameId] ? "active" : ""} `}
                                    onClick={() => handleTabSelect(index)}
                                >
                                    <div className="mask-name">
                                        <div className="mask-img">{renderIconGame(gameId, isActive)}</div>
                                        {gameNames[gameId]}
                                    </div>
                                    {renderNewTag(isNew, isMenuOpen)}
                                </li>
                            );
                        })}
                    </ul>
                    <div className="overlay-menu" onClick={handleMenuClick}></div>
                </>
            )}
        </>
    );
};
