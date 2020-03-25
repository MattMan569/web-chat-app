require("./common");
import $ from "jquery";

$("#signup-form").submit(function(e) {
    e.preventDefault();
    const form = $(this);
    const data = form.serialize();
    const dataArr = form.serializeArray();

    // Ensure the password and confirm password fields match
    let password: string;
    let confirm: string;
    dataArr.forEach((el) => {
        if (el.name === "password") {
            password = el.value;
        } else if (el.name === "password-confirm") {
            confirm = el.value;
        }
    });

    if (password !== confirm) {
        $("#err-msg").text("Passwords do not match");
        return;
    }

    // Submit the form
    $.ajax({
        url: form.attr("action"),
        method: form.attr("method"),
        data,
        success: (res) => {
            window.location.href = res;
        },
        error: (res) => {
            $("#err-msg").text(res.responseText);
        },
    });
});
