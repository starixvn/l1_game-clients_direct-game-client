import React, { useEffect, useState } from "react";
import { Tab, Tabs } from "react-bootstrap";
import { useTranslation } from "react-i18next";
import { appSettings } from "../game-setting";
import { observeSessionFromGame } from "../utils/session-manager";
import { observeSoundFromGame } from "../utils/player-setting";
import "./lobby.scss";
import { getImageUrl } from "../utils/icon-helper";
import { authorize, createNickname, sso, verifySession } from "../../services/auth-service";
import { AuthorizeResponse, SSOResponse } from "sc-user-service-client/dist/auth";
import NameGenerator from "../utils/name-generator";
import { randomInteger } from "../utils/number-helper";
import { AppType, MAX_AVATAR_ID } from "../consts";
import { getAndHandleGameOfferIds } from "../utils/lobby-helper";
import { loadURLContext } from "../utils";
import { getLobbyConfigs } from "../../services/lobby-service";

observeSessionFromGame();
observeSoundFromGame();

const Lobby: React.FC = () => {
    const context = loadURLContext();
    const token = context?.token ?? "";
    const appType = context?.appType ?? appSettings.appType;

    const { t } = useTranslation();
    const [activeKey, setActiveKey] = useState(0 as number);
    const [isLoading, setIsLoading] = useState(true);
    const [authorizeResponse, setAuthorizeResponse] = useState<AuthorizeResponse>(null);
    const [gameOfferIds, setGameOfferIds] = useState<number[]>([]);
    const [isRenderRegister, setIsRenderRegister] = useState(false);

    const loadSession = async (token: string) => {
        return token ? sso(token, appType) : verifySession();
    };

    const isTimeoutSession = (session: SSOResponse) => {
        return !session || (!session?.isUM && !session?.isAuthenticated);
    };

    const autoCreateNickname = async (session: SSOResponse) => {
        const nickname = NameGenerator.generateName();
        const selectedAvatarId = randomInteger(1, MAX_AVATAR_ID);
        const authorizeResponse = (await createNickname(session, nickname, selectedAvatarId)) as AuthorizeResponse;

        if (!authorizeResponse?.authorized) {
            setIsRenderRegister(true);
        }

        return authorizeResponse;
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
                setAuthorizeResponse(authorizeResponse);
                await loadLobbyConfigs(session, authorizeResponse);
            }
        } else {
            setAuthorizeResponse(authorizeInfo);
            await loadLobbyConfigs(session, authorizeInfo);
        }
    };

    const loadLobbyConfigs = async (session: SSOResponse, authorizeInfo: any) => {
        const lobby = await getLobbyConfigs(session);
        if (lobby?.lobbyConfigs) {
            getAndHandleGameOfferIds(authorizeInfo, lobby.lobbyConfigs, setGameOfferIds);
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

        initialize();
    }, []);

    if (isLoading) {
        return <div>Loading...</div>;
    }

    if (isRenderRegister) {
        return <div>Unauthorized</div>;
    }

    return (
        <div>
            <div className="lobby">
                <Tabs
                    activeKey={activeKey}
                    // onSelect={(k) => k && handleTabSelect(+k)}
                >
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
                            ></Tab>
                        );
                    })}
                </Tabs>
            </div>
            <div>
                <div>{`DIRECT GAME CLIENT`}</div>
                {authorizeResponse?.user?.name && <div>{`Player Name: ${authorizeResponse?.user?.name}`}</div>}
            </div>
        </div>
    );
};

export default Lobby;
