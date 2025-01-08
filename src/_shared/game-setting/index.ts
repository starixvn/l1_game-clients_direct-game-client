import gameSettingsConfig from "../../../game-settings.json";
import { IAppSettings, IGameSetting } from "./type";

declare global {
    interface Window {
        envConfig: IAppSettings;
    }
}

const getAppSettings = (): IAppSettings => {
    return window?.envConfig;
};
export const appSettings: IAppSettings = getAppSettings();
export const gameSettings: IGameSetting[] = gameSettingsConfig;
