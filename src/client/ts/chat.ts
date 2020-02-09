require("./common");
import Handlebars from "handlebars";
import $ from "jquery";
import socketio from "socket.io-client";
import { IRoom } from "./../../server/models/room";
import { IUser } from "./../../server/models/user";
import { IRoomUser } from "./../../server/socketIO/routes/chat";
import { ISocketIOMessage } from "./../../types/types";

// TODO move helpers file for both server and client
Handlebars.registerHelper("ifeq", function(this: any, a, b, options) {
    // tslint:disable-next-line: triple-equals
    if (a == b) {
        return options.fn(this);
    }
    return options.inverse(this);
});

Handlebars.registerHelper("ifnoteq", function(this: any, a, b, options) {
    // tslint:disable-next-line: triple-equals
    if (a != b) {
        return options.fn(this);
    }
    return options.inverse(this);
});

const socket = socketio("/chat");
let client: IUser;

// Form elements
const messageForm = $("#message-form");
const formControls = $("#form-controls");
const messageField = $("#message-field");

// Message elements
const messageTemplate = $("#message-item-template").html();
const renderMessage = Handlebars.compile(messageTemplate);
const messageList = $("#message-list");

// User list elements
const userTemplate = $("#user-item-template").html();
const renderUser = Handlebars.compile(userTemplate);
const userList = $("#user-list");

// Send a message
messageForm.submit((e) => {
    e.preventDefault();
    formControls.attr("disabled", "disabled");
    const message = messageField.val() as string;

    socket.emit("sendMessage", message, () => {
        formControls.removeAttr("disabled");
        messageField.val("");
        messageField.focus();
    });
});

// Kick the specified user
userList.on("click", ".kick", function(this: HTMLButtonElement) {
    const socketId = this.closest("article").id;
    socket.emit("kick", socketId);
});

// Send messages on enter key press
messageForm.keypress((e) => {
    if (e.which === 13 && !e.shiftKey) {
        messageForm.submit();
    }
});

// A message has been received
socket.on("message", (message: ISocketIOMessage) => {
    messageList.append(renderMessage(message));
});

// The list of users in the room has changed
socket.on("userListUpdate", (room: IRoom[]) => {
    userList[0].innerHTML = renderUser({ room, client });
});

// Get our user information from the server
socket.on("userData", (userData: IUser) => {
    client = userData;
});

socket.emit("join");
