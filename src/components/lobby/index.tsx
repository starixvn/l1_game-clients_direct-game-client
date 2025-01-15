import React, { useEffect, useState } from "react";
import "./lobby.scss";
import { getOfferedGameIds } from "../../_shared/utils/game-setting";
import Loading from "../common/loading";
import { useAuthorization } from "../../_shared/react-hooks/use-authorization";
import { GameTabs } from "./game-tabs";
import { GameEventManager, GameEvents } from "../../_shared/utils/game-event-manager";
import LandscapeMode from "../landscape-mode";

const SessionTimeoutPage = React.lazy(() => import("../timeout"));
const UMPage = React.lazy(() => import("../um"));
const NonOfferPage = React.lazy(() => import("../non-offer"));

const Lobby: React.FC = () => {
    const [gameOfferIds, setGameOfferIds] = useState<number[]>([]);
    const [isTimeout, setIsTimeout] = useState(false);
    const { isLoading, umInfo, setUMInfo, isSessionTimeout, initialize } = useAuthorization();

    const authenticate = async () => {
        const response = await initialize();
        if (response?.authorized) {
            setGameOfferIds(getOfferedGameIds(response));
        }
    };

    useEffect(() => {
        authenticate();
    }, []);

    const handleNotPermittedToPlay = () => {
        authenticate();
    };

    useEffect(() => {
        const gameEventManager = GameEventManager.getInstance();
        const events = [
            { event: GameEvents.sessionTimeout, handler: () => setIsTimeout(true) },
            { event: GameEvents.isUnderMaintain, handler: (data) => setUMInfo(data?.umInfo) },
            { event: GameEvents.isNotPermittedToPlay, handler: handleNotPermittedToPlay },
        ];

        const subscriptions = events.map(({ event, handler }) => gameEventManager.subscribe(event, handler));

        return () => {
            subscriptions.forEach((id) => gameEventManager.unsubscribe(id));
        };
    }, []);

    if (isLoading) return <Loading />;
    if (isSessionTimeout || isTimeout) return <SessionTimeoutPage />;
    if (umInfo) return <UMPage umInfo={umInfo} />;
    if (gameOfferIds.length === 0) return <NonOfferPage />;

    return (
        <>
            <LandscapeMode />
            <div className="lobby">
                <GameTabs gameOfferIds={gameOfferIds} />
            </div>
        </>
    );
};

export default Lobby;
