import { FormatIcu } from "@tolgee/format-icu";
import { BackendFetch, GetPath, Tolgee } from "@tolgee/react";
import { buildVersion } from "../src/_shared/consts";

const languageCodes = ["en", "id", "th", "vi", "zh_cn", "zh_tw"];

const namespaces = ["gameNames", "Common"];

const trimSlashes = (path: string): string => {
    if (path.endsWith("/")) {
        return path.slice(0, -1);
    }
    return path;
};

// TODO: Need to add build version to the path
// const getPath: GetPath = ({ namespace, language, prefix }: { namespace?: string; language: string; prefix: string }): string => {
//     const basePath = trimSlashes(prefix);
//     return namespace ? `${basePath}/${namespace}/${language}.json?v=${buildVersion}` : `${basePath}/${language}.json?v=${buildVersion}`;
// };

export const tolgee = Tolgee().use(FormatIcu()).use(BackendFetch()).init({
    fallbackLanguage: "en",
    defaultLanguage: "en",
    availableLanguages: languageCodes,
    projectId: "5",
    ns: namespaces,
    defaultNs: "Common",
});
