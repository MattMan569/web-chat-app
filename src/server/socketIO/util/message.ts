import { ISocketIOMessage } from "./../../../types/types";

export const generateMessage = (message: string): ISocketIOMessage => {
    return {
        message,
        createdAt: new Date(),
        sender: "SERVER",
    };
};
