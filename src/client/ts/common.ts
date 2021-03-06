import $ from "jquery";
import localforage from "localforage";
import { IUser } from "../../server/models/user";

// Code common among all pages
// Header, footer, etc.

localforage.config({
    name: "chatApp",
    storeName: "Chat_App",
    description: "Express chat application by Matthew Polsom",
});

const profileButton = document.getElementById("profile-btn");
const profileDropdownContent = document.getElementById("profile-dropdown-content");

// First get the stored avatar for a more responsive UI
localforage.getItem("avatar", (err, avatar) => {
    if (err) {
        return console.log(err);
    }
    $("#profile-btn").css("background-image", `url(data:image/png;base64,${avatar})`);
});

// Get the avatar stored on the server
$.ajax({
    url: "/users/me",
    method: "GET",
    cache: true,
    success: (me: IUser) => {
        // Store the avatar client-side
        localforage.setItem("avatar", me.avatar, (err, avatar) => {
            if (err) {
                return console.log(err);
            }
            $("#profile-btn").css("background-image", `url(data:image/png;base64,${avatar})`);
        });
    },
    error: (res) => {
        console.log(res);
    },
});

// Add an event listener if the profile button is present
profileButton?.addEventListener("click", (e: MouseEvent) => {
    profileDropdownContent.classList.toggle("show");
});

// Close all open dropdown when the any location
// on the page is clicked
window.addEventListener("click", (e: MouseEvent) => {
    const element = (e.target as HTMLBodyElement).closest("button");

    // If there is no element or the element is not a dropdown button
    // then close all open dropdowns
    if (!element || !element.matches(".dropdown-btn")) {
        const dropdowns = document.getElementsByClassName("dropdown-content");
        for (let i = 0; i < dropdowns.length; i++) {
            const dropdown = dropdowns.item(i);
            if (dropdown.classList.contains("show")) {
                dropdown.classList.remove("show");
            }
        }
    }
});
