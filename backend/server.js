import express from "express";
import pkg from "pg";
import bcrypt from "bcrypt";
import cors from "cors";

const { Pool } = pkg;

const app = express();
app.use(cors());
app.use(express.json());

// 🐘 PostgreSQL connection
const pool = new Pool({
  user: "postgres",            // your PostgreSQL username
  host: "localhost",
  database: "streamio_db",     // your database name
  password: "yourpassword",    // your PostgreSQL password
  port: 5432,
});

// ✅ TEST endpoint
app.get("/", (req, res) => {
  res.send("Streamio backend is running!");
});

// 🧑‍💻 SIGNUP route
app.post("/signup", async (req, res) => {
  const { username, email, password } = req.body;
  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    const result = await pool.query(
      "INSERT INTO users (username, email, password_hash) VALUES ($1, $2, $3) RETURNING id, username, email",
      [username, email, hashedPassword]
    );
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).send("Error creating user");
  }
});

// 🔑 LOGIN route
app.post("/login", async (req, res) => {
  const { email, password } = req.body;
  try {
    const result = await pool.query("SELECT * FROM users WHERE email = $1", [email]);
    if (result.rows.length === 0) return res.status(400).send("User not found");

    const user = result.rows[0];
    const valid = await bcrypt.compare(password, user.password_hash);
    if (!valid) return res.status(401).send("Invalid password");

    res.json({ id: user.id, username: user.username, email: user.email });
  } catch (err) {
    console.error(err);
    res.status(500).send("Error logging in");
  }
});

// 🚀 Start server
const PORT = 4000;
app.listen(PORT, () => console.log(`✅ Server running on http://localhost:${PORT}`));
