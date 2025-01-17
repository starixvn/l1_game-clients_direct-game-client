import * as Sentry from "@sentry/react";

Sentry.init({
    ...window.envConfig?.sentry,
    initialScope: {
        tags: {
            app: "direct-game-client",
        },
    },
    ignoreErrors: ["Network Error"],
});
