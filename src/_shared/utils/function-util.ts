export default class FunctionUtil {
    public static isAndroidWebView(): boolean {
        const userAgent = (navigator?.userAgent || navigator?.vendor || window?.opera || '').toString();

        // Check for Android user agent
        const isAndroid = /Android/i.test(userAgent);

        // Check for WebView specifics
        const isWebView = !!(
            (window?.AndroidBridge && isAndroid) ||
            (userAgent.includes("wv") && isAndroid) ||
            (userAgent.includes("Version/") && !userAgent.includes("Chrome/"))
        );

        return isAndroid && isWebView;
    }

    public static async copyText(text: string) {
        try {
            if (typeof window !== "undefined") {
                if (this.isAndroidWebView()) {
                    window.ReactNativeWebView?.postMessage(JSON.stringify({ eventType: "copy_to_clipboard", data: text }));
                } else {
                    await navigator.clipboard.writeText(text);
                }
            } else {
                console.warn("Clipboard API is not available in this environment.");
            }

            return true;
        } catch (e) {
            console.error("Error copying text: ", e);
            return false;
        }
    }
}
