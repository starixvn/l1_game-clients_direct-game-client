import React, { useCallback, useEffect, useState } from "react";

import { appSettings } from "../../_shared/game-setting";
import { useAuthorization } from "../../_shared/react-hooks/use-authorization";
import { localStorageKeys, StorageManager } from "../../_shared/utils";
import { GameEventManager, GameEvents } from "../../_shared/utils/game-event-manager";
import { getAvailableGameId, getOfferedGameIds } from "../../_shared/utils/game-setting";
import { getGameUrl } from "../../_shared/utils/url-helper";
import Loading from "../common/loading";
import { GameFrame } from "./game-frame";
import { GameTabs } from "./game-tabs";
import { LobbyContainer } from "./styles/lobby.style";

const SessionTimeoutPage = React.lazy(() => import("../timeout"));
const UMPage = React.lazy(() => import("../um"));
const NonOfferPage = React.lazy(() => import("../non-offer"));
const LandscapeMode = React.lazy(() => import("../landscape-mode"));
const PromotionTournamentContainer = React.lazy(() => import("../promotion-tournament"));

// Height of the tab navigation bar in pixels
const TAB_HEIGHT = 34;

const Lobby: React.FC = () => {
    const [gameOfferIds, setGameOfferIds] = useState<number[]>([]);
    const [availableGameId, setAvailableGameId] = useState<number>(0);
    const [isTimeout, setIsTimeout] = useState(false);
    const { umInfo, setUMInfo, isSessionTimeout, initialize } = useAuthorization();
    const [isLoading, setIsLoading] = useState(true);
    const [queryGameId, setQueryGameId] = useState(() => {
        const params = new URLSearchParams(window.location.search);
        const gameId = params.get("gameId");
        if (gameId) {
            const parsedGameId = parseInt(gameId, 10);
            StorageManager.set(localStorageKeys.queryGameId, parsedGameId || 0);
            return isNaN(parsedGameId) ? 0 : parsedGameId;
        }

        const token = params.get("token");
        if (token) {
            return 0;
        }

        const storedGameId = StorageManager.get<number>(localStorageKeys.queryGameId);
        return storedGameId || 0;
    });

    const authenticate = async () => {
        setIsLoading(true);
        const response = await initialize();
        if (response?.authorized) {
            const offeredGameIds = await getOfferedGameIds(response);
            setGameOfferIds(offeredGameIds);
            const selectedGameId =
                queryGameId && offeredGameIds.includes(queryGameId) ? queryGameId : getAvailableGameId(offeredGameIds, response) || 0;
            setAvailableGameId(selectedGameId);
        }
        setIsLoading(false);
    };

    useEffect(() => {
        authenticate();
    }, [queryGameId]);

    const handleNotPermittedToPlay = () => {
        authenticate();
    };

    const handleOpenOtherGame = useCallback(
        (gameId: number) => {
            if (!gameOfferIds.includes(gameId)) {
                return;
            }
            if (appSettings.hideGameTab) {
                setQueryGameId(gameId);
            } else {
                StorageManager.remove(localStorageKeys.selectedGameId);
                setAvailableGameId(gameId);
            }
        },
        [gameOfferIds]
    );

    useEffect(() => {
        const gameEventManager = GameEventManager.getInstance();
        const events = [
            { event: GameEvents.sessionTimeout, handler: () => setIsTimeout(true) },
            { event: GameEvents.isUnderMaintain, handler: (data) => setUMInfo(data?.umInfo) },
            { event: GameEvents.isNotPermittedToPlay, handler: handleNotPermittedToPlay },
            {
                event: GameEvents.backLobby,
                handler: (data) => +data.gameId && handleOpenOtherGame(+data.gameId),
            },
        ];

        const subscriptions = events.map(({ event, handler }) => gameEventManager.subscribe(event, handler));

        return () => {
            subscriptions.forEach((id) => gameEventManager.unsubscribe(id));
        };
    }, [handleOpenOtherGame]);

    const renderGameContent = () => {
        if (appSettings.hideGameTab && queryGameId > 0) {
            return <GameFrame gameId={queryGameId} iframeSrc={getGameUrl(queryGameId, [])} />;
        }

        return <GameTabs gameOfferIds={gameOfferIds} availableGameId={availableGameId} tabHeight={TAB_HEIGHT} />;
    };

    if (isLoading) {
        return <Loading />;
    }
    if (isSessionTimeout || isTimeout) {
        return <SessionTimeoutPage />;
    }
    if (umInfo) {
        return <UMPage umInfo={umInfo} />;
    }
    if (gameOfferIds.length === 0 || (appSettings.hideGameTab && !gameOfferIds.includes(queryGameId))) {
        return <NonOfferPage />;
    }

    return (
        <>
            <LandscapeMode />
            <LobbyContainer $tabHeight={TAB_HEIGHT} $hideTab={appSettings.hideGameTab && availableGameId > 0}>
                {renderGameContent()}
            </LobbyContainer>
            {appSettings.enablePromotionTournament && <PromotionTournamentContainer tabHeight={TAB_HEIGHT} />}
        </>
    );
};

export default Lobby;
