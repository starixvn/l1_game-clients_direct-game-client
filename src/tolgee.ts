import { FormatIcu } from "@tolgee/format-icu";
import { BackendFetch, GetPath, Tolgee } from "@tolgee/react";
import { buildVersion, languageCodes, locales, ResourceTypes } from "../src/_shared/consts";

const namespaces = [ResourceTypes.GAME_NAMES, ResourceTypes.COMMON];

const trimSlashes = (path: string): string => {
    if (path.endsWith("/")) {
        return path.slice(0, -1);
    }
    return path;
};

const getPath: GetPath = ({ namespace, language, prefix }: { namespace?: string; language: string; prefix: string }): string => {
    const basePath = trimSlashes(prefix);
    return namespace ? `${basePath}/${namespace}/${language}.json?v=${buildVersion}` : `${basePath}/${language}.json?v=${buildVersion}`;
};

export const tolgee = Tolgee().use(FormatIcu()).use(BackendFetch({ getPath })).init({
    fallbackLanguage: locales.en,
    defaultLanguage: locales.en,
    availableLanguages: languageCodes,
    projectId: "5",
    ns: namespaces,
    defaultNs: ResourceTypes.COMMON,
});
