const express = require('express');
const app = express();
app.use(express.json());

// Dummy user model for demonstration (replace with your actual UserModel)
const UserModel = {
    destroy: async ({ where: { username } }) => {
        console.log(`User with username "${username}" deleted from the database.`);
        // Actual database deletion logic goes here
    }
};

// Middleware for authentication (dummy implementation for demonstration)
const authentication = (req, res, next) => {
    // Verify token or session
    console.log("Authentication successful");
    next();
};

// Middleware for authorization (dummy implementation for demonstration)
const authorisation = ({ isAdmin }) => {
    return (req, res, next) => {
        // Check user's role
        console.log(`Authorization successful, isAdmin: ${isAdmin}`);
        next();
    };
};

// Controller function to handle user deletion
const delete_user_by_username = async (req, res) => {
    const { username } = req.body;

    if (!username) {
        return res.status(400).json({ error: "Username is required" });
    }

    try {
        await UserModel.destroy({ where: { username } });
        return res.status(200).json({ message: `User "${username}" deleted successfully` });
    } catch (error) {
        return res.status(500).json({ error: "An error occurred while deleting the user" });
    }
};

// Route to handle delete user request
app.post(
    "/auth/delete/user",
    authentication,
    authorisation({ isAdmin: false }),
    (req, res) => delete_user_by_username(req, res),
);

// Serve a simple HTML form for user interaction
app.get('/', (req, res) => {
    res.send(`
        <form id="delete-user-form">
            <label for="other-username">Enter Username to Delete:</label>
            <input type="text" id="other-username" name="other-username">
            <button type="submit">Delete User</button>
        </form>
        <script>
            document.getElementById("delete-user-form").addEventListener("submit", async (event) => {
                event.preventDefault();
                const username = document.getElementById("other-username").value;
                const response = await fetch(\`http://localhost:4001/auth/delete/user\`, {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify({
                        username
                    })
                });
                
                const result = await response.json();
                alert(result.message || result.error);
            });
        </script>
    `);
});

// Start the server
app.listen(4001, () => {
    console.log("Server is running on http://localhost:4001");
});
