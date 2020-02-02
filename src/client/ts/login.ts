require("./common");
import $ from "jquery";

$("#login-form").submit(function(e) {
    e.preventDefault();
    const form = $(this);

    $.ajax({
        url: form.attr("action"),
        method: form.attr("method"),
        data: form.serialize(),
        statusCode: {
            200: (res) => {
                window.location.href = res;
            },
            400: (res) => {
                $("#err-msg").html(res.responseText);
            },
        },
    });
});
