// Mock setup must come before imports
jest.mock("../../../_shared/game-setting", () => ({
    appSettings: {
        isDev: false,
    },
}));

import { GameEventManager, GameEvents } from "../game-event-manager";

describe("GameEventManager", () => {
    let manager: GameEventManager;

    beforeEach(() => {
        // Reset the singleton instance before each test
        GameEventManager.destroy();
        manager = GameEventManager.getInstance();
    });

    describe("getRootDomain", () => {
        // Arrange
        const testCases = [
            {
                description: "should return same domain for simple domain",
                input: "example.com",
                expected: "example.com",
            },
            {
                description: "should return root domain for www subdomain",
                input: "www.example.com",
                expected: "example.com",
            },
            {
                description: "should return root domain for multiple subdomains",
                input: "game.staging.example.com",
                expected: "example.com",
            },
            {
                description: "should handle single-part domain",
                input: "localhost",
                expected: "localhost",
            },
            {
                description: "should handle empty string",
                input: "",
                expected: "",
            },
        ];

        testCases.forEach(({ description, input, expected }) => {
            it(description, () => {
                // Act
                const result = GameEventManager.getRootDomain(input);

                // Assert
                expect(result).toBe(expected);
            });
        });

        it("should handle cross-domain communication correctly", () => {
            // Arrange
            const domains = {
                same: [
                    ["www.example.com", "api.example.com"],
                    ["stage.example.com", "prod.example.com"],
                    ["a.b.example.com", "c.d.example.com"],
                    ["game.example.co.uk", "api.example.co.uk"],
                ],
                different: [
                    ["example.com", "example.org"],
                    ["example.co.uk", "example.com"],
                    ["test.com", "test.co.uk"],
                    ["127.0.0.1", "localhost"],
                ],
            };

            // Act & Assert
            domains.same.forEach(([domain1, domain2]) => {
                const root1 = GameEventManager.getRootDomain(domain1);
                const root2 = GameEventManager.getRootDomain(domain2);
                expect(root1).toBe(root2);
            });

            domains.different.forEach(([domain1, domain2]) => {
                const root1 = GameEventManager.getRootDomain(domain1);
                const root2 = GameEventManager.getRootDomain(domain2);
                expect(root1).not.toBe(root2);
            });
        });
    });

    describe("subscribe and notify", () => {
        it("should notify subscribed listeners when event occurs", () => {
            // Arrange
            const mockHandler = jest.fn();
            const testData = { value: "test" };

            // Act
            manager.subscribe(GameEvents.getGameName, mockHandler);
            manager.notify(GameEvents.getGameName, testData);

            // Assert
            expect(mockHandler).toHaveBeenCalledWith(testData);
        });

        it("should not notify listeners of different events", () => {
            // Arrange
            const mockHandler = jest.fn();

            // Act
            manager.subscribe(GameEvents.getGameName, mockHandler);
            manager.notify(GameEvents.isUserGesture, { value: "test" });

            // Assert
            expect(mockHandler).not.toHaveBeenCalled();
        });

        it("should allow multiple subscriptions to same event", () => {
            // Arrange
            const mockHandler1 = jest.fn();
            const mockHandler2 = jest.fn();
            const testData = { value: "test" };

            // Act
            manager.subscribe(GameEvents.getGameName, mockHandler1);
            manager.subscribe(GameEvents.getGameName, mockHandler2);
            manager.notify(GameEvents.getGameName, testData);

            // Assert
            expect(mockHandler1).toHaveBeenCalledWith(testData);
            expect(mockHandler2).toHaveBeenCalledWith(testData);
        });
    });

    describe("unsubscribe", () => {
        it("should remove listener when unsubscribed", () => {
            // Arrange
            const mockHandler = jest.fn();
            const subscriptionId = manager.subscribe(GameEvents.getGameName, mockHandler);

            // Act
            manager.unsubscribe(subscriptionId);
            manager.notify(GameEvents.getGameName, { value: "test" });

            // Assert
            expect(mockHandler).not.toHaveBeenCalled();
        });
    });

    describe("clear", () => {
        it("should remove all listeners", () => {
            // Arrange
            const mockHandler1 = jest.fn();
            const mockHandler2 = jest.fn();
            manager.subscribe(GameEvents.getGameName, mockHandler1);
            manager.subscribe(GameEvents.isUserGesture, mockHandler2);

            // Act
            manager.clear();
            manager.notify(GameEvents.getGameName, { value: "test" });
            manager.notify(GameEvents.isUserGesture, { value: "test" });

            // Assert
            expect(mockHandler1).not.toHaveBeenCalled();
            expect(mockHandler2).not.toHaveBeenCalled();
        });
    });

    describe("getInstance", () => {
        it("should return the same instance when called multiple times", () => {
            // Arrange & Act
            const instance1 = GameEventManager.getInstance();
            const instance2 = GameEventManager.getInstance();

            // Assert
            expect(instance1).toBe(instance2);
        });
    });

    describe("handleMessage", () => {
        let originalLocation: Location;

        beforeEach(() => {
            // Store original location
            originalLocation = window.location;
            delete window.location;
            window.location = new URL("https://game.example.com") as any;

            // Update appSettings mock
            const mockSettings = jest.requireMock("../../../_shared/game-setting");
            mockSettings.appSettings.isDev = false;
        });

        afterEach(() => {
            // Restore original location
            window.location = originalLocation;
        });

        it("should process message events in dev mode regardless of domain", () => {
            // Arrange
            const mockSettings = jest.requireMock("../../../_shared/game-setting");
            mockSettings.appSettings.isDev = true;

            const mockHandler = jest.fn();
            manager.subscribe(GameEvents.getGameName, mockHandler);

            // Create data object with the exact event key
            const messageData = {};
            messageData[GameEvents.getGameName] = "testGame";

            // Act
            const messageEvent = new MessageEvent("message", {
                origin: "https://completely-different-domain.com",
                data: messageData,
            });

            GameEventManager.handleMessage(messageEvent);

            // Assert
            expect(mockHandler).toHaveBeenCalledWith(messageData);
        });

        it("should not process message events from different root domains in production", () => {
            // Arrange
            const mockHandler = jest.fn();
            manager.subscribe(GameEvents.getGameName, mockHandler);

            // Create data object with the exact event key
            const messageData = {};
            messageData[GameEvents.getGameName] = "testGame";

            // Act
            const messageEvent = new MessageEvent("message", {
                origin: "https://api.different-domain.com",
                data: messageData,
            });

            GameEventManager.handleMessage(messageEvent);

            // Assert
            expect(mockHandler).not.toHaveBeenCalled();
        });

        it("should handle invalid message events gracefully", () => {
            // Arrange
            const mockHandler = jest.fn();
            manager.subscribe(GameEvents.getGameName, mockHandler);
            const consoleSpy = jest.spyOn(console, "error").mockImplementation();

            // Create data object with the exact event key
            const messageData = {};
            messageData[GameEvents.getGameName] = "testGame";

            // Act
            const messageEvent = new MessageEvent("message", {
                origin: "invalid-url",
                data: messageData,
            });

            GameEventManager.handleMessage(messageEvent);

            // Assert
            expect(consoleSpy).toHaveBeenCalled();
            expect(mockHandler).not.toHaveBeenCalled();

            // Cleanup
            consoleSpy.mockRestore();
        });
    });
});
