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


// EVENTS: fetch all events
app.get('/events', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('events')
      .select('*')
      .order('time', { ascending: false })
      .limit(100);

    if (error) {
      console.error('Supabase error fetching events:', error);
      return res.status(500).send('Error fetching events');
    }

    res.json(data);
  } catch (err) {
    console.error('Error in /events get:', err);
    res.status(500).send('Server error');
  }
});

// EVENTS: create new event
app.post('/events', async (req, res) => {
  try {
    const payload = req.body;

    // Basic validation
    if (!payload || !payload.event_name) {
      return res.status(400).send('Missing event_name');
    }

    const { data, error } = await supabase
      .from('events')
      .insert([payload])
      .select()
      .single();

    if (error) {
      console.error('Supabase error inserting event:', error);
      return res.status(500).send('Error creating event');
    }

    res.status(201).json(data);
  } catch (err) {
    console.error('Error in /events post:', err);
    res.status(500).send('Server error');
  }
});

// GET USER by username
app.get('/users/:username', async (req, res) => {
  const { username } = req.params;
  
  try {
    const { data, error } = await supabase
      .from('users')
      .select('user_id, username, email, name, bio, profile_picture')
      .eq('username', username)
      .single();
    
    if (error || !data) {
      return res.status(404).send('User not found');
    }
    
    // TODO: Fetch user's clubs and events from your database
    // For now, returning empty arrays
    res.json({
      ...data,
      clubs: [], // Replace with actual clubs query
      events: [] // Replace with actual events query
    });
    
  } catch (err) {
    console.error('Error fetching user:', err);
    res.status(500).send('Server error');
  }
});


// UPDATE USER profile
app.put('/users/:username', async (req, res) => {
  const { username } = req.params;
  const { name, bio, profile_picture } = req.body;
  
  try {
    const updateData = {};
    if (name !== undefined) updateData.name = name;
    if (bio !== undefined) updateData.bio = bio;
    if (profile_picture !== undefined) updateData.profile_picture = profile_picture;
    
    const { data, error } = await supabase
      .from('users')
      .update(updateData)
      .eq('username', username)
      .select()
      .single();
    
    if (error) {
      console.error('Error updating user:', error);
      return res.status(500).send('Error updating profile');
    }
    
    res.json({ message: 'Profile updated successfully', user: data });
    
  } catch (err) {
    console.error('Error updating user:', err);
    res.status(500).send('Server error');
  }
});




// Start server
const PORT = 4000;
app.listen(PORT, () => console.log(`Server running at http://localhost:${PORT}`));