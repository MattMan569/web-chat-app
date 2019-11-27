import axios from "axios";
import signup from "./ts/signup";

// One of: index, chat, login, signup
const page = document.body.dataset.page;

switch (page) {
    case "index": {
        break;
    }
    case "chat": {
        break;
    }
    case "login": {
        break;
    }
    case "signup": {
        signup();
        break;
    }
}
