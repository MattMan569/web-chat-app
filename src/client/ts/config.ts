require("./common");
import $ from "jquery";

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
