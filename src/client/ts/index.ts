require("./common");
import Handlebars from "handlebars";
import $ from "jquery";
import socketio from "socket.io-client";
import { IRoom } from "./../../server/models/room";

const socket = socketio("/index");

const template = document.getElementById("room-item-template").innerHTML;
const render = Handlebars.compile(template);

const templateOne = document.getElementById("room-item-template-one").innerHTML;
const renderOne = Handlebars.compile(templateOne);

const renderRooms = (rooms: IRoom[]) => {
    document.getElementById("room-list").innerHTML = render({rooms});
};

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
        200: (res: IRoom[]) => {
            renderRooms(res);
        },
    },
});

// Update the room if it exists or create a new one if it doesn't
socket.on("roomUpdate", (room: IRoom) => {
    const roomElement = $(`#${room._id}`);

    // Length only exists if an element was found
    if (roomElement.length) {
        roomElement[0].outerHTML = renderOne(room);
    } else {
        $("#room-list").append(renderOne(room));
    }
});
