require("./common");
import Handlebars from "handlebars";
import $ from "jquery";
import socketio from "socket.io-client";
import { IUser } from "../../server/models/user";
import hbHelpers from "../../shared/handlebarsHelpers";
import { IRoom } from "./../../server/models/room";
import { IjQDoneAjax } from "./../../types/types";
import { showModalTimed } from "./util/jQueryUtil";

// Add handlebars helper functions
Handlebars.registerHelper("ifeq", hbHelpers.ifeq);
Handlebars.registerHelper("ifnoteq", hbHelpers.ifnoteq);

const socket = socketio("/index");

const template = $("#room-item-template").html();
const render = Handlebars.compile(template);

// Current user
let me: IUser;

const joinRoom = (roomId: string, password: string, link: string, callback: (error: JQuery.jqXHR<any>) => void) => {
    $.ajax({
        url: `/rooms/join/${roomId}`,
        method: "POST",
        data: {
            password,
        },
        success: () => {
            window.location.href = link;
        },
        error: (err) => {
            callback(err);
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
        $("#join-overlay-error").text("");
        $("#room-password").val("");
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

        if (anchor.data("locked") === true) {
            makeOverlay((complete, password) => {
                // User canceled
                if (!complete) {
                    return;
                }

                joinRoom(roomId, password, link, (error) => {
                    // Incorrect password
                    if (error.status === 401) {
                        // Show message on overlay
                        $("#join-overlay-error").text(error.responseText);
                    } else {
                        // Close overlay first if open
                        $("#join-overlay").css("display", "none");

                        // Show modal with error
                        showModalTimed("#error-msg-modal", error.responseText, 2000);
                    }
                });
            });
        } else {
            joinRoom(roomId, "", link, (error) => {
                // Show modal with error
                showModalTimed("#error-msg-modal", error.responseText, 2000);
            });
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

// Get the current user
const getMe = () => {
    return $.ajax({
        url: "/users/me",
        method: "GET",
    });
};

// Get the list of rooms from the server
const getRooms = () => {
    return $.ajax({
        url: "/rooms",
        method: "GET",
    });
};

$.when(getRooms(), getMe()).done((roomData: IjQDoneAjax<IRoom[]>, userData: IjQDoneAjax<IUser>) => {
    me = userData[0];
    const rooms = roomData[0];

    // Render the rooms
    $("#room-list").html(render({ rooms, me }));

    // Add an event listener to every rendered room
    $(".room-item").each(function() {
        roomAttachClickEvent($(this));
    });
});

// Update the room if it exists or create a new one if it doesn't
socket.on("roomUpdate", (room: IRoom) => {
    const roomElement = $(`#${room._id}`);
    const rooms = [room];

    // Length only exists if an element was found
    if (roomElement.length) {
        // Modify the existing room element
        roomElement[0].outerHTML = render({ rooms, me });

        roomAttachClickEvent($(`#${room._id}`));
    } else {
        // Create a new room element
        const html = $(render({ rooms }));
        const id = html.attr("id");
        $("#room-list").append(html);

        roomAttachClickEvent($(`#${id}`));
    }
});

// Remove a deleted room from the room list
socket.on("roomDelete", (room: IRoom) => {
    $(`#${room._id}`).remove();
});
