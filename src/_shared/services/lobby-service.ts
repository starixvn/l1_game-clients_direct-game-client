import { SSOResponse } from "sc-user-service-client/dist/auth";
import { appSettings } from "../game-setting";
import UserClientCommunication from "sc-user-service-client/dist/user-client-communication";
import { getBaseServiceUrl } from "../utils/url-helper";

export const getLobbyConfigs = async (session: SSOResponse) => {
    const lobbyService = UserClientCommunication?.getUserClientInstance(getBaseServiceUrl())?.lobby;
    if (!lobbyService) {
        throw new Error("Lobby service not initialized");
    }
    return lobbyService.getLobbyConfigs(session.ss, session.username);
};
