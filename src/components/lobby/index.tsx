import React, { useEffect, useRef, useState } from "react";
import { Tab, Tabs } from "react-bootstrap";
import { useTranslation } from "react-i18next";
import { appSettings } from "../game-setting";
import { observeSessionFromGame } from "../utils/session-manager";
import { observeSoundFromGame } from "../utils/player-setting";
import "./lobby.scss";
import { getImageUrl } from "../utils/icon-helper";
import { authorize, autoCreateNickname, sso, verifySession } from "../../services/auth-service";
import { AuthorizeResponse, SSOResponse } from "sc-user-service-client/dist/auth";
import { AppType } from "../consts";
import { getGameUrl, loadURLContext, parseContextFromURL } from "../utils";
import { getAndHandleGameOfferIds, getSortedGameSettings } from "../utils/game-setting";
import FunctionUtil from "../utils/function-util";
import Loading from "../common/loading";
import TimeOut from "../common/timeout";

export type MicroSiteGameParams = {
    copyToClipboard?: string;
};

observeSessionFromGame();
observeSoundFromGame();

const Lobby: React.FC<{ theme: string }> = ({ theme }) => {
    const wrapperIframeRef = useRef<HTMLIFrameElement>(null);
    const token = parseContextFromURL()?.token ?? "";

    const context = loadURLContext();
    const appType = context?.appType ?? appSettings.appType;

    const { t } = useTranslation();
    const [activeKey, setActiveKey] = useState(0 as number);
    const [isLoading, setIsLoading] = useState(true);
    const [authorizeResponse, setAuthorizeResponse] = useState<AuthorizeResponse>(null);
    const [gameOfferIds, setGameOfferIds] = useState<number[]>([]);
    const [isRenderRegister, setIsRenderRegister] = useState(false);
    const [iframeSrc, setIframeSrc] = useState<string>(getGameUrl(0)); // Set initial iframe src

    const handleTabSelect = (index: number) => {
        setActiveKey(index);
        const gameId = getSortedGameSettings(authorizeResponse)[index].id;
        setIframeSrc(getGameUrl(gameId)); // Update iframe src when switching tabs
    };

    const handleEvent = async ({ data }: { data: MicroSiteGameParams }) => {
        console.log("Post Message received: ", data);

        if (data?.copyToClipboard) {
            handleCopyToClipboard(data?.copyToClipboard);
            return;
        }
    };

    const handleCopyToClipboard = async (text: string) => {
        const copySuccessfully = await FunctionUtil.copyText(text);
        postMessageToMicroSite({ copySuccessfully });
    };

    const postMessageToMicroSite = (data: any) => {
        wrapperIframeRef?.current?.contentWindow?.postMessage(data, iframeSrc);
    };

    const loadSession = async (token: string) => {
        return token ? sso(token, appType) : verifySession();
    };

    const isTimeoutSession = (session: SSOResponse) => {
        return !session || (!session?.isUM && !session?.isAuthenticated);
    };

    const handleInitialization = async () => {
        let authorizeInfo;
        const session = await loadSession(token);
        if (!session || isTimeoutSession(session)) {
            setIsRenderRegister(true);
            return;
        }

        authorizeInfo = await authorize(session);
        await handleAuthorization(session, authorizeInfo);
    };

    const handleAuthorization = async (session: SSOResponse, authorizeInfo: any) => {
        if (!authorizeInfo?.authorized) {
            if (appType === AppType.directGame) {
                const authorizeResponse = await autoCreateNickname(session);
                if (!authorizeResponse?.authorized) {
                    setIsRenderRegister(true);
                }
                setAuthorizeResponse(authorizeResponse);
                getAndHandleGameOfferIds(authorizeResponse, setGameOfferIds);
            }
        } else {
            setAuthorizeResponse(authorizeInfo);
            getAndHandleGameOfferIds(authorizeInfo, setGameOfferIds);
        }
    };

    useEffect(() => {
        const initialize = async () => {
            try {
                await handleInitialization();
            } catch (error) {
                console.log("Initialization error: ", error);
            } finally {
                setIsLoading(false);
            }
        };
        window.addEventListener("message", handleEvent);

        initialize();
        return () => {
            window.removeEventListener("message", handleEvent);
        };
    }, []);

    useEffect(() => {
        // Set init iframe into first game offer id
        setIframeSrc(getGameUrl(gameOfferIds[0]));
    }, [gameOfferIds]);

    if (isLoading) {
        return <Loading />;
    }

    if (isRenderRegister) {
        return <TimeOut theme={theme} />;
    }

    return (
        <div>
            <div className="lobby">
                <Tabs activeKey={activeKey} onSelect={(k) => k && handleTabSelect(+k)}>
                    {gameOfferIds.map((gameOfferId, index) => {
                        const isActive = activeKey === index;
                        return (
                            <Tab
                                eventKey={index}
                                title={
                                    <div className={`tab-title ${isActive ? "active" : ""}`}>
                                        <img
                                            src={getImageUrl(gameOfferId, isActive)}
                                            alt={t(`gameNames.${gameOfferId}`)}
                                            className="tab-icon"
                                        />
                                        {t(`gameNames.${gameOfferId}`)}
                                    </div>
                                }
                                key={gameOfferId}
                                unmountOnExit={true}
                            >
                                <iframe ref={wrapperIframeRef} title={`Game ${gameOfferId}`} width="100%" height="100%" src={iframeSrc} />
                            </Tab>
                        );
                    })}
                </Tabs>
            </div>
        </div>
    );
};

export default Lobby;
