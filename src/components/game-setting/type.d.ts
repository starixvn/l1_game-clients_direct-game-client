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
    gameDomain: string;
    env: string;
    subDirectory?: string;
    appType: number;
    defaultOperatorId: string;
}
