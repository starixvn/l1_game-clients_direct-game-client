import React from 'react';
import { render, screen, fireEvent, act } from '@testing-library/react';
import '@testing-library/jest-dom';
import { jest } from '@jest/globals';
import { GameTabs } from '../game-tabs';
import { GameEventManager, GameEvents } from '../../../_shared/utils/game-event-manager';
import * as PlayerSetting from '../../../_shared/utils/player-setting';
import * as FunctionUtil from '../../../_shared/utils/function-util';
import * as GameUrl from '../../../_shared/utils';

type CopyTextFunction = (text: string) => Promise<boolean>;
type EventHandler = (data: { copyToClipboard: string }) => Promise<void>;

// Mock dependencies
const mockSubscribe = jest.fn();
const mockUnsubscribe = jest.fn();
const mockGetInstance = jest.fn(() => ({
    subscribe: mockSubscribe,
    unsubscribe: mockUnsubscribe,
}));

jest.mock('../../../_shared/utils/game-event-manager', () => ({
    GameEvents: {
        musicEnable: 'musicEnable',
        sfxEnable: 'sfxEnable',
        isUserGesture: 'isUserGesture',
        copyToClipboard: 'copyToClipboard',
    },
    GameEventManager: {
        getInstance: () => mockGetInstance(),
    },
}));
jest.mock('../../../_shared/utils/player-setting');
jest.mock('../../../_shared/utils/function-util', () => ({
    __esModule: true,
    default: {
        copyText: jest.fn<CopyTextFunction>()
    }
}));
jest.mock('../../../_shared/utils');
jest.mock('../../../_shared/react-hooks/use-translator', () => ({
    useTranslator: () => ({
        t: (key: string) => key,
    }),
}));

describe('GameTabs Component', () => {
    const mockGameOfferIds = [1, 2, 3];
    const mockGameUrl = 'http://example.com/game/1';
    let mockPostMessage: jest.Mock;

    beforeEach(() => {
        jest.clearAllMocks();
        (GameUrl.getGameUrl as jest.Mock).mockReturnValue(mockGameUrl);
        mockPostMessage = jest.fn();
        // Mock iframe contentWindow
        Object.defineProperty(HTMLIFrameElement.prototype, 'contentWindow', {
            value: { postMessage: mockPostMessage },
            writable: true
        });
    });

    it('should render game tabs with correct number of tabs', () => {
        render(<GameTabs gameOfferIds={mockGameOfferIds} />);
        const tabs = screen.getAllByRole('tab');
        expect(tabs).toHaveLength(mockGameOfferIds.length);
    });

    it('should render game icons and names in tabs', () => {
        render(<GameTabs gameOfferIds={mockGameOfferIds} />);
        mockGameOfferIds.forEach(gameId => {
            expect(screen.getByAltText(`gameNames.${gameId}`)).toBeInTheDocument();
            expect(screen.getByText(`gameNames.${gameId}`)).toBeInTheDocument();
        });
    });

    it('should switch tabs and update iframe source when clicking different tabs', () => {
        render(<GameTabs gameOfferIds={mockGameOfferIds} />);

        // Click second tab
        fireEvent.click(screen.getAllByRole('tab')[1]);
        expect(GameUrl.getGameUrl).toHaveBeenCalledWith(mockGameOfferIds[1]);

        // Click third tab
        fireEvent.click(screen.getAllByRole('tab')[2]);
        expect(GameUrl.getGameUrl).toHaveBeenCalledWith(mockGameOfferIds[2]);
    });

    it('should handle copy to clipboard events', async () => {
        const mockCopyText = 'test text';
        (FunctionUtil.default.copyText as jest.Mock<CopyTextFunction>).mockResolvedValueOnce(true);

        render(<GameTabs gameOfferIds={mockGameOfferIds} />);

        // Get the copyToClipboard event handler
        const copyHandler = mockSubscribe.mock.calls.find(
            call => call[0] === GameEvents.copyToClipboard
        )[1] as EventHandler;

        // Simulate copyToClipboard event
        await act(async () => {
            await copyHandler({ copyToClipboard: mockCopyText });
        });

        expect(FunctionUtil.default.copyText).toHaveBeenCalledWith(mockCopyText);
        expect(mockPostMessage).toHaveBeenCalledWith({ copySuccessfully: true }, mockGameUrl);
    });

    it('should subscribe to game events on mount and unsubscribe on unmount', () => {
        const { unmount } = render(<GameTabs gameOfferIds={mockGameOfferIds} />);

        // In React 18 Strict Mode, effects run twice, so we expect 4 subscriptions
        expect(mockSubscribe).toHaveBeenCalledWith(GameEvents.musicEnable, PlayerSetting.storePlayerSetting);
        expect(mockSubscribe).toHaveBeenCalledWith(GameEvents.sfxEnable, PlayerSetting.storePlayerSetting);
        expect(mockSubscribe).toHaveBeenCalledWith(GameEvents.isUserGesture, PlayerSetting.storePlayerSetting);
        expect(mockSubscribe).toHaveBeenCalledWith(GameEvents.copyToClipboard, expect.any(Function));

        unmount();

        // In React 18 Strict Mode, cleanup runs twice, so we expect 8 unsubscribe calls
        expect(mockUnsubscribe).toHaveBeenCalledTimes(8);
    });

    it('should set initial iframe source on mount', () => {
        render(<GameTabs gameOfferIds={mockGameOfferIds} />);
        expect(GameUrl.getGameUrl).toHaveBeenCalledWith(mockGameOfferIds[0]);
        const iframe = screen.getByTitle(`Game ${mockGameOfferIds[0]}`);
        expect(iframe).toHaveAttribute('src', mockGameUrl);
    });

    it('should handle empty gameOfferIds array', () => {
        render(<GameTabs gameOfferIds={[]} />);
        expect(screen.queryByRole('tab')).not.toBeInTheDocument();
    });
}); 