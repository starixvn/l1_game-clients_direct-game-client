import { StorageManager } from "./storage-manager";

const playerSettingKey = "player_settings";

export interface PlayerSetting {
    musicEnable: boolean;
    sfxEnable: boolean;
    isUserGesture: boolean;
}

export function getPlayerSetting(): PlayerSetting {
    return StorageManager.get<PlayerSetting>(playerSettingKey) ?? ({} as PlayerSetting);
}

export function storePlayerSetting(playerSettings: any) {
    const currentPlayerSetting = StorageManager.get(playerSettingKey) ?? {};
    const newPlayerSetting = Object.assign(currentPlayerSetting, playerSettings);
    StorageManager.set(playerSettingKey, newPlayerSetting);
}
