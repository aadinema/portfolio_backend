const express = require("express");
const cors = require("cors");
const { Pool } = require("pg");
const path = require("path");
require("dotenv").config();
const helmet = require("helmet");

const app = express();
const port = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(helmet()); // Add security headers

// PostgreSQL pool setup
const pool = new Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  password: process.env.DB_PASSWORD,
  port: process.env.DB_PORT,
});

// Endpoint for handling contact form data
app.post("/api/contact", async (req, res) => {
  const { name, email, message } = req.body;
  try {
    const result = await pool.query(
      "INSERT INTO contacts (name, email, message) VALUES ($1, $2, $3) RETURNING *",
      [name, email, message]
    );
    res.status(200).json(result.rows[0]);
  } catch (error) {
    console.error("Database query error:", error.message);
    res.status(500).json({ error: "An error occurred while processing your request." });
  }
});

// Endpoint for downloading resume
app.get("/api/download-resume", (req, res) => {
  const filePath = path.resolve(__dirname, "public", "Aaditya_nema.pdf");
  res.download(filePath, err => {
    if (err) {
      console.error("File download error:", err.message);
      res.status(500).json({ error: "Failed to download the file." });
    }
  });
});

// Serve static files from the React app
app.use(express.static(path.join(__dirname, "public")));

// Catch-all handler to serve the React app
app.get("*", (req, res) => {
  res.sendFile(path.resolve(__dirname, "public", "index.html"));
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error("Server error:", err.stack);
  res.status(500).send("Something went wrong!");
});

// Start the server
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
