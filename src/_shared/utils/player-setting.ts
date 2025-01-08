import { appSettings } from "../game-setting";
import { StorageManager } from "./storage-manager";

const playerSettingKey = "player_settings";

export interface PlayerSetting {
    musicEnable: boolean;
    sfxEnable: boolean;
    isUserGesture: boolean;
}

export const observeSoundFromGame = () => {
    window.addEventListener("message", (event) => {
        if (appSettings.gameDomain === event.origin || event.origin === "http://localhost:7456") {
            const receivedMessage = event.data;
            if ("isUserGesture" in receivedMessage || "sfxEnable" in receivedMessage || "musicEnable" in receivedMessage) {
                storePlayerSetting(receivedMessage);
            }
        }
    });
};

export function getPlayerSetting(): PlayerSetting {
    return StorageManager.get<PlayerSetting>(playerSettingKey) ?? ({} as PlayerSetting);
}

export function storePlayerSetting(playerSettings: any) {
    const currentPlayerSetting = StorageManager.get(playerSettingKey) ?? {};
    const newPlayerSetting = Object.assign(currentPlayerSetting, playerSettings);
    StorageManager.set(playerSettingKey, newPlayerSetting);
}
