import React, { useState } from "react";
import "./lobby.scss";
import { gameSettings } from "../game-setting";
import { getGameUrl } from "../utils/url-helper";
import { Tab, Tabs } from "react-bootstrap";
import { useTranslation } from "react-i18next";
import { observeSessionFromGame } from "../utils/session-manager";

observeSessionFromGame();
export default function Lobby() {
    const getSortedGameSettings = () => {
        return gameSettings.sort((a, b) => a.order - b.order);
    };

    const { t } = useTranslation();
    const [activeKey, setActiveKey] = useState(0 as number);

    const [iframeSrc, setIframeSrc] = useState(getGameUrl(getSortedGameSettings()[0].id)); // Set initial iframe src

    const handleTabSelect = (index: number) => {
        console.log("handleTabSelect", index);
        setActiveKey(index);
        const gameId = getSortedGameSettings()[index].id;
        setIframeSrc(getGameUrl(gameId)); // Update iframe src when switching tabs
    };

    return (
        <div className="lobby">
            <Tabs activeKey={activeKey} onSelect={(k) => k && handleTabSelect(+k)}>
                {getSortedGameSettings().map((gameSetting, index) => {
                    return (
                        <Tab eventKey={index} title={t(`gameNames.${gameSetting.id}`)} key={index} unmountOnExit={true}>
                            <div className="iframe-div">
                                <iframe title={`Game ${gameSetting.id}`} width="100%" height="100%" src={iframeSrc} />
                            </div>
                        </Tab>
                    );
                })}
            </Tabs>
        </div>
    );
}
