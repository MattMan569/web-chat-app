import { IUser } from "../server/models/user";

// TODO move all types here

// Extend the cookie to include the user
declare global {
    namespace Express {
        // tslint:disable-next-line: interface-name
        interface Session {
            user: IUser;
            authorizedRooms: string[];
        }
    }
}

// Socket.io message format
export interface ISocketIOMessage {
    sender: string;
    message: string;
    createdAt: Array<string>;
}
