import React, { useEffect, useRef, useState } from "react";
import { Tab, Tabs } from "react-bootstrap";
import { useTranslation } from "react-i18next";
import { appSettings, gameSettings } from "../game-setting";
import FunctionUtil from "../utils/function-util";
import { observeSessionFromGame } from "../utils/session-manager";
import { observeSoundFromGame } from "../utils/player-setting";
import { getGameUrl } from "../utils/url-helper";
import "./lobby.scss";
import { getImageUrl } from "../utils/icon-helper";
import { authorize, createNickname, getLobbyConfigs, sso, verifySession } from "../../services/auth-service";
import { AuthorizeResponse, SSOResponse } from "sc-user-service-client/dist/auth";
import NameGenerator from "../utils/name-generator";
import { randomInteger } from "../utils/number-helper";
import { AppType, Themes } from "../consts";
import { getAndHandleGameOfferIds, ILobbyConfigs } from "../utils/lobby-helper";

export const MAX_AVATAR_ID = 40;

export type MicroSiteGameParams = {
    copyToClipboard?: string;
};

observeSessionFromGame();
observeSoundFromGame();

export type URLContextModel = {
    token?: string;
    language?: string;
    gameId?: number;
    isDirectMode?: boolean;
    redirectUrl?: string;
    isThirdParty?: boolean;
    backToLobby?: boolean;
    backToRedirectUrl?: Function;
    firstSSOToLobby?: boolean;
    appType?: number;
};

export function parseContextFromURL(): URLContextModel | undefined {
    const params = new URLSearchParams(window.location?.search);
    // Reload page
    if (Array.from(params.values()).length === 0) {
        return;
    }

    const token = params.get("token") || "";
    const language = params.get("lang");
    const gameId = Number(params.get("gameId") || 0);
    const appType = Number(params.get("appType") || 0);
    const isDirectMode = !!params.get("ref");
    const redirectUrl = isDirectMode ? params.get("rurl") : "";
    const isThirdParty = isDirectMode && !!redirectUrl;
    return { token, language, gameId, appType, isDirectMode, redirectUrl, isThirdParty, firstSSOToLobby: true };
}

const autoCreateNickname = async (session: SSOResponse, signOut: Function) => {
    const nickname = NameGenerator.generateName();
    const maxAvatarId = MAX_AVATAR_ID;
    const selectedAvatarId = randomInteger(1, maxAvatarId);
    const authorizeResponse = (await createNickname(session, nickname, selectedAvatarId)) as AuthorizeResponse;
    if (authorizeResponse?.authorized) {
        Object.assign(authorizeResponse.user, { settings: { theme: Themes.light } });
        authorizeResponse.user.isSignedInSM = true;
    } else {
        signOut?.();
    }

    return authorizeResponse;
};

const Lobby: React.FC = () => {
    const context = parseContextFromURL();
    const token = context?.token ?? "";
    const appType = context?.appType ?? appSettings.appType;

    const wrapperIframeRef = useRef<HTMLIFrameElement>(null);
    const getSortedGameSettings = () => {
        return gameSettings.sort((a, b) => a.order - b.order);
    };

    const { t } = useTranslation();
    const [activeKey, setActiveKey] = useState(0 as number);
    const [isLoading, setIsLoading] = useState(true);
    const [iframeSrc, setIframeSrc] = useState(getGameUrl(getSortedGameSettings()[0].id)); // Set initial iframe src
    const [authorizeResponse, setAuthorizeResponse] = useState<AuthorizeResponse>(null);
    const [lobbyConfigs, setLobbyConfigs] = useState<ILobbyConfigs>(null);
    const [gameOfferIds, setGameOfferIds] = useState<number[]>([]);

    const handleTabSelect = (index: number) => {
        console.log("handleTabSelect", index);
        setActiveKey(index);
        const gameId = getSortedGameSettings()[index].id;
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

    const getSession = async (token: string) => {
        return token ? sso(token, appSettings.appType) : verifySession();
    };

    const loadLobbyConfigs = async (session: SSOResponse, authorizeInfo: any) => {
        const lobby = await getLobbyConfigs(session);
        if (lobby?.lobbyConfigs) {
            setLobbyConfigs(lobby.lobbyConfigs);
            getAndHandleGameOfferIds(authorizeInfo, lobby.lobbyConfigs, setGameOfferIds);
        }
        return lobby?.lobbyConfigs;
    };

    const isTimeoutSession = (session: SSOResponse) => {
        return !session || (!session?.isUM && !session?.isAuthenticated);
    };

    const signOut = () => {
        return <div>Sign Out</div>;
    };

    useEffect(() => {
        let authorizeInfo;
        const handleInitialization = async () => {
            const session = await getSession(token);

            if (!session || isTimeoutSession(session)) {
                signOut();
                return;
            }

            authorizeInfo = await authorize(session);

            await loadLobbyConfigs(session, authorizeInfo);

            if (!authorizeInfo?.authorized && appType === AppType.directGame) {
                authorizeInfo = await autoCreateNickname(session, signOut);
            }

            if (authorizeInfo) {
                setAuthorizeResponse(authorizeInfo);
            }
        };
        try {
            handleInitialization();
        } catch (error) {
            console.error("Error initializing: ", error);
        } finally {
            setIsLoading(false);
        }
        // window.addEventListener("message", handleEvent);

        // return () => {
        //     window.removeEventListener("message", handleEvent);
        // };
    }, []);
    console.log("offerIds: ", gameOfferIds);

    if (isLoading) {
        return <div>Loading...</div>;
    }

    return (
        <div className="lobby">
            <Tabs activeKey={activeKey} onSelect={(k) => k && handleTabSelect(+k)}>
                {gameOfferIds.map((gameOfferId, index) => {
                    const isActive = activeKey === index;
                    return (
                        <Tab
                            eventKey={index}
                            title={
                                <div style={{ display: "flex", alignItems: "center", color: isActive ? "#FF9000" : "#737373" }}>
                                    <img
                                        src={getImageUrl(gameOfferId, isActive)}
                                        alt={t(`gameNames.${gameOfferId}`)}
                                        style={{ width: "20px", height: "20px", marginRight: "8px" }}
                                    />
                                    {t(`gameNames.${gameOfferId}`)}
                                </div>
                            }
                            key={gameOfferId}
                            unmountOnExit={true}
                        >
                            {/* TODO: Remove this iframe */}
                            {/* <iframe ref={wrapperIframeRef} title={`Game ${gameSetting.id}`} width="100%" height="100%" src={iframeSrc} /> */}
                            <div>{`DIRECT GAME CLIENT`}</div>
                            {authorizeResponse?.user?.name && <div>{`Player Name: ${authorizeResponse?.user?.name}`}</div>}
                        </Tab>
                    );
                })}
            </Tabs>
        </div>
    );
};

export default Lobby;
