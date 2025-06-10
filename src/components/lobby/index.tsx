import React, { useCallback, useEffect, useState } from "react";

import { appSettings } from "../../_shared/game-setting";
import { useAuthorization } from "../../_shared/react-hooks/use-authorization";
import { localStorageKeys, StorageManager } from "../../_shared/utils";
import { GameEventManager, GameEvents } from "../../_shared/utils/game-event-manager";
import { getAvailableGameId, getOfferedGameIds } from "../../_shared/utils/game-setting";
import { getGameUrl, getRootHost } from "../../_shared/utils/url-helper";
import Loading from "../common/loading";
import { GameFrame } from "./game-frame";
import { GameTabs } from "./game-tabs";
import { LobbyContainer } from "./styles/lobby.style";
import { getLobbyGameIds } from "../../_shared/utils/game-setting";
import { useHotdogScript } from "../../_shared/react-hooks";
const SessionTimeoutPage = React.lazy(() => import("../timeout"));
const UMPage = React.lazy(() => import("../um"));
const NonOfferPage = React.lazy(() => import("../non-offer"));
const LandscapeMode = React.lazy(() => import("../landscape-mode"));
const PromotionTournamentContainer = React.lazy(() => import("../promotion-tournament"));

// Height of the tab navigation bar in pixels
const TAB_HEIGHT = 34;

const Lobby: React.FC = () => {
    if (appSettings.hotdogScript && appSettings.hotdogScript.baseUrl) {
        useHotdogScript({
            baseUrl: appSettings.hotdogScript.baseUrl,
        });
    }
    const [gameOfferIds, setGameOfferIds] = useState<number[]>([]);
    const [availableGameId, setAvailableGameId] = useState<number>(0);
    const [isTimeout, setIsTimeout] = useState(false);
    const { umInfo, setUMInfo, isSessionTimeout, initialize } = useAuthorization();
    const [isLoading, setIsLoading] = useState(true);
    const [queryGameId, setQueryGameId] = useState(() => {
        const params = new URLSearchParams(window.location.search);
        const gameId = params.get("gameId");
        if (gameId) {
            let parsedGameId = parseInt(gameId, 10);
            parsedGameId = isNaN(parsedGameId) ? 0 : parsedGameId;
            StorageManager.set(localStorageKeys.portraitGameId, parsedGameId);
        }

        const storedGameId = StorageManager.get<number>(localStorageKeys.portraitGameId);

        return storedGameId || 0;
    });

    const authenticate = async () => {
        setIsLoading(true);
        const cacheParams = new URLSearchParams(window.location.search);
        const response = await initialize();
        if (response?.authorized) {
            const offeredGameIds = await getOfferedGameIds(response);
            setGameOfferIds(offeredGameIds);
            const selectedGameId =
                queryGameId && offeredGameIds.includes(queryGameId) ? queryGameId : getAvailableGameId(offeredGameIds, response) || 0;
            setAvailableGameId(selectedGameId);

            const isRedirect = await handleRedirect(cacheParams);
            if (isRedirect) {
                return;
            }
        }
        setIsLoading(false);
    };
    const handleRedirect = async (cacheParams: URLSearchParams) => {
        if (queryGameId > 0) {
            const lobbyGameIds = await getLobbyGameIds();
            if (!lobbyGameIds.includes(queryGameId)) {
                redirectToGame(queryGameId, cacheParams);

                return true;
            }
        }
        return false;
    };

    const redirectToGame = (gameId: number, cacheParams: URLSearchParams) => {
        // Add ref=m_direct parameter
        cacheParams.append("ref", "m_direct");
        // Get the redirect URL from environment config
        const redirectUrl = window.envConfig["xdGameUrl"];

        // Check if redirectUrl exists
        if (!redirectUrl) {
            console.warn(`Redirect URL not found for game ${gameId}`);
            setIsTimeout(true);
            return;
        }

        // Format the URL with host using getRootHost
        const formattedRedirectUrl = redirectUrl.replace("{host}", getRootHost(window.location.host));

        // Get query string with the added ref parameter
        const queryString = cacheParams.toString();
        // Construct final URL with query parameters if they exist
        const finalUrl = queryString ? `${formattedRedirectUrl}?${queryString}` : formattedRedirectUrl;
        window.location.href = finalUrl;
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

        return (
            <GameTabs
                gameOfferIds={gameOfferIds}
                availableGameId={availableGameId}
                setAvailableGameId={setAvailableGameId}
                tabHeight={TAB_HEIGHT}
            />
        );
    };

    if (isLoading) {
        return <Loading />;
    }
    if (isSessionTimeout || isTimeout || (!queryGameId && appSettings.hideGameTab)) {
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
