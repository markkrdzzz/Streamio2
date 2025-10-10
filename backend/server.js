import express from "express";
import pkg from "pg";
import bcrypt from "bcrypt";
import cors from "cors";

const { Pool } = pkg;

const app = express();
app.use(cors());
app.use(express.json());

// 🐘 Supabase PostgreSQL connection
// Link supabase here once set up
const pool = new Pool({
  connectionString: "postgresql://postgres.kqsfaqxlwdrxevvshpil:[0622]@aws-1-us-east-1.pooler.supabase.com:6543/postgres",
  ssl: { rejectUnauthorized: false },
});

// ✅ Test route
app.get("/", (req, res) => {
  res.send("Streamio backend connected to Supabase!");
});

// 🧑‍💻 SIGNUP route
app.post("/signup", async (req, res) => {
  const { username, email, password } = req.body;

  try {
    // Hash password before storing
    const hashedPassword = await bcrypt.hash(password, 10);

    const result = await pool.query(
      "INSERT INTO users (username, email, password_hash) VALUES ($1, $2, $3) RETURNING id, username, email",
      [username, email, hashedPassword]
    );

    res.status(201).json({ message: "User created", user: result.rows[0] });
  } catch (err) {
    console.error("Signup error:", err);
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
    console.error("Login error:", err);
    res.status(500).send("Error logging in");
  }
});

// 🚀 Start server
const PORT = 4000;
app.listen(PORT, () => console.log(`✅ Server running at http://localhost:${PORT}`));
