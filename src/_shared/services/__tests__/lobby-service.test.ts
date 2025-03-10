import { getLobbyConfigs } from "../lobby-service";
import UserClientCommunication from "sc-user-service-client/dist/user-client-communication";

// Mock the external dependencies
jest.mock("sc-user-service-client/dist/user-client-communication", () => ({
    getUserClientInstance: jest.fn().mockReturnValue({
        lobby: {
            getDirectLobbyConfigs: jest.fn(),
        },
    }),
}));
jest.mock("../../utils", () => ({
    getBaseServiceUrl: jest.fn().mockReturnValue("http://test-url"),
}));

describe("Lobby Service", () => {
    const mockGetDirectLobbyConfigs = UserClientCommunication?.getUserClientInstance("http://test-url")?.lobby
        ?.getDirectLobbyConfigs as jest.Mock;
    beforeEach(() => {
        // Arrange - Setup for all tests
        jest.clearAllMocks();
    });

    describe("getLobbyConfigs", () => {
        test("should return lobby configs when API call is successful", async () => {
            // Arrange
            const session = "test-session";
            const username = "test-user";
            const mockConfigs = [{ id: 1, name: "config1" }];
            mockGetDirectLobbyConfigs.mockResolvedValue({ directLobbyConfigs: mockConfigs });

            // Act
            const result = await getLobbyConfigs(session, username);

            // Assert
            expect(result).toEqual(mockConfigs);
            expect(mockGetDirectLobbyConfigs).toHaveBeenCalledWith(session, username);
            expect(mockGetDirectLobbyConfigs).toHaveBeenCalledTimes(1);
        });

        test("should return undefined when API response is empty", async () => {
            // Arrange
            const session = "test-session";
            const username = "test-user";
            mockGetDirectLobbyConfigs.mockResolvedValue(null);

            // Act
            const result = await getLobbyConfigs(session, username);

            // Assert
            expect(result).toBeUndefined();
            expect(mockGetDirectLobbyConfigs).toHaveBeenCalledWith(session, username);
        });
    });
});
