require("./common");
import $ from "jquery";
import socketio from "socket.io-client";
import Profile, { IProfile } from "./../../server/models/profile";

const socket = socketio("/profile");

const descBtns = $("#description-buttons");

const handleEdit = () => {
    descBtns.children().remove();

    const descriptionEl = $("#description");
    const descriptionHtml = $("#description")[0].outerHTML;
    const descriptionText = descriptionEl.html();
    const inputEl = $(`<textarea>${descriptionText}</textarea>`);

    // Update the user's profile and revert the textarea
    const saveBtnEl = $("<button/>", {
        text: "Save",
        id: "save-description-btn",
        click: async () => {
            await $.ajax({
                url: "/profiles/description",
                method: "PATCH",
                data: {
                    description: inputEl.val(),
                },
                statusCode: {
                    200: (res: IProfile) => {
                        inputEl.replaceWith(getDescriptionEl(res.description));
                    },
                    400: (res) => {
                        console.log(res);
                    },
                },
            });

            // Revert the cancel button back to the edit button
            descBtns.children().remove();
            descBtns.append(getEditBtnEl());
        },
    });

    // Revert the textarea
    const cancelBtnEl = $("<button/>", {
        text: "Cancel",
        id: "cancel-description-btn",
        click: () => {
            inputEl.replaceWith(descriptionHtml);

            // Revert the cancel button back to the edit button
            descBtns.children().remove();
            descBtns.append(getEditBtnEl());
        },
    });

    // Add the textarea
    descriptionEl.replaceWith(inputEl);

    // Add the save and cancel buttons
    descBtns.append(cancelBtnEl, saveBtnEl);
};

// Get a new edit button
const getEditBtnEl = () => {
    return $("<button/>", {
        text: "Edit",
        click: handleEdit,
    });
};

// Get a new description element
const getDescriptionEl = (description: string) => {
    return $("<p/>", {
        text: description,
        id: "description",
    });
};

descBtns.append(getEditBtnEl());
