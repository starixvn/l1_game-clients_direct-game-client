import React, { useEffect, useRef, useState } from "react";
import { Tab, Tabs } from "react-bootstrap";
import { useTranslation } from "react-i18next";
import { gameSettings } from "../game-setting";
import FunctionUtil from "../utils/function-util";
import { observeSessionFromGame } from "../utils/session-manager";
import { observeSoundFromGame } from "../utils/player-setting";
import { getGameUrl } from "../utils/url-helper";
import "./lobby.scss";
import { getImageUrl } from "../utils/icon-helper";

export type MicroSiteGameParams = {
    copyToClipboard?: string;
};

observeSessionFromGame();
observeSoundFromGame();
const Lobby: React.FC = () => {
    const wrapperIframeRef = useRef<HTMLIFrameElement>(null);
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

    const handleEvent = async ({ data }: { data: MicroSiteGameParams }) => {
        console.log("Post Message received: ", data);

        if (data?.copyToClipboard) {
            handleCopyToClipboard(data?.copyToClipboard);
            return;
        }
    };

    const handleCopyToClipboard = async (text: string) => {
        const copySuccessfully = await FunctionUtil.copyText(text);
        postMessageToMicroSite({ copySuccessfully });
    };

    const postMessageToMicroSite = (data: any) => {
        wrapperIframeRef?.current?.contentWindow?.postMessage(data, iframeSrc);
    };

    useEffect(() => {
        window.addEventListener("message", handleEvent);

        return () => {
            window.removeEventListener("message", handleEvent);
        };
    }, []);

    return (
        <div className="lobby">
            <Tabs activeKey={activeKey} onSelect={(k) => k && handleTabSelect(+k)}>
                {getSortedGameSettings().map((gameSetting, index) => {
                    const isActive = activeKey === index;
                    return (
                        <Tab
                            eventKey={index}
                            title={
                                <div style={{ display: "flex", alignItems: "center", color: isActive ? "#FF9000" : "#737373" }}>
                                    <img
                                        src={getImageUrl(gameSetting.id, isActive)}
                                        alt={t(`gameNames.${gameSetting.id}`)}
                                        style={{ width: "20px", height: "20px", marginRight: "8px" }}
                                    />
                                    {t(`gameNames.${gameSetting.id}`)}
                                </div>
                            }
                            key={index}
                            unmountOnExit={true}
                        >
                            <iframe ref={wrapperIframeRef} title={`Game ${gameSetting.id}`} width="100%" height="100%" src={iframeSrc} />
                        </Tab>
                    );
                })}
            </Tabs>
        </div>
    );
};

export default Lobby;
