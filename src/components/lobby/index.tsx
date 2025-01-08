import React, { useCallback, useEffect, useRef, useState } from "react";
import { appSettings } from "../../_shared/game-setting";
import { observeSessionFromGame } from "../../_shared/utils/session-manager";
import { observeSoundFromGame } from "../../_shared/utils/player-setting";
import "./lobby.scss";
import { getQueryParameters, getGameUrl } from "../../_shared/utils/url-helper";
import { getAndHandleGameOfferIds, getSortedGameSettings } from "../../_shared/utils/game-setting";
import Loading from "../common/loading";
import TimeOut from "../common/timeout";
import { useAuthorization } from "../../_shared/react-hooks/use-authorization";
import { GameTabs } from "./game-tabs";
import FunctionUtil from "../../_shared/utils/function-util";

observeSessionFromGame();
observeSoundFromGame();

const Lobby: React.FC<{ theme: string }> = ({ theme }) => {
    const wrapperIframeRef = useRef<HTMLIFrameElement>(null);
    const queryParameters = getQueryParameters();
    const { token, appType } = queryParameters;

    const [activeKey, setActiveKey] = useState(0);
    const [gameOfferIds, setGameOfferIds] = useState<number[]>([]);
    const [iframeSrc, setIframeSrc] = useState<string>();

    const { isLoading, authorizeResponse, isSessionTimeout, initialize } = useAuthorization(token, appType ?? appSettings.appType);

    const handleTabSelect = (index: number) => {
        setActiveKey(index);
        const gameId = getSortedGameSettings(authorizeResponse)[index].id;
        setIframeSrc(getGameUrl(gameId));
    };

    const postMessageToMicroSite = useCallback(
        (data: any) => {
            wrapperIframeRef?.current?.contentWindow?.postMessage(data, wrapperIframeRef.current.src);
        },
        [wrapperIframeRef]
    );

    const handleCopyToClipboard = useCallback(
        async (text: string) => {
            const copySuccessfully = await FunctionUtil.copyText(text);
            postMessageToMicroSite({ copySuccessfully });
        },
        [postMessageToMicroSite]
    );

    const handleEvent = useCallback(
        ({ data }: { data: any }) => {
            if (data?.copyToClipboard) {
                handleCopyToClipboard(data?.copyToClipboard);
                return;
            }
        },
        [handleCopyToClipboard]
    );

    useEffect(() => {
        const authenticate = async () => {
            const response = await initialize();
            if (response) {
                setGameOfferIds(getAndHandleGameOfferIds(response));
            }
        };

        window.addEventListener("message", handleEvent);
        authenticate();

        return () => {
            window.removeEventListener("message", handleEvent);
        };
    }, []);

    useEffect(() => {
        if (gameOfferIds.length > 0) {
            setIframeSrc(getGameUrl(gameOfferIds[0]));
        }
    }, [gameOfferIds]);

    if (isLoading) return <Loading />;
    if (isSessionTimeout) return <TimeOut theme={theme} />;

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
