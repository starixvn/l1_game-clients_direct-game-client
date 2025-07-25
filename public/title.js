const OPERATORS = {
    SP: {
        title: "Saba Play",
        favicon: "favicons/favicon_sp.ico",
    },
    SG: {
        title: {
            vi: "Cổng Game SABA",
            default: "SABA.games",
        },
        favicon: "favicons/favicon_sg.ico",
    },
    VG: {
        title: "Vgaming",
        favicon: "favicons/favicon_vg.ico",
    },
    TIP88: {
        title: "SoiBet",
        favicon: "favicons/favicon_tip88.ico",
    },
};

const LANGUAGE_MAP = {
    "vi-VN": "vi",
    "en-US": "en",
    "ja-JP": "ja",
    "th-TH": "th",
    "id-ID": "id",
    "zh-CN": "zh_cn",
    "zh-TW": "zh_tw",
};
class TitleManager {
    constructor() {
        this.language = this.getCurrentLanguage().replace(/['"]+/g, "");
        this.operator = this.getCurrentOperator().replace(/['"]+/g, "");
    }

    localStorageKeys = {
        language: this.buildLocalStorageKey("language"),
        operator: this.buildLocalStorageKey("operator"),
    };

    buildLocalStorageKey(key) {
        if (typeof window !== "undefined" && window.location?.hostname) {
            return `${window.location.hostname}.${key}`;
        }
        return key;
    }

    getDataFromURLParams(key) {
        const urlParams = new URLSearchParams(window.location.search);
        if (urlParams.has(key)) return urlParams.get(key);

        if (urlParams.has("params")) {
            const otherParams = new URLSearchParams(window.atob(urlParams.get("params")));
            if (otherParams.has(key)) return otherParams.get(key);
        }
        return null;
    }

    getCurrentLanguage() {
        let language = "en";
        try {
            const languageKey = this.localStorageKeys.language;
            language = localStorage.getItem(languageKey) || language;
        } catch (e) {}

        const langKey = this.getDataFromURLParams("lang");
        return langKey ? LANGUAGE_MAP[langKey] || "en" : language;
    }
    getCurrentOperator() {
        try {
            const operatorKey = this.localStorageKeys.operator;
            const storedOperator = localStorage.getItem(operatorKey) || "";
            return this.getDataFromURLParams("op") || storedOperator;
        } catch (e) {
            return this.getDataFromURLParams("op") || "";
        }
    }

    init() {
        const operatorKey = this.operator.toUpperCase();
        const operatorConfig = OPERATORS[operatorKey] || { title: "Default Title", favicon: "favicon.ico" };

        const title =
            typeof operatorConfig.title === "object"
                ? operatorConfig.title[this.language] || operatorConfig.title.default
                : operatorConfig.title;
        document.title = title;
        document.getElementById("favicon").href = operatorConfig.favicon;
    }

    resetMetaViewport() {
        const metaViewport = document.querySelector("meta[name='viewport']");
        if (metaViewport) {
            metaViewport.setAttribute(
                "content",
                "width=device-width,user-scalable=no,initial-scale=1,minimum-scale=1,maximum-scale=1,minimal-ui=true"
            );
        }
    }
}

const titleManager = new TitleManager();
titleManager.init();
window.resetMetaViewport = titleManager.resetMetaViewport;
