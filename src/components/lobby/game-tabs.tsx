import React, { MouseEvent, useEffect, useRef, useState } from "react";
import { Tab, Tabs } from "react-bootstrap";
import { getGameUrl, localStorageKeys, StorageManager } from "../../_shared/utils";
import { GameFrame } from "./game-frame";
import { isMobile } from "react-device-detect";
import { useGameNames, useGameIcons } from "../../_shared/react-hooks/use-game-resources";
import { LobbyConfig } from "../../_shared/utils/game-setting";
import { useTolgee } from "@tolgee/react";

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

    return (
        <>
            <Tabs
                activeKey={activeKey}
                onSelect={(k) => k && handleTabSelect(+k)}
                onMouseLeave={handleMouseLeave}
                onMouseDown={handleMouseDown}
                className={`parent-tabs ${isMobile ? "menu-tab-mobile" : ""}`}
                onTouchStart={handleTouchStart}
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
                                            {renderIconGame(gameId, isActive)}
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
                            {isActive && <GameFrame gameId={gameId} iframeSrc={iframeSrc} tabHeight={tabHeight} />}
                        </Tab>
                    );
                })}
            </Tabs>

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
