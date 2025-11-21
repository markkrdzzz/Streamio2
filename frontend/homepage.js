// ============================================
// HOMEPAGE MAIN FUNCTIONALITY
// ============================================

document.addEventListener('DOMContentLoaded', () => {
    // Get the references
    const options = document.querySelectorAll('.option-item');
    const videos = document.querySelectorAll('.video-placeholder');
    const videoResults = document.getElementById('videoResults');
    const eventsPage = document.getElementById('eventsPage');
    const createClubBtn = document.getElementById('createClubBtn');
    const createEventBtn = document.getElementById('createEventBtn');
    const eventsTitle = document.getElementById('eventsTitle');
    const isLoggedIn = !!localStorage.getItem('user');
    const filterButton = document.getElementById('filterButton');
    const filterOptions = document.getElementById('filterOptions');
    const saveChangesBtn = document.querySelector('.save-changes-btn');

    // --- Filter State ---
    const activeDropdownFilters = {
        category: null,
        school: null,
        location: null
    };

    function filterVideos(mainCategory, dropdownFilters) {
        videos.forEach(video => {
            const videoMainCategory = video.getAttribute('data-category');
            const videoCat = video.getAttribute('data-vid-category');
            const videoSchool = video.getAttribute('data-vid-school');
            const videoLocation = video.getAttribute('data-vid-location');

            const matchesMain = (mainCategory === 'all' || videoMainCategory === mainCategory);
            const matchesCat = !dropdownFilters.category || (videoCat === dropdownFilters.category);
            const matchesSchool = !dropdownFilters.school || (videoSchool === dropdownFilters.school);
            const matchesLocation = !dropdownFilters.location || (videoLocation === dropdownFilters.location);

            video.style.display = (matchesMain && matchesCat && matchesSchool && matchesLocation) ? 'flex' : 'none';
        });
    }

    // ADD: Click event for video placeholders to go to live page
    videos.forEach(video => {
        video.addEventListener('click', () => {
            window.location.href = 'live.html';
        });
        
        // Add cursor pointer style
        video.style.cursor = 'pointer';
    });

    // Shows the videos of the selected category OR shows events page
    function filterContent(category) {
        const mainCategory = category || 'all';
        const liveList = document.getElementById('liveList');
        const clubsList = document.getElementById('clubsList');

        if (category === 'events') {
            // Hide videos, show events
            videoResults.style.display = 'none';
            eventsPage.style.display = 'block';
            const schoolsPage = document.getElementById('schoolsPage');
            if (schoolsPage) schoolsPage.style.display = 'none';
            if (createClubBtn) createClubBtn.style.display = 'none';
            if (createEventBtn) createEventBtn.style.display = isLoggedIn ? 'block' : 'none';
            if (eventsTitle) eventsTitle.style.display = 'block';
            if (filterButton) filterButton.style.display = 'block';
            if (filterOptions) filterOptions.classList.remove('active');
        } else if (category === 'clubs') {
            // Show clubs list, hide events and live streams
            videoResults.style.display = 'flex';
            videoResults.style.justifyContent = 'center';
            eventsPage.style.display = 'none';
            const schoolsPage = document.getElementById('schoolsPage');
            if (schoolsPage) schoolsPage.style.display = 'none';
            if (liveList) {
                liveList.style.display = 'none';
                liveList.style.visibility = 'hidden';
                liveList.style.position = 'absolute';
                liveList.style.opacity = '0';
                liveList.innerHTML = ''; // Clear any content including "no one is live" message
            }
            if (clubsList) {
                clubsList.style.display = 'grid';
                clubsList.style.visibility = 'visible';
                clubsList.style.position = 'relative';
                clubsList.style.opacity = '1';
                clubsList.style.width = '100%';
            }
            if (createClubBtn) createClubBtn.style.display = isLoggedIn ? 'block' : 'none';
            if (createEventBtn) createEventBtn.style.display = 'none';
            if (eventsTitle) eventsTitle.style.display = 'none';
            if (filterButton) filterButton.style.display = 'none';
            if (filterOptions) filterOptions.classList.remove('active');
            
            // Load clubs
            loadClubs();
        } else if (category === 'all') {
            // Show live streams, hide clubs and events
            videoResults.style.display = 'grid';
            videoResults.style.justifyContent = '';
            eventsPage.style.display = 'none';
            const schoolsPage = document.getElementById('schoolsPage');
            if (schoolsPage) schoolsPage.style.display = 'none';
            if (liveList) {
                liveList.style.display = 'grid';
                liveList.style.visibility = 'visible';
                liveList.style.position = 'relative';
                liveList.style.opacity = '1';
                loadLiveStreams(); // Reload live streams
            }
            if (clubsList) {
                clubsList.style.display = 'none';
                clubsList.style.visibility = 'hidden';
                clubsList.style.position = 'absolute';
                clubsList.style.opacity = '0';
            }
            if (createClubBtn) createClubBtn.style.display = 'none';
            if (createEventBtn) createEventBtn.style.display = 'none';
            if (eventsTitle) eventsTitle.style.display = 'none';
            if (filterButton) filterButton.style.display = 'block';
        } else if (category === 'school') {
            // Show schools page
            videoResults.style.display = 'none';
            eventsPage.style.display = 'none';
            const schoolsPage = document.getElementById('schoolsPage');
            if (schoolsPage) schoolsPage.style.display = 'block';
            if (createClubBtn) createClubBtn.style.display = 'none';
            if (createEventBtn) createEventBtn.style.display = 'none';
            if (eventsTitle) eventsTitle.style.display = 'none';
            if (filterButton) filterButton.style.display = 'none';
            if (filterOptions) filterOptions.classList.remove('active');
        } else {
            // Show videos, hide events and create club button, hide filter
            videoResults.style.display = 'grid';
            eventsPage.style.display = 'none';
            const schoolsPage = document.getElementById('schoolsPage');
            if (schoolsPage) schoolsPage.style.display = 'none';
            if (liveList) liveList.style.display = 'none';
            if (clubsList) clubsList.style.display = 'none';
            if (createClubBtn) createClubBtn.style.display = 'none';
            if (createEventBtn) createEventBtn.style.display = 'none';
            if (eventsTitle) eventsTitle.style.display = 'none';
            if (filterButton) filterButton.style.display = 'none';
            if (filterOptions) filterOptions.classList.remove('active');
            
            // Filter videos by category
            videos.forEach(video => {
                const videoCategory = video.getAttribute('data-category');
                video.style.display = (videoCategory === category) ? 'flex' : 'none';
            });
        }
        // Apply filters
        filterVideos(mainCategory, activeDropdownFilters);
    }
    
    options.forEach(option => {
        option.addEventListener('click', (e) => {
            e.preventDefault(); 

            // Gets the category selected
            const selectedCategory = e.target.getAttribute('data-category');     

            options.forEach(item => item.classList.remove('active'));
            e.target.classList.add('active'); 

            // Filter content depending on category selected
            filterContent(selectedCategory);
        });
    });

    // --- Dropdown Filter Selection ---
    document.querySelectorAll('.filter-options-dropdown .dropdown-toggle').forEach(button => {
        const filterType = button.dataset.filter; // category / school / location
        const menu = button.nextElementSibling;

        if (!menu) return;

        menu.querySelectorAll('.dropdown-item').forEach(item => {
            item.addEventListener('click', (e) => {
                e.preventDefault();
                const selectedValue = item.textContent.trim();

                // Update button label
                button.innerHTML = `${filterType.charAt(0).toUpperCase() + filterType.slice(1)}: ${selectedValue} <span class="caret"></span>`;

                // Update state
                activeDropdownFilters[filterType] =
                    selectedValue.toLowerCase().includes('all') ? null : selectedValue;
            });
        });
    });

    // --- Save Changes ---
    if (saveChangesBtn) {
        saveChangesBtn.addEventListener('click', () => {
            const activeTab = document.querySelector('.option-item.active');
            const mainCategory = activeTab ? activeTab.getAttribute('data-category') : 'all';
            filterVideos(mainCategory, activeDropdownFilters);
            if (filterOptions) filterOptions.classList.remove('active');
        });
    }

    // initial visibility based on auth
    if (createClubBtn) createClubBtn.style.display = 'none';
    if (createEventBtn) createEventBtn.style.display = 'none';
    if (eventsTitle) eventsTitle.style.display = 'none';
    
    const initialCategory = document.querySelector('.option-item.active');
    if (initialCategory) {
        filterContent(initialCategory.getAttribute('data-category'));
    }

    // Filter button dropdown filter menu
    if (filterButton && filterOptions) {
        filterButton.addEventListener('click', () => {
            filterOptions.classList.toggle('active');
        });
    }
});

// ============================================
// EVENT CLUB DROPDOWN FUNCTIONALITY
// ============================================

document.addEventListener('DOMContentLoaded', () => {
    const eventClubSelect = document.getElementById('eventClub');
    const personalEventFields = document.getElementById('personalEventFields');
    const eventCategory = document.getElementById('eventCategory');
    const eventOrganizer = document.getElementById('eventOrganizer');

    if (eventClubSelect && personalEventFields) {
        eventClubSelect.addEventListener('change', () => {
            const hasClub = eventClubSelect.value !== '';
            
            if (hasClub) {
                // Hide personal fields and make them not required
                personalEventFields.style.display = 'none';
                eventCategory.removeAttribute('required');
                eventOrganizer.removeAttribute('required');
            } else {
                // Show personal fields and make them required
                personalEventFields.style.display = 'block';
                eventCategory.setAttribute('required', 'required');
                eventOrganizer.setAttribute('required', 'required');
            }
        });

        // Initialize on page load
        personalEventFields.style.display = eventClubSelect.value === '' ? 'block' : 'none';
    }
});

// ============================================
// EVENTS / SUPABASE LOGIC
// ============================================

(function() {
    // Backend API URL (change if your backend runs elsewhere)
    const API_URL = localStorage.getItem('API_URL') || 'http://localhost:4000';

    // Read Supabase config from localStorage if you still want direct realtime client usage
    const SUPABASE_URL = localStorage.getItem('SUPABASE_URL') || 'YOUR_SUPABASE_URL';
    const SUPABASE_ANON_KEY = localStorage.getItem('SUPABASE_ANON_KEY') || 'YOUR_SUPABASE_ANON_KEY';

    const dbNotConfigured = (!SUPABASE_URL || SUPABASE_URL === 'YOUR_SUPABASE_URL' || !SUPABASE_ANON_KEY || SUPABASE_ANON_KEY === 'YOUR_SUPABASE_ANON_KEY');

    if (dbNotConfigured) {
        console.warn('Supabase URL / ANON KEY not set. To enable events DB integration, store SUPABASE_URL and SUPABASE_ANON_KEY in localStorage or replace the placeholders in the script.');
    }

    // Robust client creation: support different UMD globals and ESM helpers
    let supabase = null;
    try {
        if (typeof createClient === 'function') {
            supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
            console.log('Supabase client created via createClient()');
        } else if (typeof supabaseJs !== 'undefined' && typeof supabaseJs.createClient === 'function') {
            supabase = supabaseJs.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
            console.log('Supabase client created via supabaseJs.createClient()');
        } else if (typeof supabase !== 'undefined' && typeof supabase.createClient === 'function') {
            // some UMDs expose a `supabase` global with createClient
            supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
            console.log('Supabase client created via window.supabase.createClient()');
        } else if (!dbNotConfigured) {
            console.warn('Supabase client factory not found on window. Check the loaded supabase script version.');
        }
    } catch (e) {
        console.error('Error creating Supabase client:', e);
    }

    // Helpers
    function formatDate(iso) {
        try {
            const d = new Date(iso);
            return d.toLocaleString();
        } catch (e) { return iso; }
    }

    // ========== UPDATED FUNCTION ==========
    function renderEventCard(ev) {
        // ev: { event_name, time, description, club_id, organizer, category }
        const list = document.getElementById('events-list');
        if (!list) return;

        // If the event has an id and we already rendered it, skip to avoid duplicates
        const idKey = ev.event_id || ev.id || ev.eventId || ev.eventID;
        if (idKey) {
            const existing = list.querySelector(`[data-event-id="${idKey}"]`);
            if (existing) {
                console.debug('Skipping render — event already present:', idKey);
                return;
            }
        }

        const card = document.createElement('div');
        card.className = 'card event-card shadow-sm';
        const body = document.createElement('div');
        body.className = 'card-body';

        // Event Title
        const title = document.createElement('h5');
        title.className = 'event-card-title';
        title.textContent = ev.event_name || 'Untitled Event';

        // Event Date/Time
        const subtitle = document.createElement('h6');
        subtitle.className = 'event-card-subtitle';
        subtitle.textContent = ev.time ? formatDate(ev.time) : '';

        // Parse location from description (first line)
        let locationText = '';
        let descriptionText = ev.description || '';
        if (descriptionText) {
            const parts = descriptionText.split('\n');
            if (parts.length > 1 && parts[0].trim().length < 200) {
                locationText = parts[0].trim();
                descriptionText = parts.slice(1).join('\n').trim();
            }
        }

        // Location
        if (locationText) {
            const loc = document.createElement('p');
            loc.className = 'event-card-location';
            loc.style.color = '#e0e0e0';
            loc.style.marginBottom = '8px';
            loc.innerHTML = `<strong>Location:</strong> ${locationText}`;
            body.appendChild(title);
            body.appendChild(subtitle);
            body.appendChild(loc);
        } else {
            body.appendChild(title);
            body.appendChild(subtitle);
        }

        // Club or Organizer info
        if (ev.club_id) {
            const clubInfo = document.createElement('p');
            clubInfo.className = 'event-card-location';
            clubInfo.style.color = '#e0e0e0';
            clubInfo.style.marginBottom = '8px';
            clubInfo.innerHTML = '<strong>Club:</strong> Loading...';
            
            // Fetch club name asynchronously
            getClubName(ev.club_id).then(clubName => {
                clubInfo.innerHTML = `<strong>Club:</strong> ${clubName}`;
            }).catch(() => {
                clubInfo.innerHTML = `<strong>Club:</strong> Club #${ev.club_id}`;
            });
            
            body.appendChild(clubInfo);
        } else if (ev.organizer) {
            const orgInfo = document.createElement('p');
            orgInfo.className = 'event-card-location';
            orgInfo.style.color = '#e0e0e0';
            orgInfo.style.marginBottom = '8px';
            orgInfo.innerHTML = `<strong>Organizer:</strong> ${ev.organizer}`;
            body.appendChild(orgInfo);
        }

        // Category (if exists and not tied to a club)
        if (ev.category && !ev.club_id) {
            const catInfo = document.createElement('p');
            catInfo.className = 'event-card-location';
            catInfo.style.color = '#e0e0e0';
            catInfo.style.marginBottom = '8px';
            catInfo.innerHTML = `<strong>Category:</strong> ${ev.category}`;
            body.appendChild(catInfo);
        }

        // Description
        if (descriptionText) {
            const desc = document.createElement('p');
            desc.className = 'event-card-description';
            desc.textContent = descriptionText;
            body.appendChild(desc);
        }

        card.appendChild(body);

        // Attach id attribute for deduping if present
        if (idKey) card.setAttribute('data-event-id', idKey);

        // Prepend newest events
        list.insertBefore(card, list.firstChild);
    }
    // ========== END UPDATED FUNCTION ==========

    // Cache for club names to avoid repeated API calls
    const clubNameCache = {};

    // Helper function to get club name from ID
    async function getClubName(clubId) {
        // Check cache first
        if (clubNameCache[clubId]) {
            return clubNameCache[clubId];
        }

        try {
            const response = await fetch(`${API_URL}/clubs/${clubId}`);
            if (response.ok) {
                const club = await response.json();
                clubNameCache[clubId] = club.club_name || `Club #${clubId}`;
                return clubNameCache[clubId];
            }
        } catch (error) {
            console.error('Error fetching club name:', error);
        }

        // Fallback to hardcoded names if API fails
        const clubMap = {
            '1': 'UTRGV CSCI Undergrads',
            '2': 'Frontera Devs',
            '3': 'Coding Society',
            '4': 'Game Dev Club',
            '5': 'UREC Sports'
        };
        return clubMap[clubId] || `Club #${clubId}`;
    }

    async function fetchEvents() {
        try {
            const res = await fetch(API_URL + '/events');
            if (!res.ok) throw new Error('Failed to fetch events: ' + res.statusText);
            const data = await res.json();

            // Clear existing dynamic cards
            const list = document.getElementById('events-list');
            if (!list) return;
            list.innerHTML = '';

            // Get current date/time
            const now = new Date();

            // Filter events to only include present and future events
            const futureEvents = data.filter(ev => {
                if (!ev.time) return true; // Include events without a time
                
                const eventDate = new Date(ev.time);
                return eventDate >= now; // Only include if event is now or in the future
            });

            // Sort events by date (earliest first)
            futureEvents.sort((a, b) => {
                if (!a.time) return 1;
                if (!b.time) return -1;
                return new Date(a.time) - new Date(b.time);
            });

            futureEvents.forEach(ev => renderEventCard(ev));
        } catch (err) {
            console.error('Error fetching events from backend:', err.message || err);
        }
    }

    async function createEvent(eventPayload) {
        try {
            const res = await fetch(API_URL + '/events', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(eventPayload)
            });

            if (!res.ok) {
                const text = await res.text().catch(() => res.statusText);
                throw new Error('API error: ' + text);
            }

            const created = await res.json();
            return created;
        } catch (err) {
            console.error('Error creating event via backend:', err.message || err);
            // fallback: render locally so user sees result
            const localEv = Object.assign({}, eventPayload);
            renderEventCard(localEv);
            return localEv;
        }
    }

    // Realtime subscription with fallback checks (v2 vs v1)
    function subscribeToInserts() {
        if (!supabase) {
            console.warn('Supabase client not available - realtime subscription disabled.');
            return null;
        }
        try {
            if (typeof supabase.channel === 'function') {
                // supabase-js v2 realtime
                const channel = supabase.channel('public:events')
                    .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'events' }, (payload) => {
                        if (payload && payload.new) renderEventCard(payload.new);
                    })
                    .subscribe();
                return channel;
            } else if (typeof supabase.from === 'function') {
                // older API fallback
                const sub = supabase.from('events').on('INSERT', payload => {
                    if (payload && payload.new) renderEventCard(payload.new);
                }).subscribe();
                return sub;
            }
        } catch (e) {
            console.warn('Realtime subscription failed (this is optional):', e.message || e);
        }
    }

    // Wire up form
    document.addEventListener('DOMContentLoaded', () => {
        // Load clubs into dropdown
        async function loadClubsDropdown() {
            try {
                const response = await fetch('http://localhost:4000/clubs');
                const clubs = await response.json();
                
                const eventClubSelect = document.getElementById('eventClub');
                if (!eventClubSelect) return;
                
                // Clear existing options except the first one (Personal Event)
                while (eventClubSelect.options.length > 1) {
                    eventClubSelect.remove(1);
                }
                
                // Add clubs from database
                clubs.forEach(club => {
                    const option = document.createElement('option');
                    option.value = club.id;
                    option.textContent = club.club_name;
                    eventClubSelect.appendChild(option);
                });
            } catch (error) {
                console.error('Error loading clubs for dropdown:', error);
            }
        }
        
        // Load clubs when page loads
        loadClubsDropdown();
        
        const form = document.getElementById('event-creation-form');
        if (!form) return;

        form.addEventListener('submit', async (e) => {
            e.preventDefault();
            const name = document.getElementById('eventName').value.trim();
            const time = document.getElementById('eventTime').value;
            const location = document.getElementById('eventLocation').value.trim();
            const description = document.getElementById('eventDescription').value.trim();
            const clubId = document.getElementById('eventClub')?.value || null;
            const category = document.getElementById('eventCategory')?.value || null;
            const organizer = document.getElementById('eventOrganizer')?.value || null;

            // Get user id from localStorage (depends on your auth payload)
            let userId = null;
            try {
                const raw = localStorage.getItem('user');
                if (raw) {
                    const u = JSON.parse(raw);
                    userId = u?.id || u?.user_id || u?.userId || null;
                }
            } catch (err) { /* ignore */ }

            const payload = {
                user_id: userId,
                event_name: name,
                club_id: clubId,
                category: category,
                organizer: organizer,
                school_id: null,
                time: time || null,
                event_logo: null,
                description: (location ? location + '\n\n' : '') + (description || '')
            };

            try {
                const created = await createEvent(payload);
                    // Hide modal
                const modalEl = document.getElementById('createEventModal');
                try {
                    const bsModal = bootstrap.Modal.getInstance(modalEl) || new bootstrap.Modal(modalEl);
                    bsModal.hide();
                } catch (err) {
                    // ignore
                }

                // Render created event only if it hasn't already been rendered
                if (created) {
                    const createdId = created.event_id || created.id || created.eventId || created.eventID;
                    const list = document.getElementById('events-list');
                    const already = createdId && list ? list.querySelector(`[data-event-id="${createdId}"]`) : null;
                    if (!already) renderEventCard(created);
                }

                // Reset form
                form.reset();
            } catch (err) {
                alert('Failed to create event. See console for details.');
            }
        });

        // Initial load
        fetchEvents();
        subscribeToInserts();

        // Handle club creation form
        const clubForm = document.getElementById('club-creation-form');
        if (clubForm) {
            clubForm.addEventListener('submit', async (e) => {
                e.preventDefault();
                
                const clubName = document.getElementById('clubName').value.trim();
                const clubCategory = document.getElementById('clubCategory').value;
                const clubDescription = document.getElementById('clubDescription').value.trim();
                const clubContact = document.getElementById('clubContact').value.trim();

                // Get user id from localStorage
                let userId = null;
                try {
                    const raw = localStorage.getItem('user');
                    if (raw) {
                        const u = JSON.parse(raw);
                        userId = u?.id || u?.user_id || u?.userId || null;
                    }
                } catch (err) { /* ignore */ }

                const clubPayload = {
                    club_name: clubName,
                    category: clubCategory,
                    description: clubDescription,
                    contact_email: clubContact,
                    created_by: userId
                };

                try {
                    const response = await fetch(API_URL + '/clubs', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify(clubPayload)
                    });

                    if (!response.ok) {
                        // Check if it's a duplicate name error
                        if (response.status === 409) {
                            const errorData = await response.json();
                            alert(errorData.message || 'A club with this name already exists. Please choose a different name.');
                            return;
                        }
                        throw new Error('Failed to create club');
                    }

                    const result = await response.json();
                    
                    // Hide modal
                    const modalEl = document.getElementById('createClubModal');
                    try {
                        const bsModal = bootstrap.Modal.getInstance(modalEl) || new bootstrap.Modal(modalEl);
                        bsModal.hide();
                    } catch (err) {
                        // ignore
                    }

                    // Reset form
                    clubForm.reset();
                    
                    // Reload clubs list if we're on the clubs page
                    const activeTab = document.querySelector('.option-item.active');
                    if (activeTab && activeTab.getAttribute('data-category') === 'clubs') {
                        loadClubs();
                    }
                    
                    alert('Club created successfully!');
                } catch (error) {
                    console.error('Error creating club:', error);
                    alert('Failed to create club. Please try again.');
                }
            });
        }
    });
})();

// ============================================
// LOAD LIVE STREAMS ON HOMEPAGE
// ============================================

async function loadLiveStreams() {
    try {
        const response = await fetch('http://localhost:4000/livestreams');
        const streams = await response.json();

        const liveList = document.getElementById('liveList');
        if (!liveList) return;

        liveList.innerHTML = '';

        if (streams.length === 0) {
            // Remove grid classes and add flex centering for empty state
            liveList.classList.remove('live-grid');
            liveList.style.display = 'flex';
            liveList.style.justifyContent = 'center';
            liveList.style.alignItems = 'center';
            liveList.style.minHeight = '300px';
            liveList.innerHTML = '<p style="color: #888; text-align: center; font-size: 18px;">No one is live right now</p>';
            return;
        }

        // Restore grid layout when there are streams
        liveList.classList.add('live-grid');
        liveList.style.display = '';
        liveList.style.justifyContent = '';
        liveList.style.alignItems = '';
        liveList.style.minHeight = '';

        streams.forEach(stream => {
            const card = document.createElement('div');
            card.className = 'video-placeholder';
            card.style.cursor = 'pointer';
            card.onclick = () => window.location.href = `live.html?stream=${stream.id}`;
            
            card.innerHTML = `
                <div class="thumbnail-block" style="position: relative; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);">
                    <div style="position: absolute; top: 10px; left: 10px; background: red; color: white; padding: 4px 10px; border-radius: 3px; font-weight: bold; font-size: 12px;">
                        🔴 LIVE
                    </div>
                    <div style="position: absolute; bottom: 10px; right: 10px; background: rgba(0,0,0,0.7); color: white; padding: 3px 8px; border-radius: 3px; font-size: 11px;">
                        👁️ ${stream.viewer_count || 0}
                    </div>
                </div>
                <div class="video-info">
                    <div class="profile-pic" style="background-image: url('${stream.users?.profile_picture || 'https://www.utrgv.edu/tutoring/_files/images/staff/no-pic.jpg'}'); background-size: cover; width: 40px; height: 40px;"></div>
                    <div style="flex: 1;">
                        <div class="title-block" style="color: #afd5eb; font-weight: 600;">${stream.title}</div>
                        <span class="video-filter-tag">${stream.users?.username || 'Unknown'}</span>
                        <span class="video-filter-tag">${stream.category || 'General'}</span>
                    </div>
                </div>
            `;
            
            liveList.appendChild(card);
        });

    } catch (error) {
        console.error('Error loading livestreams:', error);
        const liveList = document.getElementById('liveList');
        if (liveList) {
            liveList.classList.remove('live-grid');
            liveList.style.display = 'flex';
            liveList.style.justifyContent = 'center';
            liveList.style.alignItems = 'center';
            liveList.style.minHeight = '300px';
            liveList.innerHTML = '<p style="color: #888; text-align: center; font-size: 18px;">Unable to load streams</p>';
        }
    }
}

// ============================================
// LOAD CLUBS ON HOMEPAGE
// ============================================

async function loadClubs() {
    try {
        const response = await fetch('http://localhost:4000/clubs');
        const clubs = await response.json();

        const clubsList = document.getElementById('clubsList');
        if (!clubsList) return;

        clubsList.innerHTML = '';

        if (clubs.length === 0) {
            // Remove grid classes and add flex centering for empty state
            clubsList.classList.remove('live-grid');
            clubsList.style.display = 'flex';
            clubsList.style.justifyContent = 'center';
            clubsList.style.alignItems = 'center';
            clubsList.style.minHeight = '300px';
            clubsList.innerHTML = '<p style="color: #888; text-align: center; font-size: 18px;">No clubs available yet</p>';
            return;
        }

        // Restore grid layout when there are clubs
        clubsList.classList.add('live-grid');
        clubsList.style.display = '';
        clubsList.style.justifyContent = '';
        clubsList.style.alignItems = '';
        clubsList.style.minHeight = '';

        clubs.forEach(club => {
            const card = document.createElement('div');
            card.className = 'video-placeholder';
            card.style.cursor = 'pointer';
            
            // Generate a subtle dark gradient for minimalistic look
            const gradients = [
                'linear-gradient(135deg, #434343 0%, #000000 100%)',
                'linear-gradient(135deg, #4b4b4b 0%, #1a1a1a 100%)',
                'linear-gradient(135deg, #3e3e3e 0%, #0d0d0d 100%)',
                'linear-gradient(135deg, #525252 0%, #151515 100%)'
            ];
            const randomGradient = gradients[Math.floor(Math.random() * gradients.length)];
            
            card.innerHTML = `
                <div class="thumbnail-block" style="position: relative; background: ${randomGradient}; display: flex; align-items: center; justify-content: center;">
                    <div style="text-align: center; color: rgba(255, 255, 255, 0.4); font-size: 14px; font-weight: 300; letter-spacing: 1px;">
                        NO LOGO
                    </div>
                </div>
                <div class="video-info">
                    <div style="flex: 1;">
                        <div class="title-block" style="color: #afd5eb; font-weight: 600;">${club.club_name}</div>
                        <span class="video-filter-tag">${club.category || 'General'}</span>
                        ${club.description ? `<p style="color: #888; font-size: 12px; margin-top: 5px; overflow: hidden; text-overflow: ellipsis; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical;">${club.description}</p>` : ''}
                    </div>
                </div>
            `;
            
            clubsList.appendChild(card);
        });

    } catch (error) {
        console.error('Error loading clubs:', error);
        const clubsList = document.getElementById('clubsList');
        if (clubsList) {
            clubsList.classList.remove('live-grid');
            clubsList.style.display = 'flex';
            clubsList.style.justifyContent = 'center';
            clubsList.style.alignItems = 'center';
            clubsList.style.minHeight = '300px';
            clubsList.innerHTML = '<p style="color: #888; text-align: center; font-size: 18px;">Unable to load clubs</p>';
        }
    }
}

// Load livestreams when page loads
document.addEventListener('DOMContentLoaded', () => {
    loadLiveStreams();
    // Refresh every 10 seconds to keep live streams updated
    setInterval(loadLiveStreams, 10000);
});

// Refresh when page becomes visible (e.g., when returning from another tab/page)
document.addEventListener('visibilitychange', () => {
    if (!document.hidden) {
        loadLiveStreams();
    }
});
