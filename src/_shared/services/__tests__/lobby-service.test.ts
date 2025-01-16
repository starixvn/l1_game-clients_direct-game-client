import { SSOResponse } from "sc-user-service-client/dist/auth";
import { getLobbyConfigs } from "../lobby-service";
import UserClientCommunication from "sc-user-service-client/dist/user-client-communication";
import { appSettings } from "../../game-setting";

// Mock the external dependencies
jest.mock("sc-user-service-client/dist/user-client-communication");
jest.mock("../../game-setting", () => ({
    appSettings: {
        serviceDomain: "test-domain",
    },
}));

describe("lobby-service", () => {
    // Mock data
    const mockSession: SSOResponse = {
        ss: "test-session",
        username: "test-user",
        isAuthenticated: true,
        language: "en",
        memberName: "Test Member",
        isUM: false,
        umInfo: {
            startTime: new Date(),
            endTime: new Date(),
            operatorId: "",
        },
        system: 0,
    };

    const mockLobbyConfigs = {
        someConfig: "value",
    };

    // Mock implementation of getUserClientInstance
    const mockGetLobbyConfigs = jest.fn();
    const mockLobbyService = {
        getLobbyConfigs: mockGetLobbyConfigs,
    };
    const mockGetUserClientInstance = jest.fn().mockReturnValue({
        lobby: mockLobbyService,
    });

    beforeEach(() => {
        // Reset all mocks before each test
        jest.clearAllMocks();
        (UserClientCommunication.getUserClientInstance as jest.Mock).mockImplementation(mockGetUserClientInstance);
        mockGetLobbyConfigs.mockResolvedValue(mockLobbyConfigs);
    });

    describe("getLobbyConfigs", () => {
        it("should successfully retrieve lobby configs", async () => {
            // Arrange is done in beforeEach

            // Act
            const result = await getLobbyConfigs(mockSession);

            // Assert
            expect(mockGetUserClientInstance).toHaveBeenCalledWith(appSettings.serviceDomain);
            expect(mockGetLobbyConfigs).toHaveBeenCalledWith(mockSession.ss, mockSession.username);
            expect(result).toEqual(mockLobbyConfigs);
        });

        it("should throw error when lobby service is not initialized", async () => {
            // Arrange
            mockGetUserClientInstance.mockReturnValue({ lobby: null });

            // Act & Assert
            await expect(getLobbyConfigs(mockSession)).rejects.toThrow("Lobby service not initialized");
        });

        it("should throw error when UserClientCommunication is undefined", async () => {
            // Arrange
            (UserClientCommunication.getUserClientInstance as jest.Mock).mockReturnValue(null);

            // Act & Assert
            await expect(getLobbyConfigs(mockSession)).rejects.toThrow("Lobby service not initialized");
        });

        it("should handle API errors properly", async () => {
            // Arrange
            const expectedError = new Error("API Error");
            // Reset the mock chain to ensure proper setup
            (UserClientCommunication.getUserClientInstance as jest.Mock).mockReturnValue({ lobby: mockLobbyService });
            mockGetLobbyConfigs.mockRejectedValue(expectedError);

            // Act & Assert
            await expect(getLobbyConfigs(mockSession)).rejects.toThrow(expectedError);
        });
    });
});
