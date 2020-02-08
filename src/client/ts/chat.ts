require("./common");
import Handlebars from "handlebars";
import $ from "jquery";
import socketio from "socket.io-client";
import { IUser } from "./../../server/models/user";
import { IRoomUser } from "./../../server/socketIO/routes/chat";
import { ISocketIOMessage } from "./../../types/types";

const socket = socketio("/chat");

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

// Kick
// emit disconnect message with socket id from user el's id data attribute

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

userList.on("click", ".kick", function(this: HTMLButtonElement) {
    const socketId = this.closest("article").id;
    socket.emit("kick", socketId);
});

messageForm.keypress((e) => {
    if (e.which === 13 && !e.shiftKey) {
        messageForm.submit();
    }
});

socket.on("message", (message: ISocketIOMessage) => {
    messageList.append(renderMessage(message));
});

socket.on("userListUpdate", (roomUserList: IRoomUser[]) => {
    userList[0].innerHTML = renderUser({ roomUserList });
});

socket.emit("join");
