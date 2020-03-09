require("./common");
import $ from "jquery";
import { IRoom } from "./../../server/models/room";

const nameBtns = $("#name-buttons");

// Create the element for storing the room's name
const getNameEl = (name: string) => {
    return $("<span/>", {
        id: "name",
        text: name,
    });
};

// Create a button for editing
const getEditBtnEl = (id: string, clickFn: () => void) => {
    return $("<button/>", {
        text: "Edit",
        id,
        click: clickFn,
    });
};

// Handle the editing of the rooms name
const editName = () => {
    // Remove the existing buttons
    nameBtns.children().remove();

    const nameEl = $("#name");
    const nameHtml = nameEl[0].outerHTML;
    const nameText = nameEl.text();
    const inputEl = $(`<input type="text" value="${nameText}"/>`);

    // Create the save button
    const saveBtnEl = $("<button/>", {
        text: "Save",
        id: "save-name-btn",
        click: async () => {
            await $.ajax({
                url: "/rooms/name",
                method: "PATCH",
                data: {
                    name: inputEl.val(),
                },
                success: (res: IRoom) => {
                    // Replace the <input> with the new name and update the header
                    inputEl.replaceWith(getNameEl(res.name));
                    $("#room-name-header").text(`Configure - ${res.name}`);
                },
                error: (res) => {
                    // TODO modal
                    console.log(res);
                },
            });

            nameBtns.children().remove();
            nameBtns.append(getEditBtnEl("edit-name-btn", editName));
        },
    });

    // Create the cancel button
    const cancelBtnEl = $("<button/>", {
        text: "Cancel",
        id: "cancel-name-btn",
        click: () => {
            inputEl.replaceWith(nameHtml);
            nameBtns.children().remove();
            nameBtns.append(getEditBtnEl("edit-name-btn", editName));
        },
    });

    nameEl.replaceWith(inputEl);
    nameBtns.append(cancelBtnEl, saveBtnEl);
};

nameBtns.append(getEditBtnEl("edit-name-btn", editName));

// Ban the specified user by username
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

// Unban the specified user by user ID
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

// Permanently delete this room
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
