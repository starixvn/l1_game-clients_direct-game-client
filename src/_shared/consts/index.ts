export const languageMapping = {
    "vi-VN": "vi",
    "en-US": "en",
    "en-UK": "en",
    "ja-JP": "ja",
    "th-TH": "th",
    "id-ID": "id",
    "zh-CN": "zh_cn",
    "zh-TW": "zh_tw",
};

export const languageCodes = ["en", "id", "th", "vi", "zh_cn", "zh_tw", "ja"];

export const locales = { en: "en", vi: "vi", th: "th", id: "id", zh_cn: "zh_cn", zh_tw: "zh_tw", ja: "ja" };

export const MAX_AVATAR_ID = 40;

export type LanguageKey = keyof typeof languageMapping;

export const AppTypes = {
    LOBBY: 1,
    DIRECT: 7,
};

export const ResourceTypes = {
    COMMON: "Common",
    MESSAGES: "messages",
    INSTANT_GAME: "InstantGame",
};

export const buildVersion = process.env.BUILD_VERSION || 111;

export const errorCodes = {
    NICKNAME_EXISTS: "SB0015",
};

export const directRef = ["d_direct", "m_direct"];
