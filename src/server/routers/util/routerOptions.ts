export const websiteInfo = {
    websiteAuthor: "Matthew Polsom",
    websiteTitle: "Chat App",
};

export const getRouterOptions = (req: Express.Request, pageTitle: string) => {
    return {
        pageTitle,
        loggedIn: req.session.loggedIn,
        // TODO just use the whole user obj
        // user: req.session.user,
        username: req.session.user?.username,
        userId: req.session.user?._id,
        avatar: req.session.user?.avatar,
        ...websiteInfo,
    };
};

export default {
    websiteInfo,
    getRouterOptions,
};
