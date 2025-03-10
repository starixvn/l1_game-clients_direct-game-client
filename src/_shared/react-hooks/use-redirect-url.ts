import { useEffect } from "react";
import { localStorageKeys, StorageManager } from "../../_shared/utils";

export const useRedirectUrl = () => {
    let redirectUrl = "";
    const url = StorageManager.get<string>(localStorageKeys.returnUrl);
    if (url !== "undefined" && url !== "") {
        redirectUrl = url;
    }

    useEffect(() => {
        StorageManager.remove(localStorageKeys.returnUrl);
    }, []);

    return redirectUrl;
};
