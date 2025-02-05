import { v4 as uuidv4 } from "uuid";
import { appSettings } from "../game-setting";
import { getRootHost } from "./url-helper";

export type Listener = {
    id: string;
    event: string;
    handleEvent: Function;
};

export const GameEvents = {
    isUserGesture: "isUserGesture",
    isNotPermittedToPlay: "isNotPermittedToPlay",
    isUnderMaintain: "isUnderMaintain",
    sessionTimeout: "sessionTimeout",
    musicEnable: "musicEnable",
    sfxEnable: "sfxEnable",
    backLobby: "backLobby",
};

export class GameEventManager {
    private listeners: Record<string, Listener> = {};

    subscribe(event: string, handle: Function): string {
        const id = uuidv4();
        this.listeners[id] = {
            id,
            event,
            handleEvent: handle,
        };
        return id;
    }

    unsubscribe(id: string) {
        delete this.listeners[id];
    }

    notify(event: string, data: any) {
        Object.values(this.listeners).forEach((listener) => {
            if (listener.event === event) {
                listener.handleEvent(data);
            }
        });
    }

    clear() {
        this.listeners = {};
    }

    private static instance: GameEventManager;

    static getRootDomain(hostname: string): string {
        return getRootHost(hostname);
    }

    static handleMessage(event: MessageEvent) {
        try {
            const eventUrl = new URL(event.origin);
            const currentUrl = new URL(document.location.href);

            const eventRootDomain = getRootHost(eventUrl.hostname);
            const currentRootDomain = getRootHost(currentUrl.hostname);

            if (eventRootDomain === currentRootDomain || appSettings.isDev) {
                const key = Object.keys(event.data).find((k) => GameEvents[k]);
                GameEventManager.instance.notify(key, event.data);
            }
        } catch (error) {
            console.error("Error processing message event:", error);
        }
    }
    static getInstance(): GameEventManager {
        if (!GameEventManager.instance) {
            GameEventManager.instance = new GameEventManager();
            window.addEventListener("message", this.handleMessage);
        }
        return GameEventManager.instance;
    }

    static destroy() {
        window.removeEventListener("message", this.handleMessage);
        GameEventManager.instance = null;
    }

    private constructor() {}
}
