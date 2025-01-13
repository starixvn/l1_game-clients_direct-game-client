import { StorageManager } from '../storage-manager';
import { getSession, getSessionKey, storeSessionData, clearSessionData, getMicrositeGameId, storeMicrositeGameId, removeMicrositeGameId } from '../session-manager';
import { SSOResponse } from 'sc-user-service-client/dist/auth';

// Mock StorageManager
jest.mock('../storage-manager', () => ({
    StorageManager: {
        get: jest.fn(),
        set: jest.fn(),
        remove: jest.fn(),
    },
}));

describe('Session Manager', () => {
    const mockHostname = 'test.example.com';
    const sessionIdStorageName = 'scss';
    const mockStorageKey = `${mockHostname}.${sessionIdStorageName}`;
    const micrositeGameIdKey = 'microsite_game_id';

    beforeEach(() => {
        // Reset all mocks before each test
        jest.clearAllMocks();

        // Mock window.location
        Object.defineProperty(window, 'location', {
            value: {
                hostname: mockHostname,
            },
            writable: true,
        });
    });

    describe('getSessionKey', () => {
        it('should return session key with hostname when window.location.hostname exists', () => {
            expect(getSessionKey()).toBe(mockStorageKey);
        });

        it('should return default session key when window.location.hostname is undefined', () => {
            Object.defineProperty(window, 'location', {
                value: {
                    hostname: undefined,
                },
                writable: true,
            });
            expect(getSessionKey()).toBe(sessionIdStorageName);
        });
    });

    describe('getSession', () => {
        it('should return session data when exists in storage', () => {
            const mockSession = {
                time: new Date(),
                token: 'test-token',
            };
            (StorageManager.get as jest.Mock).mockReturnValue(mockSession);

            const result = getSession();
            expect(StorageManager.get).toHaveBeenCalledWith(mockStorageKey);
            expect(result).toEqual(mockSession);
        });

        it('should return empty object when no session exists', () => {
            (StorageManager.get as jest.Mock).mockReturnValue(null);

            const result = getSession();
            expect(StorageManager.get).toHaveBeenCalledWith(mockStorageKey);
            expect(result).toEqual({});
        });
    });

    describe('storeSessionData', () => {
        it('should store session data correctly', () => {
            const mockData = { token: 'test-token' };
            storeSessionData(mockData);

            expect(StorageManager.set).toHaveBeenCalledWith(mockStorageKey, mockData);
        });
    });

    describe('clearSessionData', () => {
        it('should clear session data correctly', () => {
            clearSessionData();

            expect(StorageManager.remove).toHaveBeenCalledWith(mockStorageKey);
        });
    });

    describe('getMicrositeGameId', () => {
        it('should return microsite game id when exists', () => {
            const mockGameId = 123;
            (StorageManager.get as jest.Mock).mockReturnValue(mockGameId);

            const result = getMicrositeGameId();
            expect(StorageManager.get).toHaveBeenCalledWith(micrositeGameIdKey);
            expect(result).toBe(mockGameId);
        });

        it('should return 0 when no microsite game id exists', () => {
            (StorageManager.get as jest.Mock).mockReturnValue(null);

            const result = getMicrositeGameId();
            expect(StorageManager.get).toHaveBeenCalledWith(micrositeGameIdKey);
            expect(result).toBe(0);
        });
    });

    describe('storeMicrositeGameId', () => {
        it('should store microsite game id correctly', () => {
            const mockGameId = 123;
            storeMicrositeGameId(mockGameId);

            expect(StorageManager.set).toHaveBeenCalledWith(micrositeGameIdKey, mockGameId);
        });
    });

    describe('removeMicrositeGameId', () => {
        it('should remove microsite game id correctly', () => {
            removeMicrositeGameId();

            expect(StorageManager.remove).toHaveBeenCalledWith(micrositeGameIdKey);
        });
    });
}); 