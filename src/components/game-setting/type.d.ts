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
    systemType: string;
    ssl: boolean;
    gameDomain: string;
    env: string;
    subDirectory?: string;
}
