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


        const homepageLiveList = document.getElementById('liveList'); 
        const lives = JSON.parse(localStorage.getItem('lives')) || [];

        if (lives.length === 0) {
        homepageLiveList.innerHTML = '<p class="text-center" style="color: #888;">No one is live right now</p>';
        } else {
        homepageLiveList.innerHTML = lives.map(live => `
            <div class="live-item">
            <div class="thumbnail-block">
                
            </div>
            <div class="video-info">
                <div class="profile-pic">
                    
                </div>
                <div>
                    <div class="title-block">
                        <h5 style="font-size: 14px; line-height: 1.2;font-weight: bold; width:100%; min-width: 0; color: #ffffff;">${live.title}</h5>
                    </div>
                    <span class="video-filter-tag" style="font-size: 11px;
                        font-weight: 500;
                        color: #bbb;
                        background-color: #555555;
                        padding: 2px 6px;
                        border-radius: 4px;
                        display: inline-block; 
                        margin-top: 4px; 
                        white-space: nowrap; ">${live.category}</span>
                </div>
            </div>
        </div>
        `).join('');
        }


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

        if (category === 'events') {
            // Hide videos, show events
            videoResults.style.display = 'none';
            eventsPage.style.display = 'block';
            if (createClubBtn) createClubBtn.style.display = 'none';
            if (createEventBtn) createEventBtn.style.display = isLoggedIn ? 'block' : 'none';
            if (eventsTitle) eventsTitle.style.display = 'block';
            if (filterButton) filterButton.style.display = 'block';
            if (filterOptions) filterOptions.classList.remove('active');
        } else if (category === 'clubs') {
            // Show videos, hide events, show create club button
            videoResults.style.display = 'grid';
            eventsPage.style.display = 'none';
            if (createClubBtn) createClubBtn.style.display = isLoggedIn ? 'block' : 'none';
            if (createEventBtn) createEventBtn.style.display = 'none';
            if (eventsTitle) eventsTitle.style.display = 'none';
            if (filterButton) filterButton.style.display = 'none';
            if (filterOptions) filterOptions.classList.remove('active');
            
            // Filter videos by category
            videos.forEach(video => {
                const videoCategory = video.getAttribute('data-category');
                video.style.display = (videoCategory === 'clubs') ? 'flex' : 'none';
            });
        } else if (category === 'all') {
            // Show videos, hide events and create club button, show filter
            videoResults.style.display = 'grid';
            eventsPage.style.display = 'none';
            if (createClubBtn) createClubBtn.style.display = 'none';
            if (createEventBtn) createEventBtn.style.display = 'none';
            if (eventsTitle) eventsTitle.style.display = 'none';
            if (filterButton) filterButton.style.display = 'block';
            
            // Show all videos
            videos.forEach(video => {
                video.style.display = 'flex';
            });
        } else {
            // Show videos, hide events and create club button, hide filter
            videoResults.style.display = 'grid';
            eventsPage.style.display = 'none';
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

            data.forEach(ev => renderEventCard(ev));
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
                    
                    alert('Club created successfully!');
                } catch (error) {
                    console.error('Error creating club:', error);
                    alert('Failed to create club. Please try again.');
                }
            });
        }
    });
})();