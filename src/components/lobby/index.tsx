import React, { useEffect, useRef, useState } from "react";
import { appSettings } from "../../_shared/game-setting";
import "./lobby.scss";
import { getQueryParameters, getGameUrl } from "../../_shared/utils/url-helper";
import { getAndHandleGameOfferIds, getSortedGameSettings } from "../../_shared/utils/game-setting";
import Loading from "../common/loading";
import TimeOut from "../common/timeout";
import { useAuthorization } from "../../_shared/react-hooks/use-authorization";
import { GameTabs } from "./game-tabs";
import { GameEventManager, GameEvents } from "../../_shared/utils/game-event-manager";
import UM from "../common/um";

const Lobby: React.FC = () => {
    const wrapperIframeRef = useRef<HTMLIFrameElement>(null);
    const queryParameters = getQueryParameters();
    const { token, appType } = queryParameters;
    const [activeKey, setActiveKey] = useState(0);
    const [gameOfferIds, setGameOfferIds] = useState<number[]>([]);
    const [iframeSrc, setIframeSrc] = useState<string>();
    const [isTimeout, setTimeout] = useState(false);
    const { isLoading, umInfo, setUMInfo, authorizeResponse, isSessionTimeout, initialize } = useAuthorization(
        token,
        appType ?? appSettings.appType
    );

    const handleTabSelect = (index: number) => {
        setActiveKey(index);
        const gameId = getSortedGameSettings(authorizeResponse)[index].id;
        setIframeSrc(getGameUrl(gameId));
    };

    useEffect(() => {
        const authenticate = async () => {
            const response = await initialize();
            if (response) {
                setGameOfferIds(getAndHandleGameOfferIds(response));
            }
        };

        authenticate();
    }, []);

    useEffect(() => {
        const gameEventManager = GameEventManager.getInstance();
        const events = [
            { event: GameEvents.sessionTimeout, handler: () => setTimeout(true) },
            { event: GameEvents.isUnderMaintain, handler: (data) => setUMInfo(data?.umInfo) },
        ];

        const subscriptions = events.map(({ event, handler }) => gameEventManager.subscribe(event, handler));

        return () => {
            subscriptions.forEach((id) => gameEventManager.unsubscribe(id));
        };
    }, []);

    useEffect(() => {
        if (gameOfferIds.length > 0) {
            setIframeSrc(getGameUrl(gameOfferIds[0]));
        }
    }, [gameOfferIds]);

    if (isLoading) return <Loading />;
    if (isSessionTimeout || isTimeout) return <TimeOut />;
    if (umInfo) return <UM umInfo={umInfo} />;

    return (
        <div>
            <div className="lobby">
                <GameTabs
                    activeKey={activeKey}
                    gameOfferIds={gameOfferIds}
                    onTabSelect={handleTabSelect}
                    iframeSrc={iframeSrc}
                    wrapperIframeRef={wrapperIframeRef}
                />
            </div>
        </div>
    );
};

export default Lobby;
