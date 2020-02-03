require("./common");
import Handlebars from "handlebars";
import $ from "jquery";
import socketio from "socket.io-client";
import { ISocketIOMessage } from "./../../types/types";

const socket = socketio("/chat");

const messageForm = $("#message-form");
const formControls = $("#form-controls");
const messageField = $("#message-field");

const template = $("#message-item-template").html();
const render = Handlebars.compile(template);
const messageList = $("#message-list");

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

messageForm.keypress((e) => {
    if (e.which === 13 && !e.shiftKey) {
        messageForm.submit();
    }
});

socket.on("message", (message: ISocketIOMessage) => {
    messageList.append(render(message));
});

socket.emit("join");
