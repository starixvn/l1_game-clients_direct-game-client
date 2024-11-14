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
            // Ensure we are in the browser environment before using navigator.clipboard
            if (typeof window !== "undefined") {
                // Check if running inside an Android WebView (or another custom check for WebView)
                if (this.isAndroidWebView()) {
                    // Send message to React Native WebView for copying to clipboard
                    window.ReactNativeWebView?.postMessage(JSON.stringify({ eventType: "copy_to_clipboard", data: text }));
                } else {
                    // Use the browser clipboard API to copy text
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
