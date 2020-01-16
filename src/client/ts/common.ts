// Code common among all pages
// Header, footer, etc.

const profileButton = document.getElementById("profile-btn");
const profileDropdownContent = document.getElementById("profile-dropdown-content");

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
