import UserClientCommunication from "sc-user-service-client/dist/user-client-communication";
import * as authService from "../auth-service";
import * as utils from "../../utils";
import NameGenerator from "../../utils/name-generator";
import { errorCodes } from "../../consts";

jest.mock("sc-user-service-client/dist/user-client-communication", () => ({
    getUserClientInstance: jest.fn().mockReturnValue({
        auth: {
            sso: jest.fn(),
            verifySession: jest.fn(),
            reCheckIn: jest.fn(),
            signName: jest.fn(),
            authorize: jest.fn(),
        },
    }),
}));
jest.mock("../../utils");
jest.mock("../../utils/name-generator");

describe("authService", () => {
    const mockUserSession: any = {
        isAuthenticated: true,
        ss: "session-token",
        username: "test-user",
        isUM: false,
        umInfo: null,
    };
    const mockAuthClient = UserClientCommunication?.getUserClientInstance("http://test-url")?.auth;

    beforeEach(() => {
        jest.clearAllMocks();
        (utils.getBaseServiceUrl as jest.Mock).mockReturnValue("http://test-url");
    });

    describe("sso", () => {
        it("should successfully authenticate and store session data", async () => {
            // Arrange
            const token = "test-token";
            const appType = 1;
            (mockAuthClient.sso as jest.Mock).mockResolvedValue(mockUserSession);

            // Act
            const result = await authService.sso(token, appType);

            // Assert
            expect(mockAuthClient.sso).toHaveBeenCalledWith(token, appType);
            expect(utils.storeSessionData).toHaveBeenCalledWith(mockUserSession);
            expect(result).toBe(mockUserSession);
        });

        it("should not store session data when authentication fails", async () => {
            // Arrange
            const failedSession = { ...mockUserSession, isAuthenticated: false };
            (mockAuthClient.sso as jest.Mock).mockResolvedValue(failedSession);

            // Act
            const result = await authService.sso("token", 1);

            // Assert
            expect(utils.storeSessionData).not.toHaveBeenCalled();
            expect(result).toBe(failedSession);
        });
    });

    describe("verifySession", () => {
        it("should return null when no session exists", async () => {
            // Arrange
            (utils.getSession as jest.Mock).mockReturnValue(null);

            // Act
            const result = await authService.verifySession();

            // Assert
            expect(result).toBeNull();
            expect(mockAuthClient.verifySession).not.toHaveBeenCalled();
        });

        it("should successfully verify and update session", async () => {
            // Arrange
            (utils.getSession as jest.Mock).mockReturnValue(mockUserSession);
            const verifyResponse = {
                isSuccessful: true,
                isUM: true,
                umInfo: { someInfo: "test" },
            };
            (mockAuthClient.verifySession as jest.Mock).mockResolvedValue(verifyResponse);

            // Act
            const result = await authService.verifySession();

            // Assert
            expect(mockAuthClient.verifySession).toHaveBeenCalledWith(mockUserSession.ss, mockUserSession.username);
            expect(utils.storeSessionData).toHaveBeenCalled();
            expect(result).toEqual(
                expect.objectContaining({
                    isUM: true,
                    umInfo: { someInfo: "test" },
                })
            );
        });
    });

    describe("autoCreateNickname", () => {
        it("should successfully create nickname on first attempt", async () => {
            // Arrange
            const mockNickname = "test-nickname";
            (NameGenerator.generateName as jest.Mock).mockReturnValue(mockNickname);
            (mockAuthClient.signName as jest.Mock).mockResolvedValue({ errorCode: null });

            // Act
            const result = await authService.autoCreateNickname(mockUserSession);

            // Assert
            expect(mockAuthClient.signName).toHaveBeenCalledTimes(1);
            expect(mockAuthClient.signName).toHaveBeenCalledWith(
                mockUserSession.ss,
                mockUserSession.username,
                mockNickname,
                expect.any(Number)
            );
            expect(result.errorCode).toBeNull();
        });

        it("should retry up to 3 times when nickname exists", async () => {
            // Arrange
            const mockNickname = "test-nickname";
            (NameGenerator.generateName as jest.Mock).mockReturnValue(mockNickname);
            (mockAuthClient.signName as jest.Mock)
                .mockResolvedValueOnce({ errorCode: errorCodes.NICKNAME_EXISTS })
                .mockResolvedValueOnce({ errorCode: errorCodes.NICKNAME_EXISTS })
                .mockResolvedValueOnce({ errorCode: null });

            // Act
            const result = await authService.autoCreateNickname(mockUserSession);

            // Assert
            expect(mockAuthClient.signName).toHaveBeenCalledTimes(3);
            expect(result.errorCode).toBeNull();
        });
    });

    describe("reCheckIn", () => {
        it("should successfully recheck in user", async () => {
            // Arrange
            const expectedResponse = { success: true };
            (mockAuthClient.reCheckIn as jest.Mock).mockResolvedValue(expectedResponse);

            // Act
            const result = await authService.reCheckIn(mockUserSession);

            // Assert
            expect(mockAuthClient.reCheckIn).toHaveBeenCalledWith(mockUserSession.ss, mockUserSession.username);
            expect(result).toBe(expectedResponse);
        });
    });

    describe("createNickname", () => {
        it("should successfully create nickname", async () => {
            // Arrange
            const nickname = "test-nickname";
            const avatarId = 1;
            const expectedResponse = { success: true };
            (mockAuthClient.signName as jest.Mock).mockResolvedValue(expectedResponse);

            // Act
            const result = await authService.createNickname(mockUserSession, nickname, avatarId);

            // Assert
            expect(mockAuthClient.signName).toHaveBeenCalledWith(mockUserSession.ss, mockUserSession.username, nickname, avatarId);
            expect(result).toBe(expectedResponse);
        });
    });

    describe("authorize", () => {
        it("should successfully authorize user", async () => {
            // Arrange
            const expectedResponse = { success: true };
            (mockAuthClient.authorize as jest.Mock).mockResolvedValue(expectedResponse);

            // Act
            const result = await authService.authorize(mockUserSession);

            // Assert
            expect(mockAuthClient.authorize).toHaveBeenCalledWith(mockUserSession.ss, mockUserSession.username);
            expect(result).toBe(expectedResponse);
        });
    });
});
