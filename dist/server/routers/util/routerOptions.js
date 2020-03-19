"use strict";
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.websiteInfo = {
    websiteAuthor: "Matthew Polsom",
    websiteTitle: "Chat App",
};
exports.getRouterOptions = function (req, pageTitle) {
    var _a, _b;
    return __assign({ pageTitle: pageTitle, loggedIn: req.session.loggedIn, 
        // TODO just use the whole user obj
        // user: req.session.user,
        username: (_a = req.session.user) === null || _a === void 0 ? void 0 : _a.username, userId: (_b = req.session.user) === null || _b === void 0 ? void 0 : _b._id }, exports.websiteInfo);
};
exports.default = {
    websiteInfo: exports.websiteInfo,
    getRouterOptions: exports.getRouterOptions,
};
//# sourceMappingURL=routerOptions.js.map