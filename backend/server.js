import express from "express";
import { createClient } from '@supabase/supabase-js';
import bcrypt from "bcrypt";
import cors from "cors";

const app = express();
app.use(cors());
app.use(express.json());

// Supabase connection with API keys
const supabaseUrl = 'https://kqsfaqxlwdrxevvshpil.supabase.co';
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imtxc2ZhcXhsd2RyeGV2dnNocGlsIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2MDAyMzE1MSwiZXhwIjoyMDc1NTk5MTUxfQ.9gEgBNn4u4niCJu1ChcH7DTEXdNc7-UscNt4ATZf03k';
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
          name: name || username,
          bio: '' 
        }
      ])
      .select();

    if (error) {
      console.error("Supabase error:", error);
      if (error.code === '23505') {
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

// Get events
app.get('/events', async (req, res) => {
  const { user_id } = req.query;
  
  try {
    let query = supabase
      .from('events')
      .select('*')
      .order('time', { ascending: false });
    
    // If user_id is provided, filter by that user
    if (user_id) {
      query = query.eq('user_id', user_id);
    } else {
      // Otherwise, limit to 100 recent events
      query = query.limit(100);
    }

    const { data, error } = await query;

    if (error) {
      console.error('Supabase error fetching events:', error);
      return res.status(500).send('Error fetching events');
    }

    res.json(data || []);
  } catch (err) {
    console.error('Error in /events get:', err);
    res.status(500).send('Server error');
  }
});

// EVENTS: create new event
app.post('/events', async (req, res) => {
  try {
    const payload = req.body;

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
    
    res.json(data);
    
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

// Get clubs
app.get('/clubs', async (req, res) => {
  const { created_by } = req.query;
  
  try {
    let query = supabase.from('clubs').select('*');
    
    // If created_by is provided, filter by that user
    if (created_by) {
      query = query.eq('created_by', created_by);
    }
    
    const { data, error } = await query;
    
    if (error) {
      console.error('Error fetching clubs:', error);
      return res.status(500).send('Error fetching clubs');
    }
    
    res.json(data || []);
    
  } catch (err) {
    console.error('Error in /clubs get:', err);
    res.status(500).send('Server error');
  }
});

// Create club
app.post('/clubs', async (req, res) => {
  try {
    const payload = req.body;

    if (!payload || !payload.club_name) {
      return res.status(400).send('Missing club_name');
    }

    const { data, error } = await supabase
      .from('clubs')
      .insert([payload])
      .select()
      .single();

    if (error) {
      console.error('Supabase error inserting club:', error);
      return res.status(500).send('Error creating club');
    }

    res.status(201).json(data);
  } catch (err) {
    console.error('Error in /clubs post:', err);
    res.status(500).send('Server error');
  }
});

// GET CLUB by ID
app.get('/clubs/:id', async (req, res) => {
  const { id } = req.params;
  
  try {
    const { data, error } = await supabase
      .from('clubs')
      .select('club_id, club_name, category, description')
      .eq('club_id', id)
      .single();
    
    if (error || !data) {
      return res.status(404).send('Club not found');
    }
    
    res.json(data);
    
  } catch (err) {
    console.error('Error fetching club:', err);
    res.status(500).send('Server error');
  }
});

// Update club
app.put('/clubs/:id', async (req, res) => {
  const { id } = req.params;
  const { club_name, category, description, contact_email } = req.body;
  
  try {
    const updateData = {};
    if (club_name !== undefined) updateData.club_name = club_name;
    if (category !== undefined) updateData.category = category;
    if (description !== undefined) updateData.description = description;
    if (contact_email !== undefined) updateData.contact_email = contact_email;
    
    const { data, error } = await supabase
      .from('clubs')
      .update(updateData)
      .eq('club_id', id)
      .select()
      .single();
    
    if (error) {
      console.error('Error updating club:', error);
      return res.status(500).send('Error updating club');
    }
    
    res.json({ message: 'Club updated successfully', club: data });
    
  } catch (err) {
    console.error('Error updating club:', err);
    res.status(500).send('Server error');
  }
});

// Delete club
app.delete('/clubs/:id', async (req, res) => {
  const { id } = req.params;
  
  try {
    const { error } = await supabase
      .from('clubs')
      .delete()
      .eq('club_id', id);
    
    if (error) {
      console.error('Error deleting club:', error);
      return res.status(500).send('Error deleting club');
    }
    
    res.json({ message: 'Club deleted successfully' });
    
  } catch (err) {
    console.error('Error deleting club:', err);
    res.status(500).send('Server error');
  }
});

// Update event
app.put('/events/:id', async (req, res) => {
  const { id } = req.params;
  const { event_name, time, description, club_id, category, organizer } = req.body;
  
  try {
    const updateData = {};
    if (event_name !== undefined) updateData.event_name = event_name;
    if (time !== undefined) updateData.time = time;
    if (description !== undefined) updateData.description = description;
    if (club_id !== undefined) updateData.club_id = club_id;
    if (category !== undefined) updateData.category = category;
    if (organizer !== undefined) updateData.organizer = organizer;
    
    const { data, error } = await supabase
      .from('events')
      .update(updateData)
      .eq('event_id', id)
      .select()
      .single();
    
    if (error) {
      console.error('Error updating event:', error);
      return res.status(500).send('Error updating event');
    }
    
    res.json({ message: 'Event updated successfully', event: data });
    
  } catch (err) {
    console.error('Error updating event:', err);
    res.status(500).send('Server error');
  }
});

// Delete event
app.delete('/events/:id', async (req, res) => {
  const { id } = req.params;
  
  try {
    const { error } = await supabase
      .from('events')
      .delete()
      .eq('event_id', id);
    
    if (error) {
      console.error('Error deleting event:', error);
      return res.status(500).send('Error deleting event');
    }
    
    res.json({ message: 'Event deleted successfully' });
    
  } catch (err) {
    console.error('Error deleting event:', err);
    res.status(500).send('Server error');
  }
});

// Start server
const PORT = 4000;
app.listen(PORT, () => console.log(`Server running at http://localhost:${PORT}`));