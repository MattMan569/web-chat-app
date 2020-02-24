require("./common");
import Handlebars from "handlebars";
import $ from "jquery";
import socketio from "socket.io-client";
import { IRoom } from "./../../server/models/room";

const socket = socketio("/index");

const template = $("#room-item-template").html();
const render = Handlebars.compile(template);

const joinRoom = (roomId: string, password: string, link: string) => {
    $.ajax({
        url: `/rooms/join/${roomId}`,
        method: "POST",
        data: {
            password,
        },
        statusCode: {
            200: () => {
                window.location.href = link;
            },
            401: () => {
                console.log("401");
            },
        },
    });
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
        200: (room: IRoom) => {
            // Render the rooms
            $("#room-list").html(render({ rooms: room }));

            // Add an event listener to every rendered room
            $("a.room-btn-link").each(function() {
                const anchor = this as HTMLAnchorElement;

                anchor.addEventListener("click", (ev) => {
                    ev.preventDefault();
                    const link = anchor.href;
                    const roomId = link.split("=")[1];
                    let password = "";

                    // Prompt for the password if the room is locked
                    if (anchor.dataset.locked === "true") {
                        // TODO get password
                        password = "123";
                    }

                    joinRoom(roomId, password, link);
                });
            });
        },
    },
});

// Update the room if it exists or create a new one if it doesn't
socket.on("roomUpdate", (room: IRoom) => {
    const roomElement = $(`#${room._id}`);
    const rooms = [room];

    // Length only exists if an element was found
    if (roomElement.length) {
        // Modify the existing room element
        roomElement[0].outerHTML = render({rooms});
    } else {
        // Create a new room element
        const html = $(render({rooms}));
        const id = html.attr("id");
        $("#room-list").append(html);

        $(`#${id}`).find("a:first").click(function() {
            const anchor = $(this);
            const link = anchor.attr("href");
            const roomId = link.split("=")[1];
            let password = "";

            if (anchor.data("locked") === "true") {
                password = "123";
            }

            joinRoom(roomId, password, link);
        });
    }
});
