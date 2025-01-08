import { v4 as uuidv4 } from "uuid";
import { appSettings } from "../game-setting";

export type Listener = {
    id: string;
    event: string;
    handleEvent: Function;
};

export const GameEvents = {
    isUserGesture: "isUserGesture",
    getGameName: "getGameName",
    isNotPermittedToPlay: "isNotPermittedToPlay",
    isUnderMaintain: "isUnderMaintain",
    sessionTimeout: "sessionTimeout",
    isDisconnect: "isDisconnect",
    musicEnable: "musicEnable",
    sfxEnable: "sfxEnable",
    replaceUrl: "replaceUrl",
    copyToClipboard: "copyToClipboard",
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

    static handleMessage(event: MessageEvent) {
        if (appSettings.gameDomain === event.origin || event.origin === "http://localhost:7456") {
            const key = Object.keys(event.data).find((k) => GameEvents[k]);
            GameEventManager.instance.notify(key, event.data);
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
