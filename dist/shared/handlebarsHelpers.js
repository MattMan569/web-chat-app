"use strict";
// Helpers for Handlebars
Object.defineProperty(exports, "__esModule", { value: true });
// Return true if the two parameters are equal
exports.ifeq = function (a, b, options) {
    // tslint:disable-next-line: triple-equals
    if (a == b) {
        return options.fn(this);
    }
    return options.inverse(this);
};
// Return true if the two parameters are not equal
exports.ifnoteq = function (a, b, options) {
    // tslint:disable-next-line: triple-equals
    if (a != b) {
        return options.fn(this);
    }
    return options.inverse(this);
};
exports.default = {
    ifeq: exports.ifeq,
    ifnoteq: exports.ifnoteq,
};
//# sourceMappingURL=handlebarsHelpers.js.map