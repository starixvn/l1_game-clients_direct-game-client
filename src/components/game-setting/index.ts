import gameSettingsConfig from "../../../game-settings.json";
import appSettingConfig from "../../../configs.json";
import { IAppSettings, IGameSetting } from "./type";

export const appSettings: IAppSettings = appSettingConfig;
export const gameSettings: IGameSetting[] = gameSettingsConfig;
