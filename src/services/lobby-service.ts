import { SSOResponse } from "sc-user-service-client/dist/auth";
import { appSettings } from "../components/game-setting";
import UserClientCommunication from "sc-user-service-client/dist/user-client-communication";

const gameDomain = appSettings.gameDomain;
const lobbyService = UserClientCommunication?.getUserClientInstance(gameDomain)?.lobby;

export const getLobbyConfigs = async (session: SSOResponse) => {
    return lobbyService?.getLobbyConfigs(session.ss, session.username);
};
