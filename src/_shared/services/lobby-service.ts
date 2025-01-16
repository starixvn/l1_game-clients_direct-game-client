import { SSOResponse } from "sc-user-service-client/dist/auth";
import { appSettings } from "../game-setting";
import UserClientCommunication from "sc-user-service-client/dist/user-client-communication";

const serviceDomain = appSettings.serviceDomain;

export const getLobbyConfigs = async (session: SSOResponse) => {
    const lobbyService = UserClientCommunication?.getUserClientInstance(serviceDomain)?.lobby;
    if (!lobbyService) {
        throw new Error("Lobby service not initialized");
    }
    return lobbyService.getLobbyConfigs(session.ss, session.username);
};
