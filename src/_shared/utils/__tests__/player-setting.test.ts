import { StorageManager } from '../storage-manager';
import { getPlayerSetting, storePlayerSetting, PlayerSetting } from '../player-setting';

// Mock StorageManager
jest.mock('../storage-manager', () => ({
    StorageManager: {
        get: jest.fn(),
        set: jest.fn(),
    },
}));

describe('Player Setting', () => {
    beforeEach(() => {
        // Clear all mocks before each test
        jest.clearAllMocks();
    });

    describe('getPlayerSetting', () => {
        it('should return stored player settings when they exist', () => {
            const mockSettings: PlayerSetting = {
                musicEnable: true,
                sfxEnable: false,
                isUserGesture: true,
            };

            (StorageManager.get as jest.Mock).mockReturnValue(mockSettings);

            const result = getPlayerSetting();

            expect(StorageManager.get).toHaveBeenCalledWith('player_settings');
            expect(result).toEqual(mockSettings);
        });

        it('should return empty object when no settings exist', () => {
            (StorageManager.get as jest.Mock).mockReturnValue(null);

            const result = getPlayerSetting();

            expect(StorageManager.get).toHaveBeenCalledWith('player_settings');
            expect(result).toEqual({});
        });
    });

    describe('storePlayerSetting', () => {
        it('should merge new settings with existing settings', () => {
            const existingSettings: PlayerSetting = {
                musicEnable: true,
                sfxEnable: true,
                isUserGesture: false,
            };

            const newSettings = {
                musicEnable: false,
            };

            const expectedSettings = {
                ...existingSettings,
                ...newSettings,
            };

            (StorageManager.get as jest.Mock).mockReturnValue(existingSettings);

            storePlayerSetting(newSettings);

            expect(StorageManager.get).toHaveBeenCalledWith('player_settings');
            expect(StorageManager.set).toHaveBeenCalledWith('player_settings', expectedSettings);
        });

        it('should create new settings when no existing settings', () => {
            const newSettings = {
                musicEnable: true,
                sfxEnable: false,
            };

            (StorageManager.get as jest.Mock).mockReturnValue(null);

            storePlayerSetting(newSettings);

            expect(StorageManager.get).toHaveBeenCalledWith('player_settings');
            expect(StorageManager.set).toHaveBeenCalledWith('player_settings', newSettings);
        });

        it('should handle empty object as new settings', () => {
            const existingSettings: PlayerSetting = {
                musicEnable: true,
                sfxEnable: true,
                isUserGesture: false,
            };

            (StorageManager.get as jest.Mock).mockReturnValue(existingSettings);

            storePlayerSetting({});

            expect(StorageManager.get).toHaveBeenCalledWith('player_settings');
            expect(StorageManager.set).toHaveBeenCalledWith('player_settings', existingSettings);
        });

        it('should handle null as new settings', () => {
            const existingSettings: PlayerSetting = {
                musicEnable: true,
                sfxEnable: true,
                isUserGesture: false,
            };

            (StorageManager.get as jest.Mock).mockReturnValue(existingSettings);

            storePlayerSetting(null);

            expect(StorageManager.get).toHaveBeenCalledWith('player_settings');
            expect(StorageManager.set).toHaveBeenCalledWith('player_settings', existingSettings);
        });
    });
}); 