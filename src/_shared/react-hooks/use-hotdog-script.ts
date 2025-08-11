import { useEffect } from "react";
import { localStorageKeys, StorageManager } from "../utils";

interface HotdogScriptParams {
    hdg_code?: string;
    hdg_game?: string;
    hdg_lang?: string;
    hdg_env?: string;
}

interface HotdogConfig {
    baseUrl?: string;
    defaultParams?: HotdogScriptParams;
}

const STORAGE_KEY = "hotdog_script_params";
const DEFAULT_CONFIG: HotdogConfig = {
    baseUrl: "https://res.hotdog-gaming.com/ingame-lobby-client/index.min.js",
    defaultParams: {},
};

const sxdGameId = 1000;

export const useHotdogScript = (config: HotdogConfig = DEFAULT_CONFIG) => {
    const { baseUrl, defaultParams } = config;

    useEffect(() => {
        const storedGameId = StorageManager.get<number>(localStorageKeys.portraitGameId);

        if (storedGameId >= sxdGameId) {
            return;
        }

        // Helper to get all params from localStorage
        const getStorageParams = (): HotdogScriptParams => {
            try {
                const storedParams = localStorage.getItem(STORAGE_KEY);
                return storedParams ? JSON.parse(storedParams) : {};
            } catch (error) {
                console.error("Error parsing stored params:", error);
                return {};
            }
        };

        // Helper to save all params to localStorage
        const saveStorageParams = (params: HotdogScriptParams) => {
            try {
                localStorage.setItem(STORAGE_KEY, JSON.stringify(params));
            } catch (error) {
                console.error("Error saving params:", error);
            }
        };

        // Helper to get param from URL or storage
        const getParam = (key: keyof HotdogScriptParams, defaultValue?: string): string => {
            // Try URL params first
            const urlParams = new URLSearchParams(window.location.search);
            const urlValue = urlParams.get(key);
            if (urlValue) {
                // Update storage with new URL param
                const currentParams = getStorageParams();
                saveStorageParams({ ...currentParams, [key]: urlValue });
                return urlValue;
            }

            // Then try localStorage
            const storageParams = getStorageParams();
            if (storageParams[key]) {
                return storageParams[key] as string;
            }

            // Finally use default value
            return defaultValue || "";
        };

        // Get parameters
        const params: HotdogScriptParams = {
            hdg_code: getParam("hdg_code", defaultParams?.hdg_code),
            hdg_game: getParam("hdg_game", defaultParams?.hdg_game),
            hdg_lang: getParam("hdg_lang", defaultParams?.hdg_lang),
            hdg_env: getParam("hdg_env", defaultParams?.hdg_env || "UAT"),
        };

        // Create script element
        const script = document.createElement("script");
        script.id = "hd-ingame-lobby-client";

        // Add onload event handler
        script.onload = () => {
            // Create and dispatch DOMContentLoaded event after script loads
            const domContentLoadedEvent = new Event("DOMContentLoaded", {
                bubbles: true,
                cancelable: true,
            });
            window.document.dispatchEvent(domContentLoadedEvent);
        };

        // Construct URL with parameters
        const queryString = new URLSearchParams(params as Record<string, string>).toString();
        script.src = `${baseUrl}?${queryString}`;

        // Add script to document
        document.head.appendChild(script);

        // Cleanup function
        return () => {
            const existingScript = document.getElementById("hd-ingame-lobby-client");
            if (existingScript) {
                document.head.removeChild(existingScript);
            }
        };
    }, [baseUrl, defaultParams]); // Add dependencies to useEffect
};

// Utility function to update stored parameters
export const updateHotdogParams = (params: Partial<HotdogScriptParams>) => {
    try {
        const currentParams = JSON.parse(localStorage.getItem(STORAGE_KEY) || "{}");
        const newParams = { ...currentParams, ...params };
        localStorage.setItem(STORAGE_KEY, JSON.stringify(newParams));
    } catch (error) {
        console.error("Error updating params:", error);
    }
};
