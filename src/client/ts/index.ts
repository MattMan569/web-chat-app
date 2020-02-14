require("./common");
import Handlebars from "handlebars";
import $ from "jquery";
import socketio from "socket.io-client";
import { IRoom } from "./../../server/models/room";

const socket = socketio("/index");

const template = $("#room-item-template").html();
const render = Handlebars.compile(template);

// Send the form then redirect to the created room
$("#create-form").submit(function(e) {
    e.preventDefault();
    const form = $(this);

    $.ajax({
        url: form.attr("action"),
        method: form.attr("method"),
        data: form.serialize(),
        statusCode: {
            200: (res) => {
                // Redirect to room and join
                window.location.href = res;
            },
            400: (res) => {
                // Improper input
                console.log(res);
            },
        },
    });
});

// Get the list of rooms from the server
$.ajax({
    url: "/rooms",
    method: "GET",
    statusCode: {
        200: (room: IRoom) => {
            $("#room-list").html(render({rooms: room}));
        },
    },
});

// Update the room if it exists or create a new one if it doesn't
socket.on("roomUpdate", (room: IRoom) => {
    const roomElement = $(`#${room._id}`);
    const rooms = [room];

    // Length only exists if an element was found
    if (roomElement.length) {
        roomElement[0].outerHTML = render({rooms});
    } else {
        $("#room-list").append(render({rooms}));
    }
});
