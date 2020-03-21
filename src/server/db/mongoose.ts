import mongoose from "mongoose";

mongoose.connect(process.env.MONGODB_URL, {
    useCreateIndex: true,
    useFindAndModify: false,
    useNewUrlParser: true,
    useUnifiedTopology: true,
}, (err) => {
    if (err) {
        console.log("MongoDB:", err);
    }
});
