import $ from "jquery";
require("./common");

$("#create-form").submit(function(e) {
    e.preventDefault();
    const form = $(this);

    $.ajax({
        url: form.attr("action"),
        method: form.attr("method"),
        data: form.serialize(),
        statusCode: {
            200: (res) => {
                // TODO redirect to and join room
                console.log(res);
                window.location.href = res;
            },
            400: (res) => {
                // TODO display error
                console.log(res);
            },
        },
    });
});
