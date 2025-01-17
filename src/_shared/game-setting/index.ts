import { GroupCurrency } from "../consts";
import { GameIds } from "../consts/game-ids";
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

export const gamesByCurrencyGroup = {
    [GroupCurrency.GrUSD]: [GameIds.SeDie],
    [GroupCurrency.Default]: [GameIds.SeDie],
};
