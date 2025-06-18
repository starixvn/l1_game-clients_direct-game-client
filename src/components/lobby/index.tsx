import React, { useCallback, useEffect, useState } from "react";

import { appSettings } from "../../_shared/game-setting";
import { useAuthorization } from "../../_shared/react-hooks/use-authorization";
import { localStorageKeys, StorageManager } from "../../_shared/utils";
import { GameEventManager, GameEvents } from "../../_shared/utils/game-event-manager";
import { getAvailableGameId, getOfferedGames, LobbyConfig } from "../../_shared/utils/game-setting";
import { getGameUrl } from "../../_shared/utils/url-helper";
import Loading from "../common/loading";
import { GameFrame } from "./game-frame";
import { GameTabs } from "./game-tabs";
import { LobbyContainer } from "./styles/lobby.style";
import { AppTypes } from "../../_shared/consts";

const SessionTimeoutPage = React.lazy(() => import("../timeout"));
const UMPage = React.lazy(() => import("../um"));
const NonOfferPage = React.lazy(() => import("../non-offer"));
const LandscapeMode = React.lazy(() => import("../landscape-mode"));
const PromotionTournamentContainer = React.lazy(() => import("../promotion-tournament"));

const getTabHeight = (): number => {
    const tabHeightLandscape = 45;
    const tabHeightPortrait = 36;
    if (typeof window !== 'undefined') {
        return window.innerWidth > window.innerHeight ? tabHeightLandscape : tabHeightPortrait;
    }
    return tabHeightPortrait;
};

const Lobby: React.FC = () => {
    const [offerGames, setOfferGames] = useState<LobbyConfig[]>([]);
    const [availableGameId, setAvailableGameId] = useState<number>(0);
    const [isTimeout, setIsTimeout] = useState(false);
    const { umInfo, isSessionTimeout, session, setUMInfo, initialize } = useAuthorization();
    const [isLoading, setIsLoading] = useState(true);
    const [queryGameId, setQueryGameId] = useState(() => {
        const params = new URLSearchParams(window.location.search);
        const gameId = params.get("gameId");
        if (gameId) {
            const parsedGameId = parseInt(gameId, 10);
            StorageManager.set(localStorageKeys.queryGameId, parsedGameId || 0);
            return isNaN(parsedGameId) ? 0 : parsedGameId;
        }

        if (params.get("token")) {
            StorageManager.set(localStorageKeys.urlParams, params.toString());
            return 0;
        }

        const storedGameId = StorageManager.get<number>(localStorageKeys.queryGameId);
        return storedGameId || 0;
    });

    const authenticate = async () => {
        setIsLoading(true);
        const response = await initialize();
        if (response?.authorized) {
            const offeredGames = await getOfferedGames(response);
            setOfferGames(offeredGames);
            const selectedGameId =
                queryGameId && offeredGames.some((offer) => offer.gameId === queryGameId)
                    ? queryGameId
                    : getAvailableGameId(
                          offeredGames.map((offer) => offer.gameId),
                          response
                      ) || 0;
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
            if (!offerGames.some((offer) => offer.gameId === gameId)) {
                return;
            }
            if (appSettings.hideGameTab || session?.system !== AppTypes.DIRECT) {
                setQueryGameId(gameId);
            } else {
                StorageManager.remove(localStorageKeys.selectedGameId);
                setAvailableGameId(gameId);
            }
        },
        [offerGames]
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
        if ((appSettings.hideGameTab || session?.system !== AppTypes.DIRECT) && queryGameId > 0) {
            return <GameFrame gameId={queryGameId} iframeSrc={getGameUrl(queryGameId, [])} />;
        }

        return (
            <GameTabs
                offerGames={offerGames}
                availableGameId={availableGameId}
                setAvailableGameId={setAvailableGameId}
                tabHeight={getTabHeight()}
            />
        );
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
    if (offerGames.length === 0 || (appSettings.hideGameTab && !offerGames.some((offer) => offer.gameId === queryGameId))) {
        return <NonOfferPage />;
    }

    return (
        <>
            <LandscapeMode />
            <LobbyContainer
                $tabHeight={getTabHeight()}
                $hideTab={(appSettings.hideGameTab || session?.system !== AppTypes.DIRECT) && availableGameId > 0}
            >
                {renderGameContent()}
            </LobbyContainer>
        </>
    );
};

export default Lobby;
