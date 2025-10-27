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
  // Hide/show the "Change" button based on whether it's own profile
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
      clubs: userData.clubs || [],
      events: userData.events || []
    };
    
    // Update profile display
    const nameElements = document.querySelectorAll('.name');
    if (nameElements[0]) nameElements[0].textContent = profileData.displayName;
    
    document.getElementById('profilePicture').src = profileData.profilePicture;
    
    const bioElement = document.querySelector('.biography-section p:last-child');
    if (bioElement) bioElement.textContent = profileData.bio;
    
    // Store clubs and events data globally
    window.profileClubs = profileData.clubs;
    window.profileEvents = profileData.events;
    
  } catch (error) {
    console.error('Error loading profile:', error);
    
    // Fallback to mock data if fetch fails
    const profileData = {
      username: username,
      displayName: username,
      bio: 'Error loading profile data.',
      profilePicture: 'https://www.utrgv.edu/tutoring/_files/images/staff/no-pic.jpg',
      clubs: [],
      events: []
    };
    
    const nameElements = document.querySelectorAll('.name');
    if (nameElements[0]) nameElements[0].textContent = profileData.displayName;
    
    document.getElementById('profilePicture').src = profileData.profilePicture;
    
    const bioElement = document.querySelector('.biography-section p:last-child');
    if (bioElement) bioElement.textContent = profileData.bio;
    
    window.profileClubs = profileData.clubs;
    window.profileEvents = profileData.events;
  }
}

function initializeProfilePage() {
  const options = document.querySelectorAll('.option-item');
  const aboutPage = document.getElementById('aboutPage');
  const livePage = document.getElementById('livePage');
  const createLiveBtn = document.getElementById('createLiveBtn');
  const clubsPage = document.getElementById('clubsPage');
  const eventsPage = document.getElementById('eventsPage');

  const pfp = document.getElementById('profilePicture');
  const changePfpBtn = document.getElementById('changePfpBtn');

  const clubsList = document.getElementById('clubsList');
  const eventsList = document.getElementById('eventsList');

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
    const bioElement = document.querySelector('.biography-section p:last-child');
    
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
      
      const bioElement = document.querySelector('.biography-section p:last-child');
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

  // Show the clubs user is in
  function showClubs() {
    const userClubs = window.profileClubs || ["UTRGV CSCI Undergrads", "Frontera Devs", "Coding Society"];
    clubsList.innerHTML = "";
    if (userClubs.length === 0) {
      clubsList.innerHTML = "<p style='color: white;'>No clubs joined yet.</p>";
    } else {
      userClubs.forEach((club) => {
        const div = document.createElement("div");
        div.textContent = club;
        div.classList.add("p-2", "border", "rounded", "mb-2");
        div.style.backgroundColor = "#afd5eb";
        clubsList.appendChild(div);
      });
    }
  }

  // Show the events user has created
  function showEvents() {
    const userEvents = window.profileEvents || ["Career Fair 2025", "Poster Presentation"];
    eventsList.innerHTML = "";
    if (userEvents.length === 0) {
      eventsList.innerHTML = "<p style='color: white;'>No events created yet.</p>";
    } else {
      userEvents.forEach((event) => {
        const div = document.createElement("div");
        div.textContent = event;
        div.classList.add("p-2", "border", "rounded", "mb-2");
        div.style.backgroundColor = "#afd5eb";
        eventsList.appendChild(div);
      });
    }
  }

  function filterContent(category) {
    // Hide all pages by default
    aboutPage.style.display = 'none';
    livePage.style.display = 'none';
    createLiveBtn.style.display = 'none';
    clubsPage.style.display = 'none';
    eventsPage.style.display = 'none';

    // Show selected page and handle button visibility
    if (category === 'about') {
      aboutPage.style.display = '';
    } 
    else if (category === 'live') {
      livePage.style.display = '';
      // Only show Create Live button if viewing own profile
      if (isOwnProfile) {
        createLiveBtn.style.display = 'block';
      }
    } 
    else if (category === 'clubs') {
      clubsPage.style.display ='';
      showClubs();
    } 
    else if (category === 'events') {
      eventsPage.style.display = '';
      showEvents();
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