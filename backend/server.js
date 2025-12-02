import express from "express";
import { createClient } from '@supabase/supabase-js';
import bcrypt from "bcrypt";
import cors from "cors";
import { createServer } from 'http';
import { Server } from 'socket.io';

const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"]
  }
});

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
    
    // Debug: Log the data being returned
    console.log('Clubs fetched:', JSON.stringify(data, null, 2));
    
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

    // Check if club name already exists (case-insensitive)
    const { data: existingClubs, error: checkError } = await supabase
      .from('clubs')
      .select('id, club_name')
      .ilike('club_name', payload.club_name);

    if (checkError) {
      console.error('Error checking for duplicate club name:', checkError);
    }

    if (existingClubs && existingClubs.length > 0) {
      return res.status(409).json({ 
        error: 'Club name already exists',
        message: 'A club with this name already exists. Please choose a different name.'
      });
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
      .select('id, club_name, category, description')
      .eq('id', id)
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
    // If updating club name, check if the new name already exists (excluding current club)
    if (club_name !== undefined) {
      const { data: existingClubs, error: checkError } = await supabase
        .from('clubs')
        .select('id, club_name')
        .ilike('club_name', club_name)
        .neq('id', id);

      if (checkError) {
        console.error('Error checking for duplicate club name:', checkError);
      }

      if (existingClubs && existingClubs.length > 0) {
        return res.status(409).json({ 
          error: 'Club name already exists',
          message: 'A club with this name already exists. Please choose a different name.'
        });
      }
    }

    const updateData = {};
    if (club_name !== undefined) updateData.club_name = club_name;
    if (category !== undefined) updateData.category = category;
    if (description !== undefined) updateData.description = description;
    if (contact_email !== undefined) updateData.contact_email = contact_email;
    
    const { data, error } = await supabase
      .from('clubs')
      .update(updateData)
      .eq('id', id)
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
    // First, update any events that reference this club to have null club_id
    const { error: updateError } = await supabase
      .from('events')
      .update({ club_id: null })
      .eq('club_id', id);
    
    if (updateError) {
      console.error('Error updating events for club deletion:', updateError);
      // Continue anyway - the club might not have events
    }
    
    // Then delete the club
    const { error } = await supabase
      .from('clubs')
      .delete()
      .eq('id', id);
    
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

// ============================================
// LIVESTREAM ROUTES
// ============================================

// Get all active livestreams
app.get('/livestreams', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('livestreams')
      .select('*, users(username, name, profile_picture)')
      .eq('is_live', true)
      .order('created_at', { ascending: false });
    
    if (error) {
      console.error('Error fetching livestreams:', error);
      return res.status(500).send('Error fetching livestreams');
    }
    
    res.json(data || []);
  } catch (err) {
    console.error('Error in /livestreams get:', err);
    res.status(500).send('Server error');
  }
});

// Get specific livestream
app.get('/livestreams/:id', async (req, res) => {
  const { id } = req.params;
  
  try {
    const { data, error } = await supabase
      .from('livestreams')
      .select('*, users(username, name, profile_picture)')
      .eq('id', id)
      .single();
    
    if (error || !data) {
      return res.status(404).send('Livestream not found');
    }
    
    res.json(data);
  } catch (err) {
    console.error('Error fetching livestream:', err);
    res.status(500).send('Server error');
  }
});

// Create new livestream
app.post('/livestreams', async (req, res) => {
  try {
    const { user_id, title, description, category, room_name } = req.body;

    if (!user_id || !title) {
      return res.status(400).send('Missing required fields');
    }

    const { data, error } = await supabase
      .from('livestreams')
      .insert([{
        user_id,
        title,
        description,
        category,
        room_name,
        is_live: true,
        viewer_count: 0
      }])
      .select()
      .single();

    if (error) {
      console.error('Supabase error inserting livestream:', error);
      return res.status(500).send('Error creating livestream');
    }

    res.status(201).json(data);
  } catch (err) {
    console.error('Error in /livestreams post:', err);
    res.status(500).send('Server error');
  }
});

// End livestream
app.delete('/livestreams/:id', async (req, res) => {
  const { id } = req.params;
  
  try {
    console.log(`Ending livestream with id: ${id}`);
    
    const { data, error } = await supabase
      .from('livestreams')
      .update({ is_live: false, ended_at: new Date().toISOString() })
      .eq('id', id)
      .select();
    
    if (error) {
      console.error('Error ending livestream:', error);
      return res.status(500).send('Error ending livestream');
    }
    
    console.log('Livestream ended successfully:', data);
    res.json({ message: 'Livestream ended successfully' });
  } catch (err) {
    console.error('Error ending livestream:', err);
    res.status(500).send('Server error');
  }
});

// Update viewer count
app.patch('/livestreams/:id/viewers', async (req, res) => {
  const { id } = req.params;
  const { count } = req.body;
  
  try {
    const { error } = await supabase
      .from('livestreams')
      .update({ viewer_count: count })
      .eq('id', id);
    
    if (error) {
      console.error('Error updating viewer count:', error);
      return res.status(500).send('Error updating viewer count');
    }
    
    res.json({ message: 'Viewer count updated' });
  } catch (err) {
    console.error('Error updating viewer count:', err);
    res.status(500).send('Server error');
  }
});

// Clean up old livestreams (mark streams older than 1 hour as ended)
async function cleanupOldStreams() {
  try {
    const oneHourAgo = new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString();
    
    const { data, error } = await supabase
      .from('livestreams')
      .update({ is_live: false, ended_at: new Date().toISOString() })
      .eq('is_live', true)
      .lt('created_at', oneHourAgo)
      .select();
    
    if (error) {
      console.error('Error cleaning up old streams:', error);
    } else if (data && data.length > 0) {
      console.log(`Cleaned up ${data.length} old stream(s)`);
    }
  } catch (err) {
    console.error('Error in cleanupOldStreams:', err);
  }
}

// Manual endpoint to end all active streams (for cleanup)
app.post('/livestreams/cleanup-all', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('livestreams')
      .update({ is_live: false, ended_at: new Date().toISOString() })
      .eq('is_live', true)
      .select();
    
    if (error) {
      console.error('Error cleaning up all streams:', error);
      return res.status(500).send('Error cleaning up streams');
    }
    
    res.json({ message: `Successfully ended ${data?.length || 0} stream(s)`, streams: data });
  } catch (err) {
    console.error('Error in cleanup-all endpoint:', err);
    res.status(500).send('Server error');
  }
});

// Clean up past events (delete events whose date/time has passed)
async function cleanupPastEvents() {
  try {
    const now = new Date().toISOString();
    
    const { data, error } = await supabase
      .from('events')
      .delete()
      .lt('time', now)
      .not('time', 'is', null)
      .select();
    
    if (error) {
      console.error('Error cleaning up past events:', error);
    } else if (data && data.length > 0) {
      console.log(`Cleaned up ${data.length} past event(s)`);
    }
  } catch (err) {
    console.error('Error in cleanupPastEvents:', err);
  }
}

// Run cleanup on server start
cleanupOldStreams();
cleanupPastEvents();

// Run cleanup every hour
setInterval(cleanupOldStreams, 60 * 60 * 1000);
setInterval(cleanupPastEvents, 60 * 60 * 1000);

// ============================================
// SOCKET.IO FOR WEBRTC SIGNALING
// ============================================

const rooms = new Map(); // Store room information

io.on('connection', (socket) => {
  console.log('User connected:', socket.id);

  // Broadcaster joins and creates a room
  socket.on('broadcaster', (roomId) => {
    console.log('Broadcaster joined room:', roomId);
    rooms.set(roomId, { broadcaster: socket.id, viewers: new Set() });
    socket.join(roomId);
    socket.roomId = roomId;
    socket.isBroadcaster = true;
  });

  // Viewer joins a room
  socket.on('viewer', (roomId) => {
    console.log('Viewer joined room:', roomId);
    const room = rooms.get(roomId);
    if (room) {
      room.viewers.add(socket.id);
      socket.join(roomId);
      socket.roomId = roomId;
      socket.isBroadcaster = false;
      
      // Notify broadcaster that a viewer joined
      socket.to(room.broadcaster).emit('viewer-joined', socket.id);
    } else {
      socket.emit('error', 'Room not found');
    }
  });

  // Forward WebRTC offer from broadcaster to specific viewer
  socket.on('offer', (data) => {
    console.log('Offer sent from broadcaster to viewer:', data.to);
    socket.to(data.to).emit('offer', {
      offer: data.offer,
      from: socket.id
    });
  });

  // Forward WebRTC answer from viewer to broadcaster
  socket.on('answer', (data) => {
    console.log('Answer sent from viewer to broadcaster');
    socket.to(data.to).emit('answer', {
      answer: data.answer,
      from: socket.id
    });
  });

  // Forward ICE candidates
  socket.on('ice-candidate', (data) => {
    socket.to(data.to).emit('ice-candidate', {
      candidate: data.candidate,
      from: socket.id
    });
  });

  // Handle disconnect
  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id);
    
    if (socket.roomId) {
      const room = rooms.get(socket.roomId);
      if (room) {
        if (socket.isBroadcaster) {
          // Broadcaster left, notify all viewers
          io.to(socket.roomId).emit('broadcaster-left');
          rooms.delete(socket.roomId);
        } else {
          // Viewer left
          room.viewers.delete(socket.id);
          socket.to(room.broadcaster).emit('viewer-left', socket.id);
        }
      }
    }
  });
});

// Start server
const PORT = 4000;
httpServer.listen(PORT, () => console.log(`Server running at http://localhost:${PORT}`));