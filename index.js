const express = require("express");
const cors = require("cors");
const { Pool } = require("pg");
const path = require("path");
require("dotenv").config();

const app = express();
const port = process.env.PORT || 5000;

// Middleware
// Allow CORS requests from your frontend domain
app.use(cors());

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

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
    console.error(error.message);
    res.status(500).json({ error: error.message });
  }
});

// Endpoint for downloading resume
app.get("/api/download-resume", (req, res) => {
  const file = path.resolve(__dirname, "./public/Aaditya_Nema__Resume.pdf");
  res.download(file);
});

// Serve static files from the React app
app.use(express.static(path.join(__dirname, "public", "dist")));

// Catch-all handler to serve the React app for any route
app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "dist", "index.html"));
});

// Start the server
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
