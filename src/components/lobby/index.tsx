import React, { useEffect, useState } from "react";
import "./lobby.scss";
import { getQueryParameters, localStorageKeys, StorageManager } from "../../_shared/utils";
import { getOfferedGameIds } from "../../_shared/utils/game-setting";
import Loading from "../common/loading";
import { useAuthorization } from "../../_shared/react-hooks/use-authorization";
import { GameTabs } from "./game-tabs";
import { GameEventManager, GameEvents } from "../../_shared/utils/game-event-manager";
import LandscapeMode from "../common/landscape-mode";
import { locales } from "../../_shared/consts";

const SessionTimeoutPage = React.lazy(() => import("../common/timeout"));
const UMPage = React.lazy(() => import("../common/um"));
const NonOfferPage = React.lazy(() => import("../common/non-offer"));

const Lobby: React.FC = () => {
    const queryParameters = getQueryParameters();
    const { token, appType, lang, operator } = queryParameters;
    const [gameOfferIds, setGameOfferIds] = useState<number[]>([]);
    const [isTimeout, setIsTimeout] = useState(false);
    const { isLoading, umInfo, setUMInfo, isSessionTimeout, initialize } = useAuthorization(token, appType ?? 1, lang ?? locales.en);

    const authenticate = async () => {
        const response = await initialize();
        if (response?.authorized) {
            setGameOfferIds(getOfferedGameIds(response));
            operator && StorageManager.set(localStorageKeys.operator, operator);
        }
    };

    useEffect(() => {
        authenticate();
    }, []);

    useEffect(() => {
        const handleIsNotPermittedToPlay = async (data: any) => {
            console.log('Is Not Permitted To Play:', data);
            authenticate()
        };

        const gameEventManager = GameEventManager.getInstance();
        const events = [
            { event: GameEvents.sessionTimeout, handler: () => setIsTimeout(true) },
            { event: GameEvents.isUnderMaintain, handler: (data) => setUMInfo(data?.umInfo) },
            { event: GameEvents.isNotPermittedToPlay, handler: (data) => handleIsNotPermittedToPlay(data) },
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
