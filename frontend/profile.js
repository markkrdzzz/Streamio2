// Global variables to store profile data
let currentProfileUsername = '';
let isOwnProfile = false;

// require login: redirect to login.html if no user in localStorage
document.addEventListener('DOMContentLoaded', function() {
  const raw = localStorage.getItem('user');
  if (!raw) {
    window.location.replace('login.html');
    return;
  }
  
  // Get username from URL parameter
  const urlParams = new URLSearchParams(window.location.search);
  const profileUsername = urlParams.get('user');
  
  // Get logged-in user
  const loggedInUser = JSON.parse(raw);
  
  // Determine which user's profile to display
  currentProfileUsername = profileUsername || loggedInUser.username;
  isOwnProfile = currentProfileUsername === loggedInUser.username;
  
  // Load profile data
  loadProfileData(currentProfileUsername, loggedInUser.username);
  
  // Initialize page functionality
  initializeProfilePage();
});

async function loadProfileData(username, loggedInUsername) {
  // Hide/show the "Edit" button based on whether it's own profile
  const changePfpBtn = document.getElementById('changePfpBtn');
  if (changePfpBtn) {
    changePfpBtn.style.display = isOwnProfile ? 'block' : 'none';
  }
  
  try {
    // Fetch user data from backend
    const response = await fetch(`http://localhost:4000/users/${username}`);
    
    if (!response.ok) {
      throw new Error('User not found');
    }
    
    const userData = await response.json();
    
    // Create profile data from database
    const profileData = {
      username: userData.username,
      displayName: userData.name || userData.username,
      bio: userData.bio || 'No bio yet.',
      profilePicture: userData.profile_picture || 'https://www.utrgv.edu/tutoring/_files/images/staff/no-pic.jpg',
      userId: userData.user_id
    };
    
    // Update profile display
    const nameElements = document.querySelectorAll('.name');
    if (nameElements[0]) nameElements[0].textContent = profileData.displayName;
    
    document.getElementById('profilePicture').src = profileData.profilePicture;
    
    const bioElement = document.getElementById('bioText');
    if (bioElement) bioElement.textContent = profileData.bio;
    
    // Load clubs and events for this user
    await loadUserClubs(profileData.userId);
    await loadUserEvents(profileData.userId);
    
  } catch (error) {
    console.error('Error loading profile:', error);
    
    // Fallback display
    const nameElements = document.querySelectorAll('.name');
    if (nameElements[0]) nameElements[0].textContent = username;
    
    document.getElementById('profilePicture').src = 'https://www.utrgv.edu/tutoring/_files/images/staff/no-pic.jpg';
    
    const bioElement = document.getElementById('bioText');
    if (bioElement) bioElement.textContent = 'Error loading profile data.';
  }
}

// Load user's clubs
async function loadUserClubs(userId) {
  const clubsList = document.getElementById('clubsList');
  if (!clubsList) return;

  try {
    const response = await fetch(`http://localhost:4000/clubs?created_by=${userId}`);
    
    if (!response.ok) {
      throw new Error('Failed to fetch clubs');
    }

    const clubs = await response.json();

    if (clubs.length === 0) {
      clubsList.innerHTML = '<p class="text-center" style="color: #888;">No clubs yet</p>';
      return;
    }

    // Display clubs
    clubsList.innerHTML = clubs.map(club => `
      <div class="card mb-3" style="background-color: #666666; color: white; border: 1px solid #444;" data-club-id="${club.club_id}">
        <div class="card-body">
          <h5 class="card-title" style="color: #afd5eb; font-weight: 700;">${club.club_name}</h5>
          <p class="card-text" style="color: #ffffffff;">${club.description || 'No description'}</p>
          <p>${club.category || 'General'}</p>
          ${club.contact_email ? `<p class="mt-2 mb-0" style="color: #ffffffff; font-size: 0.9rem;">Contact: ${club.contact_email}</p>` : ''}
          ${isOwnProfile ? `
            <div class="mt-3">
              <button class="btn btn-sm edit-club-btn" style="background-color: #afd5eb;" data-club-id="${club.club_id}">Edit</button>
              <button class="btn btn-sm btn-danger delete-club-btn" data-club-id="${club.club_id}">Delete</button>
            </div>
          ` : ''}
        </div>
      </div>
    `).join('');

    // Add event listeners for edit/delete buttons
    if (isOwnProfile) {
      document.querySelectorAll('.edit-club-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
          const clubId = e.target.dataset.clubId;
          const club = clubs.find(c => c.club_id == clubId);
          openEditClubModal(club);
        });
      });

      document.querySelectorAll('.delete-club-btn').forEach(btn => {
        btn.addEventListener('click', async (e) => {
          const clubId = e.target.dataset.clubId;
          if (confirm('Are you sure you want to delete this club?')) {
            await deleteClub(clubId);
          }
        });
      });
    }

  } catch (error) {
    console.error('Error loading clubs:', error);
    clubsList.innerHTML = '<p class="text-center" style="color: #888;">Error loading clubs</p>';
  }
}

// Load user's events
async function loadUserEvents(userId) {
  const eventsList = document.getElementById('eventsList');
  if (!eventsList) return;

  try {
    const response = await fetch(`http://localhost:4000/events?user_id=${userId}`);
    
    if (!response.ok) {
      throw new Error('Failed to fetch events');
    }

    const events = await response.json();

    if (events.length === 0) {
      eventsList.innerHTML = '<p class="text-center" style="color: #888;">No events yet</p>';
      return;
    }

    // Display events
    eventsList.innerHTML = events.map(event => {
      const eventDate = event.time ? new Date(event.time).toLocaleString() : 'TBA';
      
      // Parse location from description (first line)
      let location = '';
      let description = event.description || '';
      if (description) {
        const parts = description.split('\n');
        if (parts.length > 1 && parts[0].trim().length < 200) {
          location = parts[0].trim();
          description = parts.slice(1).join('\n').trim();
        }
      }

      // Displays event card
      return `
        <div class="card mb-3" style="background-color: #666666; color: white; border: 1px solid #444;" data-event-id="${event.event_id}">
          <div class="card-body">
            <h5 class="card-title" style="color: #afd5eb; font-weight: 700;">${event.event_name}</h5>
            <h6 class="card-subtitle mb-2" style="color: #ffffffff;">${eventDate}</h6>
            ${location ? `<p class="mb-2" style="color: #ffffffff;"><strong>Location:</strong> ${location}</p>` : ''}
            ${event.organizer ? `<p class="mb-2" style="color: #ffffffff;"><strong>Organizer:</strong> ${event.organizer}</p>` : ''}
            ${event.category ? `<p class="mb-2" style="color: #ffffffff;"><strong>Category:</strong> ${event.category}</p>` : ''}
            ${description ? `<p class="card-text" style="color: #ffffffff;">${description}</p>` : ''}
            ${isOwnProfile ? `
              <div class="mt-3">
                <button class="btn btn-sm edit-event-btn" style="background-color: #afd5eb;" data-event-id="${event.event_id}">Edit</button>
                <button class="btn btn-sm btn-danger delete-event-btn" data-event-id="${event.event_id}">Delete</button>
              </div>
            ` : ''}
          </div>
        </div>
      `;
    }).join('');

    // Add event listeners for edit/delete buttons
    if (isOwnProfile) {
      document.querySelectorAll('.edit-event-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
          const eventId = e.target.dataset.eventId;
          const event = events.find(ev => ev.event_id == eventId);
          openEditEventModal(event);
        });
      });

      document.querySelectorAll('.delete-event-btn').forEach(btn => {
        btn.addEventListener('click', async (e) => {
          const eventId = e.target.dataset.eventId;
          if (confirm('Are you sure you want to delete this event?')) {
            await deleteEvent(eventId);
          }
        });
      });
    }

  } catch (error) {
    console.error('Error loading events:', error);
    eventsList.innerHTML = '<p class="text-center" style="color: #888;">Error loading events</p>';
  }
}

function initializeProfilePage() {
  const options = document.querySelectorAll('.option-item');
  const aboutPage = document.getElementById('aboutPage');
  const livePage = document.getElementById('livePage');
  const createLiveBtn = document.getElementById('createLiveBtn');

  const pfp = document.getElementById('profilePicture');
  const changePfpBtn = document.getElementById('changePfpBtn');

  // Edit profile modal elements
  const editProfileForm = document.getElementById('edit-profile-form');
  const editName = document.getElementById('editName');
  const editBio = document.getElementById('editBio');
  const previewPicture = document.getElementById('previewPicture');
  const profilePictureInput = document.getElementById('profilePictureInput');
  const selectImageBtn = document.getElementById('selectImageBtn');
  let selectedImageFile = null;

  // When modal opens, populate with current data
  const editProfileModal = document.getElementById('editProfileModal');
  editProfileModal.addEventListener('show.bs.modal', () => {
    const nameElement = document.querySelector('.name');
    const bioElement = document.getElementById('bioText');
    
    editName.value = nameElement ? nameElement.textContent : '';
    editBio.value = bioElement ? bioElement.textContent : '';
    previewPicture.src = pfp.src;
    selectedImageFile = null;
  });

  // Handle image selection
  selectImageBtn.addEventListener('click', () => profilePictureInput.click());
  profilePictureInput.addEventListener('change', (event) => {
    const file = event.target.files[0];
    if (file) {
      selectedImageFile = file;
      const reader = new FileReader();
      reader.onload = (e) => {
        previewPicture.src = e.target.result;
      };
      reader.readAsDataURL(file);
    }
  });

  // Handle form submission
  editProfileForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const raw = localStorage.getItem('user');
    if (!raw) return;
    const user = JSON.parse(raw);

    try {
      // Prepare updated data
      const updatedData = {
        name: editName.value,
        bio: editBio.value
      };

      // If image was selected, convert to base64
      if (selectedImageFile) {
        const reader = new FileReader();
        reader.onload = async (e) => {
          updatedData.profile_picture = e.target.result;
          await saveProfileChanges(user.username, updatedData);
        };
        reader.readAsDataURL(selectedImageFile);
      } else {
        await saveProfileChanges(user.username, updatedData);
      }

    } catch (error) {
      console.error('Error updating profile:', error);
      alert('Failed to update profile. Please try again.');
    }
  });

  async function saveProfileChanges(username, updatedData) {
    try {
      const response = await fetch(`http://localhost:4000/users/${username}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedData)
      });

      if (!response.ok) {
        throw new Error('Failed to update profile');
      }

      const result = await response.json();

      // Update UI
      const nameElements = document.querySelectorAll('.name');
      if (nameElements[0]) nameElements[0].textContent = updatedData.name;
      
      const bioElement = document.getElementById('bioText');
      if (bioElement) bioElement.textContent = updatedData.bio;
      
      if (updatedData.profile_picture) {
        pfp.src = updatedData.profile_picture;
      }

      // Update localStorage
      const raw = localStorage.getItem('user');
      if (raw) {
        const user = JSON.parse(raw);
        user.name = updatedData.name;
        user.bio = updatedData.bio;
        if (updatedData.profile_picture) {
          user.profile_picture = updatedData.profile_picture;
        }
        localStorage.setItem('user', JSON.stringify(user));
      }

      // Close modal
      const modal = bootstrap.Modal.getInstance(document.getElementById('editProfileModal'));
      modal.hide();

      alert('Profile updated successfully!');

    } catch (error) {
      console.error('Error saving profile:', error);
      alert('Failed to save profile changes. Please try again.');
    }
  }

  function filterContent(category) {
    // Hide all pages by default
    if (aboutPage) aboutPage.style.display = 'none';
    if (livePage) livePage.style.display = 'none';
    if (createLiveBtn) createLiveBtn.style.display = 'none';

    // Show selected page and handle button visibility
    if (category === 'about') {
      if (aboutPage) aboutPage.style.display = 'block';
    } 
    else if (category === 'live') {
      if (livePage) livePage.style.display = 'block';
      // Only show Create Live button if viewing own profile
      if (isOwnProfile && createLiveBtn) {
        createLiveBtn.style.display = 'block';
      }
    }
  }

  options.forEach(option => {
    option.addEventListener('click', (e) => {
      e.preventDefault(); 
      const selectedCategory = e.target.getAttribute('data-category');     
      options.forEach(item => item.classList.remove('active'));
      e.target.classList.add('active'); 
      filterContent(selectedCategory);
    });
  });

  // Show the initial category (About by default)
  const initialCategory = document.querySelector('.option-item.active').getAttribute('data-category');
  filterContent(initialCategory); 
}

// Edit/delete club functions
function openEditClubModal(club) {
  // Create modal HTML if it doesn't exist
  let modal = document.getElementById('editClubModal');
  if (!modal) {
    const modalHTML = `
      <div class="modal fade" id="editClubModal" tabindex="-1" aria-hidden="true">
        <div class="modal-dialog">
          <div class="modal-content" style="background-color: #666666; color:white;">
            <div class="modal-header">
              <h5 class="modal-title">Edit Club</h5>
              <button type="button" class="btn-close btn-close-white" data-bs-dismiss="modal"></button>
            </div>
            <div class="modal-body">
              <form id="edit-club-form">
                <input type="hidden" id="editClubId">
                <div class="mb-3">
                  <label for="editClubName" class="form-label">Club Name</label>
                  <input type="text" class="form-control" id="editClubName" required>
                </div>
                <div class="mb-3">
                  <label for="editClubCategory" class="form-label">Category</label>
                  <select class="form-select" id="editClubCategory" required>
                    <option value="">Select a category</option>
                    <option value="sports">Sports</option>
                    <option value="academics">Academics</option>
                    <option value="gaming">Gaming</option>
                    <option value="arts">Arts</option>
                    <option value="technology">Technology</option>
                    <option value="other">Other</option>
                  </select>
                </div>
                <div class="mb-3">
                  <label for="editClubDescription" class="form-label">Description</label>
                  <textarea class="form-control" id="editClubDescription" rows="3" required></textarea>
                </div>
                <div class="mb-3">
                  <label for="editClubContact" class="form-label">Contact Email</label>
                  <input type="email" class="form-control" id="editClubContact" required>
                </div>
              </form>
            </div>
            <div class="modal-footer">
              <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cancel</button>
              <button type="submit" class="btn btn-primary custom-button" form="edit-club-form">Save Changes</button>
            </div>
          </div>
        </div>
      </div>
    `;
    document.body.insertAdjacentHTML('beforeend', modalHTML);
    modal = document.getElementById('editClubModal');
    
    // Add form submit handler
    document.getElementById('edit-club-form').addEventListener('submit', async (e) => {
      e.preventDefault();
      const clubId = document.getElementById('editClubId').value;
      const updatedData = {
        club_name: document.getElementById('editClubName').value,
        category: document.getElementById('editClubCategory').value,
        description: document.getElementById('editClubDescription').value,
        contact_email: document.getElementById('editClubContact').value
      };
      await updateClub(clubId, updatedData);
    });
  }
  
  // Populate form with club data
  document.getElementById('editClubId').value = club.club_id;
  document.getElementById('editClubName').value = club.club_name;
  document.getElementById('editClubCategory').value = club.category || '';
  document.getElementById('editClubDescription').value = club.description || '';
  document.getElementById('editClubContact').value = club.contact_email || '';
  
  // Show modal
  const bsModal = new bootstrap.Modal(modal);
  bsModal.show();
}

async function updateClub(clubId, updatedData) {
  try {
    const response = await fetch(`http://localhost:4000/clubs/${clubId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updatedData)
    });

    if (!response.ok) {
      throw new Error('Failed to update club');
    }

    // Close modal
    const modal = bootstrap.Modal.getInstance(document.getElementById('editClubModal'));
    modal.hide();

    alert('Club updated successfully!');
    
    // Reload clubs
    const raw = localStorage.getItem('user');
    if (raw) {
      const user = JSON.parse(raw);
      const urlParams = new URLSearchParams(window.location.search);
      const profileUsername = urlParams.get('user') || user.username;
      
      const userResponse = await fetch(`http://localhost:4000/users/${profileUsername}`);
      const userData = await userResponse.json();
      loadUserClubs(userData.user_id);
    }

  } catch (error) {
    console.error('Error updating club:', error);
    alert('Failed to update club. Please try again.');
  }
}

async function deleteClub(clubId) {
  try {
    const response = await fetch(`http://localhost:4000/clubs/${clubId}`, {
      method: 'DELETE'
    });

    if (!response.ok) {
      throw new Error('Failed to delete club');
    }

    alert('Club deleted successfully!');
    
    // Remove card from DOM
    const card = document.querySelector(`[data-club-id="${clubId}"]`);
    if (card) card.remove();
    
    // Check if no clubs left
    const clubsList = document.getElementById('clubsList');
    if (clubsList && clubsList.children.length === 0) {
      clubsList.innerHTML = '<p class="text-center" style="color: #888;">No clubs yet</p>';
    }

  } catch (error) {
    console.error('Error deleting club:', error);
    alert('Failed to delete club. Please try again.');
  }
}


// Edit/delete event functions
function openEditEventModal(event) {
  // Create modal HTML if it doesn't exist
  let modal = document.getElementById('editEventModal');
  if (!modal) {
    const modalHTML = `
      <div class="modal fade" id="editEventModal" tabindex="-1" aria-hidden="true">
        <div class="modal-dialog">
          <div class="modal-content" style="background-color: #353434; color:white;">
            <div class="modal-header">
              <h5 class="modal-title">Edit Event</h5>
              <button type="button" class="btn-close btn-close-white" data-bs-dismiss="modal"></button>
            </div>
            <div class="modal-body">
              <form id="edit-event-form">
                <input type="hidden" id="editEventId">
                <div class="mb-3">
                  <label for="editEventName" class="form-label">Event Name</label>
                  <input type="text" class="form-control" id="editEventName" required>
                </div>
                <div class="mb-3">
                  <label for="editEventTime" class="form-label">Date and Time</label>
                  <input type="datetime-local" class="form-control" id="editEventTime" required>
                </div>
                <div class="mb-3">
                  <label for="editEventLocation" class="form-label">Location</label>
                  <input type="text" class="form-control" id="editEventLocation" required>
                </div>
                <div class="mb-3">
                  <label for="editEventCategory" class="form-label">Category</label>
                  <select class="form-select" id="editEventCategory">
                    <option value="">Select a category</option>
                    <option value="Sports">Sports</option>
                    <option value="Academics">Academics</option>
                    <option value="Gaming">Gaming</option>
                    <option value="Arts">Arts</option>
                    <option value="Technology">Technology</option>
                    <option value="Social">Social</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
                <div class="mb-3">
                  <label for="editEventOrganizer" class="form-label">Organizer</label>
                  <input type="text" class="form-control" id="editEventOrganizer">
                </div>
                <div class="mb-3">
                  <label for="editEventDescription" class="form-label">Description</label>
                  <textarea class="form-control" id="editEventDescription" rows="3" required></textarea>
                </div>
              </form>
            </div>
            <div class="modal-footer">
              <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cancel</button>
              <button type="submit" class="btn btn-primary custom-button" form="edit-event-form">Save Changes</button>
            </div>
          </div>
        </div>
      </div>
    `;
    document.body.insertAdjacentHTML('beforeend', modalHTML);
    modal = document.getElementById('editEventModal');
    
    // Add form submit handler
    document.getElementById('edit-event-form').addEventListener('submit', async (e) => {
      e.preventDefault();
      const eventId = document.getElementById('editEventId').value;
      const location = document.getElementById('editEventLocation').value.trim();
      const description = document.getElementById('editEventDescription').value.trim();
      
      const updatedData = {
        event_name: document.getElementById('editEventName').value,
        time: document.getElementById('editEventTime').value,
        category: document.getElementById('editEventCategory').value || null,
        organizer: document.getElementById('editEventOrganizer').value || null,
        description: (location ? location + '\n\n' : '') + (description || '')
      };
      await updateEvent(eventId, updatedData);
    });
  }
  
  // Parse location from description
  let location = '';
  let description = event.description || '';
  if (description) {
    const parts = description.split('\n');
    if (parts.length > 1 && parts[0].trim().length < 200) {
      location = parts[0].trim();
      description = parts.slice(1).join('\n').trim();
    }
  }
  
  // Populate form with event data
  document.getElementById('editEventId').value = event.event_id;
  document.getElementById('editEventName').value = event.event_name;
  
  // Format datetime for input
  if (event.time) {
    const date = new Date(event.time);
    const formatted = date.toISOString().slice(0, 16);
    document.getElementById('editEventTime').value = formatted;
  }
  
  document.getElementById('editEventLocation').value = location;
  document.getElementById('editEventCategory').value = event.category || '';
  document.getElementById('editEventOrganizer').value = event.organizer || '';
  document.getElementById('editEventDescription').value = description;
  
  // Show modal
  const bsModal = new bootstrap.Modal(modal);
  bsModal.show();
}

async function updateEvent(eventId, updatedData) {
  try {
    const response = await fetch(`http://localhost:4000/events/${eventId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updatedData)
    });

    if (!response.ok) {
      throw new Error('Failed to update event');
    }

    // Close modal
    const modal = bootstrap.Modal.getInstance(document.getElementById('editEventModal'));
    modal.hide();

    alert('Event updated successfully!');
    
    // Reload events
    const raw = localStorage.getItem('user');
    if (raw) {
      const user = JSON.parse(raw);
      const urlParams = new URLSearchParams(window.location.search);
      const profileUsername = urlParams.get('user') || user.username;
      
      const userResponse = await fetch(`http://localhost:4000/users/${profileUsername}`);
      const userData = await userResponse.json();
      loadUserEvents(userData.user_id);
    }

  } catch (error) {
    console.error('Error updating event:', error);
    alert('Failed to update event. Please try again.');
  }
}

async function deleteEvent(eventId) {
  try {
    const response = await fetch(`http://localhost:4000/events/${eventId}`, {
      method: 'DELETE'
    });

    if (!response.ok) {
      throw new Error('Failed to delete event');
    }

    alert('Event deleted successfully!');
    
    // Remove card from DOM
    const card = document.querySelector(`[data-event-id="${eventId}"]`);
    if (card) card.remove();
    
    // Check if no events left
    const eventsList = document.getElementById('eventsList');
    if (eventsList && eventsList.children.length === 0) {
      eventsList.innerHTML = '<p class="text-center" style="color: #888;">No events yet</p>';
    }

  } catch (error) {
    console.error('Error deleting event:', error);
    alert('Failed to delete event. Please try again.');
  }
}