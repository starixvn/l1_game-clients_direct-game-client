import UserClientCommunication from "sc-user-service-client/dist/user-client-communication";
import { getBaseServiceUrl } from "../utils";

const lobbyService = UserClientCommunication?.getUserClientInstance(getBaseServiceUrl())?.lobby;

export const getLobbyConfigs = async (session: string, username: string) => {
    const res = await lobbyService?.getDirectLobbyConfigs(session, username);
    return res?.directLobbyConfigs;
};
