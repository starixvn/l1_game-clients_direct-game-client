import React, { useState } from "react";
import "./style.scss";
import { localStorageKeys, StorageManager } from "../../../_shared/utils";
import { useTolgee } from "@tolgee/react";
import { languageMapping } from "../../../_shared/consts";

const operatorAlias = {
    sp: "sp",
    vg: "vg",
    sg: "sg",
    tip88: "tip88",
};

const Loading = () => {
    const { getLanguage } = useTolgee();
    const [operator] = useState(() => {
        const params = new URLSearchParams(window.location.search);
        const op = params.get("op");
        return op || StorageManager.get<string>(localStorageKeys.operator) || "";
    });
    const [queryLanguage] = useState(() => {
        const params = new URLSearchParams(window.location.search);
        const lang = params.get("lang");
        return lang || StorageManager.get<string>(localStorageKeys.language);
    });
    const language = getLanguage();
    return (
        <div className="loading-page" data-testid="loading-page">
            <div className="bg" data-testid="bg"></div>
            <div className="logo">
                {operator && <div className={`logo-img ${operatorAlias[operator.toLowerCase()]}`}></div>}
                <div className={`logo-img ${operatorAlias[operator.toLowerCase()]}`}></div>
                <img
                    data-testid="text-logo"
                    className={`text text-${operatorAlias[operator.toLowerCase()]}`}
                    src={`/images/logo/text_${languageMapping[queryLanguage] || language}.webp`}
                    alt=""
                />
            </div>
            <div className="loader">
                <img data-testid="loading-icon" src="/images/icon-loading.gif" alt="" />
            </div>
        </div>
    );
};

export default Loading;
