import express from "express";
import { createClient } from '@supabase/supabase-js';
import bcrypt from "bcrypt";
import cors from "cors";

const app = express();
app.use(cors());
app.use(express.json());

// Supabase connection with API keys (much safer!)
const supabaseUrl = 'https://kqsfaqxlwdrxevvshpil.supabase.co';
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imtxc2ZhcXhsd2RyeGV2dnNocGlsIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2MDAyMzE1MSwiZXhwIjoyMDc1NTk5MTUxfQ.9gEgBNn4u4niCJu1ChcH7DTEXdNc7-UscNt4ATZf03k'; // Get this from Settings → API
const supabase = createClient(supabaseUrl, supabaseServiceKey);

// Test route
app.get("/", (req, res) => {
  res.send("Streamio backend connected to Supabase via API!");
});

// SIGNUP route
app.post("/signup", async (req, res) => {
  const { username, email, password, name } = req.body;

  try {
    // Hash password before storing
    const hashedPassword = await bcrypt.hash(password, 10);

    const { data, error } = await supabase
      .from('users')
      .insert([
        { 
          username, 
          email, 
          password: hashedPassword, 
          name: name || username, // Use provided name or fallback to username
          bio: '' 
        }
      ])
      .select();

    if (error) {
      console.error("Supabase error:", error);
      if (error.code === '23505') { // Unique violation
        return res.status(400).send("Username or email already exists");
      }
      return res.status(500).send("Error creating user");
    }

    res.status(201).json({ message: "User created", user: data[0] });
  } catch (err) {
    console.error("Signup error:", err);
    res.status(500).send("Error creating user");
  }
});

// LOGIN route
app.post("/login", async (req, res) => {
  const { email, password } = req.body;

  try {
    // Check if input is email or username
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .or(`email.eq.${email},username.eq.${email}`)
      .single();

    if (error || !data) {
      return res.status(400).send("User not found");
    }

    const valid = await bcrypt.compare(password, data.password);
    if (!valid) {
      return res.status(401).send("Invalid password");
    }

    res.json({ 
      id: data.user_id, 
      username: data.username, 
      email: data.email,
      name: data.name,
      bio: data.bio 
    });
  } catch (err) {
    console.error("Login error:", err);
    res.status(500).send("Error logging in");
  }
});




// Start server
const PORT = 4000;
app.listen(PORT, () => console.log(`✅ Server running at http://localhost:${PORT}`));