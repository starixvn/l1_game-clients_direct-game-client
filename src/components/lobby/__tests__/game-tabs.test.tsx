import React from "react";
import { render, screen, fireEvent, act } from "@testing-library/react";
import "@testing-library/jest-dom";
import { GameTabs } from "../game-tabs";
import { StorageManager } from "../../../_shared/utils";
import * as translatorHook from "../../../_shared/react-hooks/use-translator";

// Mock dependencies
jest.mock("../../../_shared/utils", () => ({
    StorageManager: {
        get: jest.fn(),
        set: jest.fn(),
    },
    getGameUrl: jest.fn((gameId) => `game-url/${gameId}`),
    getBaseGameUrl: jest.fn((gameId) => `base-url/${gameId}/`),
    localStorageKeys: {
        selectedGameId: "selectedGameId",
    },
}));

jest.mock("../game-frame", () => ({
    GameFrame: jest.fn(() => <div data-testid="game-frame" />),
}));

const mockTranslate = jest.fn((key) => `translated-${key}`);
jest.spyOn(translatorHook, "useTranslator").mockImplementation(() => ({
    t: mockTranslate,
    i18n: {} as any,
}));

describe("GameTabs", () => {
    const defaultProps = {
        gameOfferIds: [1, 2, 3],
        availableGameId: 1,
        tabHeight: 100,
    };

    beforeEach(() => {
        jest.clearAllMocks();
    });

    it("should render all game tabs", async () => {
        await act(async () => {
            render(<GameTabs {...defaultProps} />);
        });

        defaultProps.gameOfferIds.forEach((gameId) => {
            expect(screen.getByText(`translated-gameNames.${gameId}`)).toBeInTheDocument();
            expect(screen.getByAltText(`translated-gameNames.${gameId}`)).toHaveAttribute(
                "src",
                `base-url/${gameId}/remote/icon/icon-game-tab.png`
            );
        });
    });

    it("should initialize with stored game ID if available", async () => {
        const storedGameId = 2;
        (StorageManager.get as jest.Mock).mockReturnValue(storedGameId);

        await act(async () => {
            render(<GameTabs {...defaultProps} />);
        });

        expect(StorageManager.set).toHaveBeenCalledWith("selectedGameId", storedGameId);
        expect(screen.getByTestId("game-frame")).toBeInTheDocument();
    });

    it("should initialize with available game ID if no stored game ID", async () => {
        (StorageManager.get as jest.Mock).mockReturnValue(undefined);

        await act(async () => {
            render(<GameTabs {...defaultProps} />);
        });

        expect(StorageManager.set).toHaveBeenCalledWith("selectedGameId", defaultProps.availableGameId);
    });

    it("should initialize with first game ID if no stored or available game ID", async () => {
        (StorageManager.get as jest.Mock).mockReturnValue(undefined);

        await act(async () => {
            render(<GameTabs {...{ ...defaultProps, availableGameId: undefined }} />);
        });

        expect(StorageManager.set).toHaveBeenCalledWith("selectedGameId", defaultProps.gameOfferIds[0]);
    });

    it("should handle tab selection", async () => {
        await act(async () => {
            render(<GameTabs {...defaultProps} />);
        });

        await act(async () => {
            fireEvent.click(screen.getByText(`translated-gameNames.${defaultProps.gameOfferIds[1]}`));
        });

        expect(StorageManager.set).toHaveBeenCalledWith(
            "selectedGameId",
            defaultProps.gameOfferIds[1]
        );
    });

    it("should not use stored game ID if it's not in gameOfferIds", async () => {
        (StorageManager.get as jest.Mock).mockReturnValue(999);

        await act(async () => {
            render(<GameTabs {...defaultProps} />);
        });

        expect(StorageManager.set).toHaveBeenCalledWith("selectedGameId", defaultProps.availableGameId);
    });

    it("should render empty when no game offers", async () => {
        await act(async () => {
            render(<GameTabs gameOfferIds={[]} availableGameId={undefined} tabHeight={100} />);
        });

        expect(screen.queryByTestId("game-frame")).not.toBeInTheDocument();
    });

    it("should apply active class to selected tab", async () => {
        await act(async () => {
            render(<GameTabs {...defaultProps} />);
        });

        const firstTabTitle = screen.getByText(`translated-gameNames.${defaultProps.gameOfferIds[0]}`).parentElement;
        expect(firstTabTitle).toHaveClass("nav-link active");

        const secondTabTitle = screen.getByText(`translated-gameNames.${defaultProps.gameOfferIds[1]}`).parentElement;
        expect(secondTabTitle).toHaveClass("nav-link");
    });
});
