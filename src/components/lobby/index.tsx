import React, { useEffect, useRef, useState } from "react";
import { Tab, Tabs } from "react-bootstrap";
import { useTranslation } from "react-i18next";
import { gameSettings } from "../game-setting";
import FunctionUtil from "../utils/function-util";
import { observeSessionFromGame } from "../utils/session-manager";
import { getGameUrl } from "../utils/url-helper";
import "./lobby.scss";

export type MicroSiteGameParams = {
    musicEnable?: boolean;
    sfxEnable?: boolean;
    copyToClipboard?: string;
    isUserGesture?: boolean;
};

observeSessionFromGame();
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
        console.log("Message received: ", data);

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
        console.log("postMessageToMicroSite----", data, iframeSrc);
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
                    return (
                        <Tab eventKey={index} title={t(`gameNames.${gameSetting.id}`)} key={index} unmountOnExit={true}>
                            <iframe ref={wrapperIframeRef} title={`Game ${gameSetting.id}`} width="100%" height="100%" src={iframeSrc} />
                        </Tab>
                    );
                })}
            </Tabs>
        </div>
    );
};

export default Lobby;
