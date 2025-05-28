export interface IGameSetting {
    id: number;
    order: number;
}

interface SentryOptions {
    dsn: string;
    environment: string;
}

export interface IAppSettings {
    sentry: SentryOptions;
    system: string;
    ssl: boolean;
    serviceDomain: string;
    env: string;
    subDirectory?: string;
    isDev?: boolean;
    clientUrlFormatV3?: string;
    clientUrlFormatV2?: string;
    hideGameTab?: boolean;
    enablePromotionTournament?: boolean;
    promotionDomain?: string;
    intervalPromotionByMinute?: number;
}
