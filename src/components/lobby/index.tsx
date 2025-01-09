import React, { useEffect, useRef, useState } from "react";
import "./lobby.scss";
import { getQueryParameters, getGameUrl } from "../../_shared/utils/url-helper";
import { getAndHandleGameOfferIds, getSortedGameSettings } from "../../_shared/utils/game-setting";
import Loading from "../common/loading";
import { useAuthorization } from "../../_shared/react-hooks/use-authorization";
import { GameTabs } from "./game-tabs";
import { GameEventManager, GameEvents } from "../../_shared/utils/game-event-manager";
import LandscapeMode from "../common/landscape-mode";

const SessionTimeoutPage = React.lazy(() => import("../common/timeout"));
const UMPage = React.lazy(() => import("../common/um"));

const Lobby: React.FC = () => {
    const wrapperIframeRef = useRef<HTMLIFrameElement>(null);
    const queryParameters = getQueryParameters();
    const { token, appType } = queryParameters;
    const [activeKey, setActiveKey] = useState(0);
    const [gameOfferIds, setGameOfferIds] = useState<number[]>([]);
    const [iframeSrc, setIframeSrc] = useState<string>();
    const [isTimeout, setIsTimeout] = useState(false);
    const { isLoading, umInfo, setUMInfo, authorizeResponse, isSessionTimeout, initialize } = useAuthorization(token, appType ?? 1);

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
            { event: GameEvents.sessionTimeout, handler: () => setIsTimeout(true) },
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
    if (isSessionTimeout || isTimeout) return <SessionTimeoutPage />;
    if (umInfo) return <UMPage umInfo={umInfo} />;

    return (
        <div>
            <LandscapeMode />
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
