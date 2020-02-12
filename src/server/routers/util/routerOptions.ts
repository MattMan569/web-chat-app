export const websiteInfo = {
    websiteAuthor: "Matthew Polsom",
    websiteTitle: "Chat App",
};

export const getRouterOptions = (req: Express.Request, pageTitle: string) => {
    return {
        pageTitle,
        loggedIn: req.session.loggedIn,
        username: req.session.user?.username,
        userId: req.session.user?._id,
        ...websiteInfo,
    };
};

export default {
    websiteInfo,
    getRouterOptions,
};
