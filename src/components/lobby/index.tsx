import React, { useEffect, useState } from "react";
import "./lobby.scss";
import { getAvailableGameId, getOfferedGameIds } from "../../_shared/utils/game-setting";
import Loading from "../common/loading";
import { useAuthorization } from "../../_shared/react-hooks/use-authorization";
import { GameTabs } from "./game-tabs";
import { GameEventManager, GameEvents } from "../../_shared/utils/game-event-manager";
import LandscapeMode from "../landscape-mode";
import { appSettings } from "../../_shared/game-setting";
import { GameFrame } from "./game-frame";
import { getGameUrl } from "../../_shared/utils/url-helper";
import { StorageManager, localStorageKeys } from "../../_shared/utils";

const SessionTimeoutPage = React.lazy(() => import("../timeout"));
const UMPage = React.lazy(() => import("../um"));
const NonOfferPage = React.lazy(() => import("../non-offer"));

const Lobby: React.FC = () => {
    const [gameOfferIds, setGameOfferIds] = useState<number[]>([]);
    const [availableGameId, setAvailableGameId] = useState<number>(0);
    const [isTimeout, setIsTimeout] = useState(false);
    const { isLoading, umInfo, setUMInfo, isSessionTimeout, initialize } = useAuthorization();
    const [isAuthorized, setIsAuthorized] = useState(false);
    const [queryGameId] = useState(() => {
        // First check URL query parameter
        const params = new URLSearchParams(window.location.search);
        const gameId = params.get("gameId");
        if (gameId) {
            const parsedGameId = parseInt(gameId, 10);
            return isNaN(parsedGameId) ? 0 : parsedGameId;
        }

        // If no query parameter, check localStorage
        const storedGameId = StorageManager.get<number>(localStorageKeys.selectedGameId);
        return storedGameId || 0;
    });

    const authenticate = async () => {
        const response = await initialize();
        if (response?.authorized) {
            const offeredGameIds = getOfferedGameIds(response);
            setGameOfferIds(offeredGameIds);

            // Use query/stored gameId if it exists and is in offered games, otherwise use default logic
            const selectedGameId =
                queryGameId && offeredGameIds.includes(queryGameId) ? queryGameId : getAvailableGameId(offeredGameIds, response) || 0;

            setAvailableGameId(selectedGameId);
            setIsAuthorized(true);
        }
    };

    useEffect(() => {
        authenticate();
    }, [queryGameId]);

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
                {isAuthorized ? (
                    appSettings.hideGameTab && availableGameId > 0 ? (
                        <GameFrame gameId={availableGameId} iframeSrc={getGameUrl(availableGameId)} />
                    ) : (
                        <GameTabs gameOfferIds={gameOfferIds} availableGameId={availableGameId} />
                    )
                ) : (
                    <div>Loading...</div>
                )}
            </div>
        </>
    );
};

export default Lobby;
