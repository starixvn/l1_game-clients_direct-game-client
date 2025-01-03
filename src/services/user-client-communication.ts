import { IUserServiceClient } from "sc-user-service-client/dist";
import { buildUrlWithPath } from "../components/utils/url-helper";

let UserServiceClient;

if (typeof window !== "undefined") {
    const { default: UserServiceClientModule } = require("sc-user-service-client");
    UserServiceClient = UserServiceClientModule;
}

export class UserClientCommunication {
    private static instance: IUserServiceClient | null = null;

    public static getUserClientInstance(): IUserServiceClient | null {
        if (!this.instance) {
            this.instance = typeof window !== "undefined" ? new UserServiceClient(this.getUserServiceUrl()) : null;
        }
        return this.instance;
    }

    private static getUserServiceUrl(): string {
        // TODO: Need to enhance url helper & buildUrlWithPath
        const path = "/user";
        return buildUrlWithPath(path);
    }
}
export default UserClientCommunication;
