export default class FunctionUtil {
    public static isAndroidWebView(): boolean {
        const userAgent = navigator?.userAgent || navigator?.vendor || window?.opera;

        // Check for Android user agent
        const isAndroid = /Android/i.test(userAgent);

        // Check for WebView specifics
        const isWebView = !!(
            (
                (window?.AndroidBridge && isAndroid) || // Detect AndroidBridge
                (userAgent.includes("wv") && isAndroid) || // Check for 'wv' in user agent (common for WebView)
                (userAgent.includes("Version/") && !userAgent.includes("Chrome/"))
            ) // For WebViews
        );

        return isAndroid && isWebView;
    }

    public static async copyText(text: string) {
        try {
            if (this.isAndroidWebView()) {
                window?.ReactNativeWebView?.postMessage(JSON.stringify({ eventType: "copy_to_clipboard", data: text }));
            } else {
                await navigator.clipboard.writeText(text);
            }
            return true;
        } catch (e) {
            console.log("error copyText", e);
            return false;
        }
    }
}
