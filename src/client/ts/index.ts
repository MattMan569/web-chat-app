import Handlebars from "handlebars";
import $ from "jquery";
import { IRoom } from "./../../server/models/room";
require("./common");

const template = document.getElementById("room-item-template").innerHTML;
const render = Handlebars.compile(template);

const renderRooms = (rooms: IRoom[]) => {
    console.log(rooms);
    document.getElementById("room-list").innerHTML = render({rooms});
};

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

$.ajax({
    url: "/rooms",
    method: "GET",
    statusCode: {
        200: (res: IRoom[]) => {
            console.log(res);
            renderRooms(res);
        },
    },
});
