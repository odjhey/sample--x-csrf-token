const express = require("express");
const cookieParser = require("cookie-parser");
const crypto = require("crypto");

const app = express();
const PORT = 3000;

// Middleware to parse cookies and JSON
app.use(cookieParser());
app.use(express.json());

// Utility to generate a random token
const generateToken = () => crypto.randomBytes(16).toString("hex");

// Middleware to check or fetch the CSRF token
const csrfMiddleware = (req, res, next) => {
  // Check if the request is asking for a CSRF token
  if (req.headers["x-csrf-token"] === "fetch") {
    const csrfToken = generateToken();
    res.cookie("csrfToken", csrfToken, { httpOnly: true, sameSite: "Strict" });
    res.set("x-csrf-token", csrfToken);
    return res.json({ message: "ok" });
  }

  // Otherwise, validate the CSRF token
  const csrfToken = req.header("x-csrf-token");
  if (!csrfToken || csrfToken !== req.cookies.csrfToken) {
    return res.status(403).json({ error: "Invalid or missing CSRF token" });
  }

  next();
};

// Apply the CSRF middleware to protected routes
app.use("/purchase-order-something", csrfMiddleware);

// A protected endpoint
app.post("/purchase-order-something", (req, res) => {
  res.json({ message: "Success!" });
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
