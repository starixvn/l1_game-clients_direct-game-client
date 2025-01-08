import i18next from "i18next";
import { initReactI18next } from "react-i18next";
import translationEN from "./en.json";
import translationVI from "./vi.json";
import translationID from "./id.json";
import translationTH from "./th.json";
import translationZHCN from "./zh_cn.json";
import translationZHTW from "./zh_tw.json";
import { languageMapping, LanguageKey } from "../consts";
import { getParamCurrentUrl } from "../utils/url-helper";
import { getSession } from "../utils/session-manager";

export const initLanguage = () => {
    const resources = {
        en: { translation: translationEN },
        vi: { translation: translationVI },
        id: { translation: translationID },
        th: { translation: translationTH },
        zh_cn: { translation: translationZHCN },
        zh_tw: { translation: translationZHTW },
    };

    i18next.use(initReactI18next).init({
        lng: languageMapping[getLanguage() as LanguageKey],
        debug: true,
        resources,
    });
};

const getLanguage = () => {
    const lang = getParamCurrentUrl("lang") ?? getSession()?.language;

    return lang ?? "en-US";
};
