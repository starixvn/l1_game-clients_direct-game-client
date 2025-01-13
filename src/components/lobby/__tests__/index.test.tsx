import React from 'react';
import { render, screen, act, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import Lobby from '../index';
import * as urlHelper from '../../../_shared/utils';
import * as gameSettings from '../../../_shared/utils/game-setting';
import { GameEventManager } from '../../../_shared/utils/game-event-manager';
import * as useAuthHook from '../../../_shared/react-hooks/use-authorization';
import { localStorageKeys } from '../../../_shared/utils';

// Mock appSettings
jest.mock('../../../_shared/game-setting', () => ({
    appSettings: {
        gameDomain: 'https://test-domain.com',
        system: 'test-system',
        ssl: true,
        env: 'test',
        sentry: {
            dsn: 'test-dsn',
            environment: 'test'
        }
    }
}));

// Mock all lazy-loaded components
jest.mock('../../common/timeout', () => ({
    __esModule: true,
    default: () => <div data-testid="session-timeout">Session Timeout</div>
}));

jest.mock('../../common/um', () => ({
    __esModule: true,
    default: ({ umInfo }: { umInfo: any }) => <div data-testid="um-page">{umInfo?.message}</div>
}));

jest.mock('../../common/non-offer', () => ({
    __esModule: true,
    default: () => <div data-testid="non-offer">Non Offer Page</div>
}));

jest.mock('../game-tabs', () => ({
    GameTabs: ({ gameOfferIds }: { gameOfferIds: number[] }) => (
        <div data-testid="game-tabs">Game Tabs: {gameOfferIds.join(',')}</div>
    )
}));

jest.mock('../../common/loading', () => ({
    __esModule: true,
    default: () => <div data-testid="loading">Loading...</div>
}));

jest.mock('../../common/landscape-mode', () => ({
    __esModule: true,
    default: () => <div data-testid="landscape-mode">Landscape Mode</div>
}));

// Mock the storage manager and utils
const mockStorageSet = jest.fn();
jest.mock('../../../_shared/utils', () => {
    const actual = jest.requireActual('../../../_shared/utils');
    return {
        ...actual,
        StorageManager: {
            set: (...args: any[]) => mockStorageSet(...args)
        },
        getQueryParameters: jest.fn(),
        localStorageKeys: {
            ...actual.localStorageKeys,
            operator: 'operator'
        }
    };
});

// Mock GameEventManager
const mockSubscribe = jest.fn();
const mockUnsubscribe = jest.fn();
jest.mock('../../../_shared/utils/game-event-manager', () => ({
    GameEventManager: {
        getInstance: () => ({
            subscribe: mockSubscribe,
            unsubscribe: mockUnsubscribe
        })
    },
    GameEvents: {
        sessionTimeout: 'sessionTimeout',
        isUnderMaintain: 'isUnderMaintain',
        isNotPermittedToPlay: 'isNotPermittedToPlay'
    }
}));

describe('Lobby Component', () => {
    const mockGetQueryParameters = urlHelper.getQueryParameters as jest.Mock;
    const mockGetOfferedGameIds = jest.spyOn(gameSettings, 'getOfferedGameIds');
    const mockUseAuthorization = jest.spyOn(useAuthHook, 'useAuthorization');

    beforeEach(() => {
        jest.clearAllMocks();
        mockGetQueryParameters.mockReturnValue({
            token: 'test-token',
            appType: '1',
            lang: 'en',
            operator: 'test-operator'
        });

        // Initialize default mock implementations
        mockUseAuthorization.mockImplementation((token, appType, lang) => ({
            isLoading: false,
            umInfo: null,
            setUMInfo: jest.fn(),
            isSessionTimeout: false,
            initialize: jest.fn().mockResolvedValue({ authorized: true })
        }));

        mockGetOfferedGameIds.mockReturnValue([]);
    });

    afterEach(() => {
        jest.resetAllMocks();
    });

    it('should render loading state initially', () => {
        mockUseAuthorization.mockReturnValue({
            isLoading: true,
            umInfo: null,
            setUMInfo: jest.fn(),
            isSessionTimeout: false,
            initialize: jest.fn()
        });

        render(<Lobby />);
        expect(screen.getByTestId('loading')).toBeInTheDocument();
    });

    it('should render session timeout page when session times out', async () => {
        mockUseAuthorization.mockReturnValue({
            isLoading: false,
            umInfo: null,
            setUMInfo: jest.fn(),
            isSessionTimeout: true,
            initialize: jest.fn().mockResolvedValue(null)
        });

        render(<Lobby />);
        await waitFor(() => {
            expect(screen.getByTestId('session-timeout')).toBeInTheDocument();
        });
    });

    it('should render UM page when under maintenance', async () => {
        const umInfo = {
            message: 'Under Maintenance',
            startTime: new Date(),
            endTime: new Date(),
            operatorId: 'test-operator',
            severity: 1
        };
        mockUseAuthorization.mockReturnValue({
            isLoading: false,
            umInfo,
            setUMInfo: jest.fn(),
            isSessionTimeout: false,
            initialize: jest.fn().mockResolvedValue(null)
        });

        render(<Lobby />);
        await waitFor(() => {
            expect(screen.getByTestId('um-page')).toBeInTheDocument();
            expect(screen.getByText('Under Maintenance')).toBeInTheDocument();
        });
    });

    it('should render non-offer page when no game offers available', async () => {
        mockUseAuthorization.mockReturnValue({
            isLoading: false,
            umInfo: null,
            setUMInfo: jest.fn(),
            isSessionTimeout: false,
            initialize: jest.fn().mockResolvedValue({ authorized: true })
        });
        mockGetOfferedGameIds.mockReturnValue([]);

        render(<Lobby />);
        await waitFor(() => {
            expect(screen.getByTestId('non-offer')).toBeInTheDocument();
        });
    });

    it('should render game tabs with offered games', async () => {
        const mockInitialize = jest.fn().mockResolvedValue({ authorized: true });
        mockUseAuthorization.mockReturnValue({
            isLoading: false,
            umInfo: null,
            setUMInfo: jest.fn(),
            isSessionTimeout: false,
            initialize: mockInitialize
        });
        mockGetOfferedGameIds.mockReturnValue([1, 2, 3]);

        render(<Lobby />);

        await waitFor(() => {
            expect(screen.getByTestId('game-tabs')).toBeInTheDocument();
            expect(screen.getByText('Game Tabs: 1,2,3')).toBeInTheDocument();
        });
    });

    it('should handle game events correctly', async () => {
        const setUMInfo = jest.fn();
        const mockInitialize = jest.fn().mockResolvedValue({ authorized: true });
        mockUseAuthorization.mockReturnValue({
            isLoading: false,
            umInfo: null,
            setUMInfo,
            isSessionTimeout: false,
            initialize: mockInitialize
        });

        render(<Lobby />);

        // Simulate event subscriptions
        const subscriptionCalls = mockSubscribe.mock.calls;
        expect(subscriptionCalls).toHaveLength(3);

        // Test session timeout event
        const sessionTimeoutHandler = subscriptionCalls.find(
            call => call[0] === 'sessionTimeout'
        )[1];
        act(() => {
            sessionTimeoutHandler();
        });
        await waitFor(() => {
            expect(screen.getByTestId('session-timeout')).toBeInTheDocument();
        });

        // Test under maintenance event
        const umHandler = subscriptionCalls.find(
            call => call[0] === 'isUnderMaintain'
        )[1];
        act(() => {
            umHandler({
                umInfo: {
                    message: 'Test UM',
                    startTime: new Date(),
                    endTime: new Date(),
                    operatorId: 'test-operator',
                    severity: 1
                }
            });
        });
        expect(setUMInfo).toHaveBeenCalledWith({
            message: 'Test UM',
            startTime: expect.any(Date),
            endTime: expect.any(Date),
            operatorId: 'test-operator',
            severity: 1
        });

        // Test not permitted to play event
        const notPermittedHandler = subscriptionCalls.find(
            call => call[0] === 'isNotPermittedToPlay'
        )[1];
        act(() => {
            notPermittedHandler({ isNotPermittedToPlay: true });
        });
        expect(mockInitialize).toHaveBeenCalled();
    });

    it('should store operator in localStorage when provided', async () => {
        const mockInitialize = jest.fn().mockResolvedValue({ authorized: true });
        mockUseAuthorization.mockReturnValue({
            isLoading: false,
            umInfo: null,
            setUMInfo: jest.fn(),
            isSessionTimeout: false,
            initialize: mockInitialize
        });

        render(<Lobby />);

        await waitFor(() => {
            expect(mockStorageSet).toHaveBeenCalledWith('operator', 'test-operator');
        });
    });

    it('should cleanup event subscriptions on unmount', () => {
        const { unmount } = render(<Lobby />);
        unmount();
        expect(mockUnsubscribe).toHaveBeenCalledTimes(3);
    });
}); 