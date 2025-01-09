export const languageMapping = {
    "vi-VN": "vi",
    "en-US": "en",
    "en-UK": "en",
    "th-TH": "th",
    "id-ID": "id",
    "zh-CN": "zh_cn",
    "zh-TW": "zh_tw",
};

export const languageCodes = ["en", "id", "th", "vi", "zh_cn", "zh_tw"];

export const MAX_AVATAR_ID = 40;

export type LanguageKey = keyof typeof languageMapping;

export const ResourceTypes = {
    COMMON: "Common",
    GAME_NAMES: "gameNames",
    MESSAGES: "messages",
    INSTANT_GAME: "InstantGame",
};

export const buildVersion = 111;
