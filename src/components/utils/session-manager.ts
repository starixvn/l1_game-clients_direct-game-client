import { appSettings } from "../game-setting";
import { StorageManager } from "./storage-manager";

const sessionIdStorageName = "scss";
const micrositeGameIdKey = "microsite_game_id";

export interface Session {
    username: string;
    language: string;
    session: string;
    time: Date;
    isAuthenticated: boolean;
    system: number;
}

export function getSessionKey() {
    if (window.location && window.location.hostname) {
        return `${window.location.hostname}.${sessionIdStorageName}`;
    }

    return sessionIdStorageName;
}

export function getSession(): Session {
    return StorageManager.get(getSessionKey()) ?? {};
}

export function storeSessionData(data: any) {
    StorageManager.set(getSessionKey(), data);
}

export function getMicrositeGameId() {
    return StorageManager.get(micrositeGameIdKey) ?? 0;
}

export function storeMicrositeGameId(gameId: number) {
    StorageManager.set(micrositeGameIdKey, gameId);
}

export function removeMicrositeGameId() {
    StorageManager.remove(micrositeGameIdKey);
}

export const observeSessionFromGame = () => {
    window.addEventListener("message", (event) => {
        if (appSettings.gameDomain === event.origin || event.origin === "http://localhost:7456") {
            const receivedMessage = event.data;
            if (receivedMessage.sessionInfo) {
                storeSessionData(receivedMessage.sessionInfo);
                window.history.replaceState(null, "", window.location.pathname);
            }
        }
    });
};
