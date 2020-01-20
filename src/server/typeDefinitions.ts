import { IUser } from "./models/user";

// Extend the cookie to include the user
declare global {
    namespace Express {
        // tslint:disable-next-line: interface-name
        interface Session {
            user?: IUser;
        }
    }
}
