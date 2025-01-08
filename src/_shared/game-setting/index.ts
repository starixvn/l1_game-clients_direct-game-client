import gameSettingsConfig from "../../../game-settings.json";
import { IAppSettings, IGameSetting } from "./type";

declare global {
    interface Window {
        envConfigs: IAppSettings;
    }
}

const getAppSettings = (): IAppSettings => {
    return window?.envConfigs;
};
export const appSettings: IAppSettings = getAppSettings();
export const gameSettings: IGameSetting[] = gameSettingsConfig;
