import { useTranslate } from "@tolgee/react";
import { ResourceTypes } from "../consts";

export function parseTranslationKey(input: string) {
    if (input.includes(".")) {
        const ns = input.split(".")[0];
        const key = input.split(".")[1];
        return { key, ns };
    } else {
        return { key: input };
    }
}

export const useTranslator = (gameNamespaces?: string[]) => {
    const defaultNamespaces = [ResourceTypes.COMMON];
    const ns = gameNamespaces ? gameNamespaces.concat(defaultNamespaces) : defaultNamespaces;
    const translator = useTranslate(ns);
    const t = (key: string, params?: any, opt?: any) => {
        const { key: parsedKey, ns } = parseTranslationKey(key);

        return translator.t({ key: parsedKey, ns, params, ...opt });
    };
    return { t };
};
