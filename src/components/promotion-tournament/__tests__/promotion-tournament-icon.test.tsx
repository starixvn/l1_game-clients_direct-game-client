import "@testing-library/jest-dom";
import { render, act, fireEvent } from "@testing-library/react";
import { PromotionTournamentIcon } from "../promotion-tournament-icon";
import { getPromotionTournamentIconUrl } from "../../../_shared/utils/url-helper";
import { deviceInfo } from "../../../_shared/utils/device-detect-wrapper";

// Mock dependencies
jest.mock("../../../_shared/utils/url-helper");
jest.mock("../../../_shared/utils/device-detect-wrapper");

describe("PromotionTournamentIcon", () => {
    const mockGetPromotionTournamentIconUrl = getPromotionTournamentIconUrl as jest.Mock;

    beforeEach(() => {
        jest.useFakeTimers();
        mockGetPromotionTournamentIconUrl.mockReturnValue("mock-url");
        (deviceInfo as jest.Mocked<typeof deviceInfo>).isMobile = false;
    });

    afterEach(() => {
        jest.clearAllMocks();
        jest.useRealTimers();
    });

    describe("Icon Visibility", () => {
        it("should show icon initially", () => {
            // Arrange
            const { container } = render(<PromotionTournamentIcon setIsShowIcon={jest.fn()} />);

            // Act
            // Initial render is sufficient

            // Assert
            expect(container.querySelector("iframe")).toBeInTheDocument();
        });

        it("should hide icon after 15 seconds", () => {
            // Arrange
            const setIsShowIcon = jest.fn();
            render(<PromotionTournamentIcon setIsShowIcon={setIsShowIcon} />);

            // Act
            act(() => {
                jest.advanceTimersByTime(15000);
            });

            // Assert
            expect(setIsShowIcon).toHaveBeenCalledWith(false);
        });
    });

    describe("Position Calculations", () => {
        it("should calculate left position for desktop view", () => {
            // Arrange
            global.innerWidth = 1920;
            global.innerHeight = 1080;
            const { container } = render(<PromotionTournamentIcon tabHeight={100} setIsShowIcon={jest.fn()} />);

            // Act
            act(() => {
                fireEvent.resize(window);
            });

            // Assert
            const iframe = container.querySelector("iframe");
            expect(iframe).toHaveStyle({ "--left-icon": "593.5px" });
        });

        it("should set left position to 0 for mobile view", () => {
            // Arrange
            (deviceInfo as jest.Mocked<typeof deviceInfo>).isMobile = true;
            global.innerWidth = 375;
            global.innerHeight = 667;

            // Act
            const { container } = render(<PromotionTournamentIcon setIsShowIcon={jest.fn()} />);

            // Assert
            const iframe = container.querySelector("iframe");
            expect(iframe).toHaveStyle({ "--left-icon": "0px" });
        });
    });

    describe("Window Resize Handling", () => {
        it("should update position on window resize", () => {
            // Arrange
            global.innerWidth = 1920;
            global.innerHeight = 1080;
            const { container } = render(<PromotionTournamentIcon setIsShowIcon={jest.fn()} />);

            // Act
            global.innerWidth = 1280;
            act(() => {
                fireEvent.resize(window);
            });

            // Assert
            const iframe = container.querySelector("iframe");
            expect(iframe).toHaveStyle({ "--left-icon": "236.5px" });
        });
    });

    describe("Iframe Properties", () => {
        it("should render iframe with correct URL and className", () => {
            // Arrange
            mockGetPromotionTournamentIconUrl.mockReturnValue("test-url");

            // Act
            const { container } = render(<PromotionTournamentIcon setIsShowIcon={jest.fn()} />);

            // Assert
            const iframe = container.querySelector("iframe");
            expect(iframe).toHaveClass("promotion-tournament-icon");
            expect(iframe).toHaveAttribute("src", "test-url");
        });
    });
});
