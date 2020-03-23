require("./common");
import $ from "jquery";
import { IRoom } from "./../../server/models/room";
import { showModalTimed } from "./util/jQueryUtil";

const nameBtns = $("#name-buttons");
const pswdBtns = $("#password-buttons");
const capacityBtns = $("#capacity-buttons");

// Create the element for labeling the modifiable field
const getSpanLabelEl = (id: string, text: string) => {
    return $("<span/>", {
        id,
        text,
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
                    inputEl.replaceWith(getSpanLabelEl("name", res.name));
                    $("#room-name-header").text(`Configure - ${res.name}`);
                },
                error: (res) => {
                    showModalTimed("#error-msg-modal", res.responseText, 2000);
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

const editPassword = () => {
    pswdBtns.children().remove();

    const pswdEl = $("#password");
    const pswdHtml = pswdEl[0].outerHTML;
    const pswdText = pswdEl.text();
    const inputEl = $(`<input type="text" value="${pswdText}"/>`);

    const saveBtnEl = $("<button/>", {
        text: "Save",
        id: "save-password-btn",
        click: async () => {
            await $.ajax({
                url: "/rooms/password",
                method: "PATCH",
                data: {
                    password: inputEl.val(),
                },
                success: (res: {room: IRoom, password: string}) => {
                    inputEl.replaceWith(getSpanLabelEl("password", res.password));
                },
                error: (res) => {
                    showModalTimed("#error-msg-modal", res.responseText, 2000);
                },
            });

            pswdBtns.children().remove();
            pswdBtns.append(getEditBtnEl("edit-password-btn", editPassword));
        },
    });

    const cancelBtnEl = $("<button/>", {
        text: "Cancel",
        id: "cancel-password-btn",
        click: async () => {
            inputEl.replaceWith(pswdHtml);
            pswdBtns.children().remove();
            pswdBtns.append(getEditBtnEl("edit-password-btn", editPassword));
        },
    });

    pswdEl.replaceWith(inputEl);
    pswdBtns.append(cancelBtnEl, saveBtnEl);
};

const editCapacity = () => {
    capacityBtns.children().remove();

    const capacityEl = $("#capacity");
    const capacityHtml = capacityEl[0].outerHTML;
    const capacityText = capacityEl.text();
    const inputEl = $(`<input type="number" value="${capacityText}" min="1" max="100"/>`);

    const saveBtnEl = $("<button/>", {
        text: "Save",
        id: "save-capacity-btn",
        click: async () => {
            await $.ajax({
                url: "/rooms/capacity",
                method: "PATCH",
                data: {
                    capacity: inputEl.val(),
                },
                success: (res: IRoom) => {
                    inputEl.replaceWith(getSpanLabelEl("capacity", res.capacity.toString()));
                },
                error: (res) => {
                    showModalTimed("#error-msg-modal", res.responseText, 2000);
                },
            });

            capacityBtns.children().remove();
            capacityBtns.append(getEditBtnEl("edit-capacity-btn", editCapacity));
        },
    });

    const cancelBtnEl = $("<button/>", {
        text: "Cancel",
        id: "cancel-capacity-btn",
        click: async () => {
            inputEl.replaceWith(capacityHtml);
            capacityBtns.children().remove();
            capacityBtns.append(getEditBtnEl("edit-capacity-btn", editCapacity));
        },
    });

    capacityEl.replaceWith(inputEl);
    capacityBtns.append(cancelBtnEl, saveBtnEl);
};

nameBtns.append(getEditBtnEl("edit-name-btn", editName));
pswdBtns.append(getEditBtnEl("edit-password-btn", editPassword));
capacityBtns.append(getEditBtnEl("edit-capacity-btn", editCapacity));

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
