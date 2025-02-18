import { useState, useEffect } from "react";
import { localStorageKeys, StorageManager } from "../../_shared/utils";

export const useRedirectUrl = () => {
    const [redirectUrl, setRedirectUrl] = useState<string>("");

    useEffect(() => {
        const url = StorageManager.get<string>(localStorageKeys.returnUrl);
        if (url !== "undefined") {
            setRedirectUrl(url);
        }
        StorageManager.remove(localStorageKeys.returnUrl);
    }, []);

    return redirectUrl;
};
