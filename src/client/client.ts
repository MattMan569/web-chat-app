import axios from "axios";

console.log("client");

(async () => {
    const raw = await axios.post("http://localhost:3000/users", {
        email: "test@email.com",
        password: "test123",
        username: "testUser",
    }, {
        headers: {
            "Accept": "application/json",
            "Content-Type": "application/json",
        },
    });
})();
