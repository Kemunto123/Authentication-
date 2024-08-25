# Project Title: User Management with JWT Authentication and Authorization

## Overview
This project demonstrates how to implement a basic user management system with JWT-based authentication and authorization using Node.js. The system includes user registration, login, profile management, and an admin dashboard. It also features a delete user functionality, which can be invoked after user authentication.

## Delete User Functionality

### 1. Implementation

The delete user functionality allows authenticated users to delete a user by their username. This is implemented in the `deleteuser.js` file, which includes both backend and frontend code.

#### Code Implementation: `deleteuser.js`
```javascript
const express = require("express");
const jwt = require("jsonwebtoken");
const bodyParser = require("body-parser");

const app = express();
app.use(bodyParser.json());

const users = [
  { username: "admin", role: "admin" },
  { username: "user1", role: "user" },
  { username: "user2", role: "user" }
];

const JWT_SECRET = "your_secret_key_here";

// Middleware: Authentication
const authenticateToken = (req, res, next) => {
  const token = req.headers.authorization && req.headers.authorization.split(" ")[1];
  if (!token) return res.status(401).json({ error: "Token missing" });

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) return res.status(403).json({ error: "Unauthorized" });
    req.user = user;
    next();
  });
};

// Middleware: Authorization
const authorize = (allowedRoles) => {
  return (req, res, next) => {
    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({ error: "Unauthorized" });
    }
    next();
  };
};

// Backend: Delete User Endpoint
app.post("/auth/delete/user", authenticateToken, authorize(["admin", "user"]), (req, res) => {
  const { username } = req.body;
  const userIndex = users.findIndex(user => user.username === username);
  if (userIndex !== -1) {
    users.splice(userIndex, 1);
    res.json({ message: "User deleted successfully" });
  } else {
    res.status(404).json({ error: "User not found" });
  }
});

// Frontend: Delete User Form Handler
document.getElementById("delete-user-form").addEventListener("submit", async (event) => {
  event.preventDefault();
  const username = document.getElementById("other-username").value;
  const response = await fetch(`http://localhost:4001/auth/delete/user`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${localStorage.getItem("token")}`
    },
    body: JSON.stringify({ username })
  });
  const result = await response.json();
  if (response.ok) {
    alert(result.message);
  } else {
    alert(result.error);
  }
});

app.listen(4001, () => console.log("Server running on port 4001"));
