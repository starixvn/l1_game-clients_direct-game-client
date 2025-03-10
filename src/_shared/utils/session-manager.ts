import { SSOResponse } from "sc-user-service-client/dist/auth";
import { StorageManager } from "./storage-manager";

const sessionIdStorageName = "scss";
const micrositeGameIdKey = "microsite_game_id";

export type Session = {
    time: Date;
} & SSOResponse;

export function getSessionKey() {
    if (window?.location?.hostname) {
        return `${window.location.hostname}.${sessionIdStorageName}`;
    }

    return sessionIdStorageName;
}

export function getSession(): Session {
    return StorageManager.get<Session>(getSessionKey()) ?? ({} as Session);
}

export function storeSessionData(data: any) {
    StorageManager.set(getSessionKey(), data);
}

export function clearSessionData() {
    StorageManager.remove(getSessionKey());
}
