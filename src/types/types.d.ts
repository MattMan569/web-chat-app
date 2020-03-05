import { IUser } from "../server/models/user";

// Modified User object that is placed in the session variable
interface ISessionUser extends IUser {
    avatar: never;
}

// Extend the cookie to include the user
declare global {
    namespace Express {
        // tslint:disable-next-line: interface-name
        interface Session {
            user: ISessionUser;
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

// Typing for jQuery's $.when($.ajax).done
export interface IjQDoneAjax<T> extends Array<T | JQuery.Ajax.SuccessTextStatus | JQuery.jqXHR<any>> {
    0: T;
    1: JQuery.Ajax.SuccessTextStatus;
    2: JQuery.jqXHR<any>;
}
