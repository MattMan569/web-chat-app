require("./common");
import $ from "jquery";
import localforage from "localforage";
import { IProfile } from "./../../server/models/profile";
import { IUser } from "./../../server/models/user";
import { showModalTimed } from "./util/jQueryUtil";

const deleteBtn = $("#delete-user-btn");
const descBtns = $("#description-buttons");

// Delete the user sending the request
deleteBtn.click(() => {
    $.ajax({
        url: "/users",
        method: "DELETE",
        statusCode: {
            200: async (res: IUser) => {
                window.location.href = "/";
            },
        },
    });
});

// Change the paragraph to a text area with the text pre-populated
// Add the appropriate buttons with proper listeners.
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

// Upload the new profile picture whenever a new file is selected
$("#avatar-upload").change(function() {
    const formData = new FormData();
    const file = $(this).prop("files")[0];

    // User canceled after erroneous upload
    if (!file) {
        return;
    }

    formData.append("avatar", file);

    $.ajax({
        url: "/users/upload/avatar",
        method: "POST",
        data: formData,
        processData: false,
        contentType: false,
        statusCode: {
            200: (avatar: string) => {
                // Change the profile picture
                localforage.setItem("avatar", avatar, (err) => {
                    if (err) {
                        return console.log(err);
                    }
                    $("#profile-btn").css("background-image", `url(${avatar})`);
                });
            },
            400: (res) => {
                // Incorrect file format
                showModalTimed("#error-msg-modal", res.responseJSON.error, 2000);
            },
            500: (res) => {
                // Server cannot process file
                console.log(res);
                showModalTimed("#error-msg-modal", res.responseJSON.error, 2000);
            },
        },
    });
});
