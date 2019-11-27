import axios, { AxiosResponse } from "axios";
import localforage from "localforage";

const signup = () => {
    const form = document.getElementById("signup-form") as HTMLFormElement;
    const formBtn = document.getElementById("signup-btn") as HTMLButtonElement;

    form.addEventListener("submit", async (e) => {
        e.preventDefault();
        formBtn.disabled = true;

        // TODO: confirm password

        const inputs = form.elements as any;
        let response: AxiosResponse;

        try {
            response = await axios.post("http://localhost:3000/users", {
                email: inputs.email.value,
                password: inputs.password.value,
                username: inputs.username.value,
            }, {
                headers: {
                    "Accept": "application/json",
                    "Content-Type": "application/json",
                },
            });

            const data = response.data;

            // Set the user data and token in client-side storage
            const clientStorage = localforage.createInstance({
                name: "WebChatApp",
            });
            clientStorage.setItem("user", data.user);
            clientStorage.setItem("token", data.token);

            // Navigate to index
            window.location.href = "/";
        } catch (e) {
            const res = e.response;

            // Duplicate key error
            if (res.data.code === 11000) {
                const key = Object.keys(res.data.keyPattern)[0];

                // TODO: display on page
                console.log(`An account already exists with that ${key}.`);
            }

            console.log(e.response);
            formBtn.disabled = false;
        }
    });
};

export default signup;
