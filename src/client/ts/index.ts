require("./common");
import Handlebars from "handlebars";
import $ from "jquery";
import socketio from "socket.io-client";
import { IRoom } from "./../../server/models/room";

const socket = socketio("/index");

const template = $("#room-item-template").html();
const render = Handlebars.compile(template);

// TODO non-optional callback to handle 500 err
const joinRoom = (roomId: string, password: string, link: string, callback?: (error: string) => void) => {
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
                callback("401");
            },
            500: (res) => {
                console.log(res);
            },
        },
    });
};

// Display the overlay to get the locked room's password from the user
const makeOverlay = (callback: (complete: boolean, password?: string) => void) => {
    $("#join-overlay").css("display", "block");

    $("#join-overlay-join-btn").click(() => {
        const password = $("#room-password").val() as string;
        callback(true, password);
    });

    $("#join-overlay-cancel-btn").click(() => {
        $("#join-overlay-join-btn").unbind();
        $("#join-overlay").css("display", "none");
        callback(false);
    });
};

// Attach a click event handler to the room's anchor
// Display the password entry overlay if the room is locked
// Join the room if unlocked or on password entry
const roomAttachClickEvent = (element: JQuery<HTMLElement>) => {
    element.find("a:first").click(function(event) {
        event.preventDefault();
        const anchor = $(this);
        const link = anchor.attr("href");
        const roomId = link.split("=")[1];
        // let password = "";

        if (anchor.data("locked") === true) {
            // TODO overlay
            // password = "123";

            makeOverlay((complete, pswd) => {
                console.log("make overlay done");

                // User canceled
                if (!complete) {
                    return;
                }

                joinRoom(roomId, pswd, link, (error) => {
                    console.log(error);
                });
            });
        } else {
            joinRoom(roomId, "", link);
        }
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
            $(".room-item").each(function() {
                roomAttachClickEvent($(this));
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
        roomElement[0].outerHTML = render({ rooms });

        roomAttachClickEvent($(`#${room._id}`));
    } else {
        // Create a new room element
        const html = $(render({ rooms }));
        const id = html.attr("id");
        $("#room-list").append(html);

        roomAttachClickEvent($(`#${id}`));
    }
});
