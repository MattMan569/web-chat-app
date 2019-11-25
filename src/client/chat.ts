import Handlebars from "handlebars";

(async () => {
    // Get the partials
    const response = await fetch("/partialForms");
    const partials = await response.json();

    // Compile the partials for use
    const renderLogin = Handlebars.compile(partials.login);
    const renderSignup = Handlebars.compile(partials.signup);

    // DOM elements
    const switchFormBtn = document.getElementById("switch-form-btn");
    const form = document.getElementById("form");

    // Show the login form by default
    form.innerHTML = renderLogin(null);

    let loginDisplayed = true;

    // Swap between the login and signup forms
    switchFormBtn.addEventListener("click", (e) => {
        if (loginDisplayed) {
            // Display the signup form
            loginDisplayed = false;
            form.innerHTML = renderSignup(null);
            switchFormBtn.innerText = "Already have an account? Click here to login.";
        } else {
            // Display the login form
            loginDisplayed = true;
            form.innerHTML = renderLogin(null);
            switchFormBtn.innerText = "Don't have an account? Click here to signup.";
        }
    });
})();
