"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateMessage = function (message) {
    return {
        message: message,
        createdAt: (new Date()).toLocaleString().split(","),
        sender: "SERVER",
    };
};
//# sourceMappingURL=message.js.map