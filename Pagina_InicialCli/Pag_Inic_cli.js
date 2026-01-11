// Initialize variables
let events = JSON.parse(localStorage.getItem('calendarEvents')) || [];
let currentView = 'calendar';
let currentDate = new Date();
let agendaDate = new Date(2025, 9, 1); // October 2025
let editingEventId = null;

// Time slots for agenda view
const timeSlots = [
    '08:00', '09:00', '10:00', '11:00', '12:00',
    '13:00', '14:00', '15:00', '16:00', '17:00'
];

// Format date as "Month Year"
function formatMonthYear(date) {
    return date.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' });
}

// Format date as "Day Month Year"
function formatDayMonthYear(date) {
    return date.toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
}

// Generate unique ID for events
function generateId() {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
}

// Initialize the application
document.addEventListener('DOMContentLoaded', function () {
    // Initialize FullCalendar
    initCalendar();

    // Initialize agenda view
    initAgenda();

    // Set up event listeners
    setupEventListeners();

    // Update current time indicator
    updateCurrentTime();
    setInterval(updateCurrentTime, 60000); // Update every minute
});

// Initialize FullCalendar
function initCalendar() {
    const calendarEl = document.getElementById('calendar');
    const calendar = new FullCalendar.Calendar(calendarEl, {
        initialView: 'dayGridMonth',
        locale: 'pt-br',
        headerToolbar: false,
        events: events.map(event => ({
            id: event.id,
            title: event.title,
            start: event.date + 'T' + event.time,
            color: event.color,
            description: event.description
        })),
        eventClick: function (info) {
            openEditModal(info.event);
        },
        dateClick: function (info) {
            openCreateModal(info.dateStr);
        },
        datesSet: function (info) {
            document.getElementById('currentMonth').textContent =
                formatMonthYear(info.view.currentStart);
            currentDate = info.view.currentStart;
        }
    });

    calendar.render();
    window.calendar = calendar;

    // Update month title
    document.getElementById('currentMonth').textContent =
        formatMonthYear(calendar.view.currentStart);
}

// Initialize agenda view
function initAgenda() {
    // Update agenda date display
    document.getElementById('agendaDate').textContent =
        formatDayMonthYear(agendaDate);

    // Populate events column
    populateAgendaEvents();
}

// Populate agenda events
function populateAgendaEvents() {
    const eventsColumn = document.getElementById('eventsColumn');
    eventsColumn.innerHTML = '';

    // Filter events for the agenda date
    const agendaDateStr = agendaDate.toISOString().split('T')[0];
    const dayEvents = events.filter(event => event.date === agendaDateStr);

    // Create event slots for each time slot
    timeSlots.forEach(time => {
        const eventSlot = document.createElement('div');
        eventSlot.className = 'event-slot';
        eventSlot.dataset.time = time;

        // Find event for this time slot
        const eventForSlot = dayEvents.find(event => event.time === time + ':00');

        if (eventForSlot) {
            eventSlot.innerHTML = `
                        <div class="event-item" data-id="${eventForSlot.id}" style="border-left-color: ${eventForSlot.color};">
                            <div class="event-title">${eventForSlot.title}</div>
                            <div class="event-time">${formatTime(eventForSlot.time)}</div>
                        </div>
                    `;
        } else {
            eventSlot.innerHTML = `
                        <div class="event-item empty-event" data-time="${time}">
                            <span>No events scheduled</span>
                        </div>
                    `;
        }

        eventsColumn.appendChild(eventSlot);
    });

    // Add click events to event items
    document.querySelectorAll('.event-item').forEach(item => {
        item.addEventListener('click', function () {
            const eventId = this.dataset.id;
            if (eventId) {
                const event = events.find(e => e.id === eventId);
                if (event) openEditModalFromAgenda(event);
            } else {
                const time = this.dataset.time;
                openCreateModalForAgenda(time);
            }
        });
    });
}

// Format time from "HH:MM:SS" to "HH:MM AM/PM"
function formatTime(timeStr) {
    const [hours, minutes] = timeStr.split(':');
    const hour = parseInt(hours);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const displayHour = hour % 12 || 12;
    return `${displayHour}:${minutes} ${ampm}`;
}

// Set up event listeners
function setupEventListeners() {
    // View tabs
    document.querySelectorAll('.view-tab').forEach(tab => {
        tab.addEventListener('click', function () {
            const view = this.dataset.view;
            switchView(view);

            // Update active tab
            document.querySelectorAll('.view-tab').forEach(t => t.classList.remove('active'));
            this.classList.add('active');
        });
    });

    // Calendar navigation
    document.getElementById('prevMonth').addEventListener('click', function () {
        window.calendar.prev();
    });

    document.getElementById('nextMonth').addEventListener('click', function () {
        window.calendar.next();
    });

    document.getElementById('todayBtn').addEventListener('click', function () {
        window.calendar.today();
    });

    // Agenda navigation
    document.getElementById('prevDay').addEventListener('click', function () {
        agendaDate.setDate(agendaDate.getDate() - 1);
        updateAgenda();
    });

    document.getElementById('nextDay').addEventListener('click', function () {
        agendaDate.setDate(agendaDate.getDate() + 1);
        updateAgenda();
    });

    // Create event button
    document.getElementById('createEventBtn').addEventListener('click', function () {
        openCreateModal();
    });

    // Add event to agenda button
    document.getElementById('addEventToAgenda').addEventListener('click', function () {
        openCreateModalForAgenda();
    });

    // Save event button
    document.getElementById('saveEventBtn').addEventListener('click', saveEvent);

    // Search functionality
    document.getElementById('searchInput').addEventListener('input', function () {
        searchEvents(this.value);
    });
}

// Switch between views
function switchView(view) {
    currentView = view;

    // Hide all views
    document.querySelectorAll('.tab-content').forEach(view => {
        view.classList.remove('active');
    });

    // Show selected view
    if (view === 'calendar') {
        document.getElementById('calendarView').classList.add('active');
    } else if (view === 'agenda') {
        document.getElementById('agendaView').classList.add('active');
        updateAgenda();
    } else if (view === 'week' || view === 'day') {
        // For simplicity, we'll just show the calendar in week or day view
        alert(`View "${view}" would be implemented with FullCalendar's week or day view`);
        document.getElementById('calendarView').classList.add('active');
    }
}

// Update agenda view
function updateAgenda() {
    document.getElementById('agendaDate').textContent =
        formatDayMonthYear(agendaDate);
    populateAgendaEvents();
}

// Open create event modal
function openCreateModal(dateStr = null) {
    editingEventId = null;
    document.getElementById('modalTitle').textContent = 'Create New Event';
    document.getElementById('eventId').value = '';
    document.getElementById('eventTitle').value = '';
    document.getElementById('eventDescription').value = '';
    document.getElementById('eventColor').value = '#4361ee';

    // Set default date and time
    const today = new Date();
    const defaultDate = dateStr || today.toISOString().split('T')[0];
    document.getElementById('eventDate').value = defaultDate;

    // Set default time to next hour
    const nextHour = today.getHours() + 1;
    const defaultTime = (nextHour < 10 ? '0' : '') + nextHour + ':00';
    document.getElementById('eventTime').value = defaultTime;

    // Show modal
    const modal = new bootstrap.Modal(document.getElementById('eventModal'));
    modal.show();
}

// Open create event modal for agenda time slot
function openCreateModalForAgenda(time = null) {
    openCreateModal();

    // Set date to agenda date
    const agendaDateStr = agendaDate.toISOString().split('T')[0];
    document.getElementById('eventDate').value = agendaDateStr;

    // Set time if provided
    if (time) {
        document.getElementById('eventTime').value = time;
    }
}

// Open edit event modal from calendar
function openEditModal(event) {
    editingEventId = event.id;
    const originalEvent = events.find(e => e.id === event.id);

    if (originalEvent) {
        document.getElementById('modalTitle').textContent = 'Edit Event';
        document.getElementById('eventId').value = originalEvent.id;
        document.getElementById('eventTitle').value = originalEvent.title;
        document.getElementById('eventDate').value = originalEvent.date;
        document.getElementById('eventTime').value = originalEvent.time.substring(0, 5);
        document.getElementById('eventDescription').value = originalEvent.description || '';
        document.getElementById('eventColor').value = originalEvent.color;

        const modal = new bootstrap.Modal(document.getElementById('eventModal'));
        modal.show();
    }
}

// Open edit event modal from agenda
function openEditModalFromAgenda(event) {
    editingEventId = event.id;

    document.getElementById('modalTitle').textContent = 'Edit Event';
    document.getElementById('eventId').value = event.id;
    document.getElementById('eventTitle').value = event.title;
    document.getElementById('eventDate').value = event.date;
    document.getElementById('eventTime').value = event.time.substring(0, 5);
    document.getElementById('eventDescription').value = event.description || '';
    document.getElementById('eventColor').value = event.color;

    const modal = new bootstrap.Modal(document.getElementById('eventModal'));
    modal.show();
}

// Save event
function saveEvent() {
    const eventId = document.getElementById('eventId').value;
    const title = document.getElementById('eventTitle').value.trim();
    const date = document.getElementById('eventDate').value;
    const time = document.getElementById('eventTime').value + ':00';
    const description = document.getElementById('eventDescription').value.trim();
    const color = document.getElementById('eventColor').value;

    if (!title) {
        alert('Please enter an event title');
        return;
    }

    const eventData = {
        id: eventId || generateId(),
        title,
        date,
        time,
        description,
        color
    };

    if (editingEventId) {
        // Update existing event
        const index = events.findIndex(e => e.id === editingEventId);
        if (index !== -1) {
            events[index] = eventData;
        }
    } else {
        // Add new event
        events.push(eventData);
    }

    // Save to localStorage
    localStorage.setItem('calendarEvents', JSON.stringify(events));

    // Update calendar and agenda
    if (window.calendar) {
        window.calendar.refetchEvents();
    }

    if (currentView === 'agenda') {
        updateAgenda();
    }

    // Close modal
    const modal = bootstrap.Modal.getInstance(document.getElementById('eventModal'));
    modal.hide();

    // Reset form
    document.getElementById('eventForm').reset();
}

// Search events
function searchEvents(query) {
    if (!query.trim()) {
        // Reset to all events
        if (window.calendar) {
            window.calendar.refetchEvents();
        }
        return;
    }

    const filteredEvents = events.filter(event =>
        event.title.toLowerCase().includes(query.toLowerCase()) ||
        (event.description && event.description.toLowerCase().includes(query.toLowerCase()))
    );

    // Update calendar with filtered events
    if (window.calendar) {
        window.calendar.removeAllEvents();
        window.calendar.addEventSource(
            filteredEvents.map(event => ({
                id: event.id,
                title: event.title,
                start: event.date + 'T' + event.time,
                color: event.color
            }))
        );
    }
}

// Update current time indicator
function updateCurrentTime() {
    const now = new Date();
    const currentHour = now.getHours();
    const currentMinute = now.getMinutes();
    const currentTimeStr = `${currentHour.toString().padStart(2, '0')}:${currentMinute.toString().padStart(2, '0')}`;

    // Update agenda view if active
    if (currentView === 'agenda') {
        // Remove current-time class from all time slots
        document.querySelectorAll('.time-slot').forEach(slot => {
            slot.classList.remove('current-time-slot');
            const currentSpan = slot.querySelector('.current-time');
            if (currentSpan) currentSpan.remove();
        });

        // Find closest time slot
        let closestSlot = null;
        let minDiff = Infinity;

        timeSlots.forEach((time, index) => {
            const [hour, minute] = time.split(':').map(Number);
            const slotTime = new Date();
            slotTime.setHours(hour, minute, 0, 0);

            const diff = Math.abs(slotTime - now);
            if (diff < minDiff) {
                minDiff = diff;
                closestSlot = index;
            }
        });

        // Mark closest time slot as current if within 30 minutes
        if (closestSlot !== null && minDiff < 30 * 60 * 1000) {
            const timeSlot = document.querySelectorAll('.time-slot')[closestSlot];
            timeSlot.classList.add('current-time-slot');

            // Check if already has current-time span
            if (!timeSlot.querySelector('.current-time')) {
                const currentSpan = document.createElement('span');
                currentSpan.className = 'current-time';
                currentSpan.textContent = 'NOW';
                timeSlot.appendChild(currentSpan);
            }
        }
    }
}

// ========== FUNÇÕES PARA OS CARDS EXPANSÍVEIS ==========

// Função para expandir/recolher cards
function toggleCard(card) {
    card.classList.toggle('expanded');
    
    // Opcional: fechar outros cards quando um abrir
    closeOtherCards(card);
}

// Fechar outros cards quando um for aberto (opcional)
function closeOtherCards(currentCard) {
    const allCards = document.querySelectorAll('.card.expandable');
    allCards.forEach(card => {
        if (card !== currentCard && card.classList.contains('expanded')) {
            card.classList.remove('expanded');
        }
    });
}

// Inicializar cards expansíveis quando o DOM carregar
document.addEventListener('DOMContentLoaded', function() {
    // Configurar eventos para os cards expansíveis
    
    // Adicionar evento de clique para os ícones de seta
    const expandIcons = document.querySelectorAll('.expand-icon');
    
    expandIcons.forEach(icon => {
        icon.addEventListener('click', function(e) {
            e.stopPropagation(); // Previne que o clique no ícone ative o card também
            const card = this.closest('.card.expandable');
            toggleCard(card);
        });
    });
    
    // Adicionar evento para os botões de ação
    const actionButtons = document.querySelectorAll('.btn-card-action');
    actionButtons.forEach(button => {
        button.addEventListener('click', function(e) {
            e.stopPropagation(); // Previne que o clique no botão feche o card
            // Adicione aqui as ações dos botões
            if (this.classList.contains('btn-view')) {
                alert('Visualizar detalhes');
            } else if (this.classList.contains('btn-edit')) {
                alert('Editar consulta');
            } else if (this.classList.contains('btn-delete')) {
                if (confirm('Tem certeza que deseja excluir esta consulta?')) {
                    alert('Consulta excluída');
                }
            }
        });
    });
});

        
    
    
