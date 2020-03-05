import $ from "jquery";

export const showModal = (el: string, msg: string) => {
    $(el).show("fast");
    $(el).text(msg);
};

export const hideModal = (el: string) => {
    $(el).hide("fast");
    $(el).text("");
};

export const showModalTimed = (el: string, msg: string, displayTime: number) => {
    showModal(el, msg);
    setTimeout(() => {
        hideModal(el);
    }, displayTime);
};
