import React, { useState } from "react";
import "./lobby.scss";
import { gameSettings } from "../game-setting";
import { getGameUrl } from "../utils/url-helper";
import { Tab, Tabs } from "react-bootstrap";
import { useTranslation } from "react-i18next";

export default function Lobby() {
    const { t } = useTranslation();
    const [activeKey, setActiveKey] = useState(0 as number);

    return (
        <div className="lobby">
            <Tabs
                activeKey={activeKey}
                onSelect={(k) => {
                    if (k) {
                        setActiveKey(+k);
                    }
                }}
            >
                {gameSettings
                    .sort((a, b) => a.order - b.order)
                    .map((gameSetting, index) => {
                        return (
                            <Tab eventKey={index} title={t(`gameNames.${gameSetting.id}`)} key={index} unmountOnExit={true}>
                                <div className="iframe-div">
                                    <iframe title={`Game ${gameSetting.id}`} width="100%" height="100%" src={getGameUrl(gameSetting.id)} />
                                </div>
                            </Tab>
                        );
                    })}
            </Tabs>
        </div>
    );
}
