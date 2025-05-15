// DOM Elements
const eventForm = document.getElementById('event-form');
const eventsContainer = document.getElementById('events-container');
const eventDetailsModal = document.getElementById('event-details-modal');
const modalContent = document.getElementById('modal-content');
const closeModal = document.getElementById('close-modal');
const tabButtons = document.querySelectorAll('.tab-btn');

// Event types for validation
const EVENT_TYPES = ['Workshop', 'Seminar', 'Sports', 'General'];

// Cache for events
let eventsCache = null;

// Load events from the server with optional filtering
async function loadEvents(type = 'All') {
    try {
        // Only fetch if we don't have cached events
        if (!eventsCache) {
            const response = await fetch('http://localhost:3000/api/events');
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            eventsCache = await response.json();
        }

        // Filter events based on type
        const filteredEvents = type === 'All' 
            ? eventsCache 
            : eventsCache.filter(event => event.type === type);

        // Update UI
        renderEvents(filteredEvents);
        
        // Update active tab
        updateActiveTab(type);
    } catch (error) {
        console.error('Error loading events:', error);
        showError('Error loading events. Please try again.');
    }
}

// Render events to the container
function renderEvents(events) {
    eventsContainer.innerHTML = '';
    if (events.length === 0) {
        eventsContainer.innerHTML = '<p class="no-events">No events found</p>';
        return;
    }
    events.forEach(event => {
        const eventCard = createEventCard(event);
        eventsContainer.appendChild(eventCard);
    });
}

// Update active tab state
function updateActiveTab(activeType) {
    tabButtons.forEach(btn => {
        btn.classList.toggle('active', btn.dataset.type === activeType);
    });
}

// Show error message
function showError(message) {
    alert(message); // Could be replaced with a more sophisticated error UI
}

// Show success message
function showSuccess(message) {
    alert(message); // Could be replaced with a more sophisticated success UI
}

// Validate event data
function validateEventData(eventData) {
    if (!eventData.name || !eventData.date || !eventData.location || !eventData.type) {
        throw new Error('All fields are required');
    }
    if (!EVENT_TYPES.includes(eventData.type)) {
        throw new Error('Invalid event type');
    }
    return true;
}

// Tab click handlers
tabButtons.forEach(btn => {
    btn.addEventListener('click', () => {
        const type = btn.dataset.type;
        loadEvents(type);
    });
});

// Create event card HTML
function createEventCard(event) {
    const card = document.createElement('div');
    card.className = 'event-card';
    card.innerHTML = `
        <h3>${event.name}</h3>
        <p><strong>Type:</strong> ${event.type || 'General'}</p>
        <p><strong>Date:</strong> ${new Date(event.date).toLocaleDateString()}</p>
        <p><strong>Location:</strong> ${event.location}</p>
        <p><strong>Description:</strong> ${event.description || 'No description available'}</p>
        <div class="event-actions">
            <button onclick="viewEvent('${event._id}')" class="view-button">View</button>
            <button onclick="deleteEvent('${event._id}')" class="delete-button">Delete</button>
            <button onclick="resetEvent('${event._id}')" class="reset-button">Reset</button>
        </div>
    `;
    return card;
}

// View event details
async function viewEvent(eventId) {
    try {
        const response = await fetch(`http://localhost:3000/api/events/${eventId}`);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const event = await response.json();
        
        modalContent.innerHTML = `
            <h2>${event.name}</h2>
            <p><strong>Type:</strong> ${event.type || 'General'}</p>
            <p><strong>Date:</strong> ${new Date(event.date).toLocaleDateString()}</p>
            <p><strong>Location:</strong> ${event.location}</p>
            <p><strong>Description:</strong> ${event.description || 'No description available'}</p>
        `;
        
        eventDetailsModal.style.display = 'block';
    } catch (error) {
        console.error('Error fetching event:', error);
        showError('Error fetching event details. Please try again.');
    }
}

// Delete event
async function deleteEvent(eventId) {
    if (confirm('Are you sure you want to delete this event?')) {
        try {
            const response = await fetch(`http://localhost:3000/api/events/${eventId}`, {
                method: 'DELETE'
            });
            
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            showSuccess('Event deleted successfully!');
            // Clear cache to force refresh
            eventsCache = null;
            // Reload events with current filter
            const activeType = document.querySelector('.tab-btn.active').dataset.type;
            loadEvents(activeType);
        } catch (error) {
            console.error('Error deleting event:', error);
            showError('Error deleting event. Please try again.');
        }
    }
}

// Reset event form
function resetEvent(eventId) {
    if (confirm('Are you sure you want to reset this event?')) {
        document.getElementById('event-form').reset();
    }
}

// Close modal
closeModal.addEventListener('click', () => {
    eventDetailsModal.style.display = 'none';
});

// Handle form submission
eventForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const eventData = {
        name: document.getElementById('event-name').value.trim(),
        date: document.getElementById('event-date').value,
        location: document.getElementById('event-location').value.trim(),
        description: document.getElementById('event-description').value.trim(),
        type: document.getElementById('event-type').value
    };

    try {
        // Validate event data
        validateEventData(eventData);

        const response = await fetch('http://localhost:3000/api/events', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(eventData)
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        showSuccess('Event created successfully!');
        eventForm.reset();
        // Clear cache to force refresh
        eventsCache = null;
        // Reload events with current filter
        const activeType = document.querySelector('.tab-btn.active').dataset.type;
        loadEvents(activeType);
    } catch (error) {
        console.error('Error creating event:', error);
        showError(error.message || 'Error creating event. Please try again.');
    }
});

// Initialize the application
document.addEventListener('DOMContentLoaded', () => {
    loadEvents('All'); // Load all events by default
}); 