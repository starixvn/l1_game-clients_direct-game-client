import "@testing-library/jest-dom";
import { render, act, screen } from "@testing-library/react";
import axios from "axios";
import { GameEventManager, GameEvents } from "../../../_shared/utils";
import PromotionTournament from "../index";

// Mock dependencies
jest.mock("../../../_shared/game-setting", () => ({
    appSettings: {
        intervalPromotionByMinute: 1,
    },
}));
jest.mock("../../../_shared/utils/url-helper", () => ({
    getExistPromotionTournamentUrl: jest.fn().mockReturnValue("test-url"),
}));
jest.mock("axios");
const mockedAxios = axios as jest.Mocked<typeof axios>;

jest.mock("../promotion-tournament-icon", () => ({
    __esModule: true,
    PromotionTournamentIcon: () => <div data-testid="promotion-tournament-icon">Promotion Tournament Icon</div>,
}));

describe("PromotionTournament", () => {
    beforeEach(() => {
        jest.useFakeTimers();
    });

    afterEach(() => {
        jest.useRealTimers();
        jest.clearAllMocks();
    });

    describe("Periodic checks", () => {
        it("should check for promotions periodically", async () => {
            // Arrange
            mockedAxios.get.mockResolvedValue({ data: { data: true } });

            // Act
            render(<PromotionTournament />);

            // Fast-forward past first interval
            await act(async () => {
                jest.advanceTimersByTime(60 * 1000);
            });

            // Assert
            expect(mockedAxios.get).toHaveBeenCalledTimes(3); // 2 initial calls by Strict mode + 1 interval
        });
    });

    describe("Splash screen handling", () => {
        it("should handle splash screen event correctly", async () => {
            // Arrange
            mockedAxios.get.mockResolvedValue({ data: { data: true } });
            const gameEventManager = GameEventManager.getInstance();

            // Act
            render(<PromotionTournament />);

            act(() => {
                gameEventManager.notify(GameEvents.splashEnabled, {});
            });

            // Assert - Initially loading
            expect(screen.queryByTestId("promotion-tournament-icon")).not.toBeInTheDocument();

            // Act - Fast-forward past loading time
            await act(async () => {
                jest.advanceTimersByTime(20 * 1000);
            });

            // Assert - Should show icon after loading
            expect(screen.queryByTestId("promotion-tournament-icon")).toBeInTheDocument();
        });
    });

    describe("loading event", () => {
        it("should hide icon when loading", async () => {
            // Arrange
            mockedAxios.get.mockResolvedValue({ data: { data: true } });
            const gameEventManager = GameEventManager.getInstance();

            // Act
            render(<PromotionTournament />);
            act(() => {
                gameEventManager.notify(GameEvents.splashEnabled, {});
            });
            await act(async () => {
                jest.advanceTimersByTime(20 * 1000);
            });

            // Assert - Should show icon after loading
            expect(screen.queryByTestId("promotion-tournament-icon")).toBeInTheDocument();

            // Act - loading
            act(() => {
                gameEventManager.notify(GameEvents.loading, true);
            });

            // Assert - Should hide icon after loading
            expect(screen.queryByTestId("promotion-tournament-icon")).not.toBeInTheDocument();
        });
    });

    describe("Cleanup", () => {
        it("should cleanup intervals and event listeners on unmount", () => {
            // Arrange
            const clearIntervalSpy = jest.spyOn(window, "clearInterval");
            const gameEventManager = GameEventManager.getInstance();
            const unsubscribeSpy = jest.spyOn(gameEventManager, "unsubscribe");

            // Act
            const { unmount } = render(<PromotionTournament />);
            unmount();

            // Assert
            expect(clearIntervalSpy).toHaveBeenCalled();
            expect(unsubscribeSpy).toHaveBeenCalled();
        });
    });
});
