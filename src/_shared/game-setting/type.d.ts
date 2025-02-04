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
    clientUrlFormat?: string;
    hideGameTab?: boolean;
    xdGameUrl?: string;
    enablePromotionTournament?: boolean;
    promotionDomain?: string;
    intervalPromotionByMinute?: number;
}
