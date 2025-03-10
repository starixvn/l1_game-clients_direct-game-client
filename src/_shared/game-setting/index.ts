import { IAppSettings } from "./type";

declare global {
    interface Window {
        envConfig: IAppSettings;
    }
}

const getAppSettings = (): IAppSettings => {
    return window?.envConfig;
};
export const appSettings: IAppSettings = getAppSettings();
