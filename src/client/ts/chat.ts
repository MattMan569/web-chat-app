require("./common");
import Handlebars from "handlebars";
import $ from "jquery";
import socketio from "socket.io-client";
import { ISocketIOMessage } from "./../../types/types";

console.log("chat");

const socket = socketio();

const formControls = $("#form-controls");
const messageField = $("#message-field");

const template = $("#message-item-template").html();
const render = Handlebars.compile(template);
const messageList = $("#message-list");

$("#message-form").submit((e) => {
    e.preventDefault();
    formControls.attr("disabled", "disabled");
    const message: ISocketIOMessage = {
        message: messageField.val() as string,
        createdAt: new Date(),
        sender: "TODO", // TODO
    };

    socket.emit("sendMessage", message, () => {
        formControls.removeAttr("disabled");
        messageField.val("");
        messageField.focus();
    });
});

socket.on("message", (message: ISocketIOMessage) => {
    console.log(message);
    const messageElement = render(message);
    console.log(messageElement);
    messageList.append(messageElement);
});

socket.emit("join");
