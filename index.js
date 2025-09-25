function showContent(section) {
    const display = document.getElementById('contentDisplay');
    const text = document.getElementById('contentText');
    const navItems = document.querySelectorAll('ul li');
    
    const content = {
        info: 'Information about our streaming service, help, and support.',
        announcements: 'Latest announcements, news, and updates from our platform.',
        events: 'Upcoming events, premieres, and special screenings.',
        live: 'Currently live streams, trending content, and real-time updates.'
    };
    
    // Update content
    text.textContent = content[section] || 'Content not found';
    display.classList.add('show');
    
    // Remove selected class from all items
    navItems.forEach(item => item.classList.remove('selected'));
    
    // Add selected class to clicked item
    const sectionMap = { 
        info: 0, 
        announcements: 1, 
        events: 2, 
        live: 3 
    };
    
    if (navItems[sectionMap[section]]) {
        navItems[sectionMap[section]].classList.add('selected');
    }
}

document.addEventListener('DOMContentLoaded', function() {
    // Set Info as default selected and show its content
    showContent('info');
});