require("./common");
import $ from "jquery";
import { IRoom } from "./../../server/models/room";

$("#ban-user-btn").click(() => {
    const username = $("#ban-user-input").val();
    const roomId = $(location).attr("href").split("/").pop();

    $.ajax({
        url: "/rooms/ban",
        method: "POST",
        data: {
            username,
            roomId,
        },
        statusCode: {
            200: (res) => {
                console.log(res);
            },
        },
    });
});

$(".unban-user-btn").each(function() {
    $(this).click(() => {
        const userId = $(this).data("user-id");
        const roomId = $(location).attr("href").split("/").pop();

        $.ajax({
            url: "/rooms/unban",
            method: "POST",
            data: {
                userId,
                roomId,
            },
            statusCode: {
                200: (res) => {
                    console.log(res);
                },
            },
        });
    });
});

$("#delete-room-btn").click(() => {
    const roomId = $(location).attr("href").split("/").pop();

    $.ajax({
        url: `/rooms/${roomId}`,
        method: "DELETE",
        statusCode: {
            200: (room: IRoom) => {
                console.log(room);
                window.location.href = "/";
            },
            401: (res) => {
                console.log(res);
            },
            500: (res) => {
                console.log(res);
            },
        },
    });
});
