// services/calendarService.js

class CalendarService {
  constructor() {
    this.events = new Map();
  }

  // In a real implementation, this would integrate with Google Calendar API or similar
  async createCalendarEvent(actionItem) {
    try {
      const { calendarEventDetails } = actionItem.metadata;
      
      if (!calendarEventDetails) {
        throw new Error('Calendar event details are missing');
      }

      // Simulate calendar event creation
      const event = {
        id: 'cal-' + Date.now(),
        title: actionItem.title,
        description: calendarEventDetails.description || actionItem.description,
        startTime: calendarEventDetails.startTime,
        endTime: new Date(
          new Date(calendarEventDetails.startTime).getTime() + 
          (calendarEventDetails.duration * 60000)
        ).toISOString(),
        duration: calendarEventDetails.duration,
        location: calendarEventDetails.location,
        attendees: calendarEventDetails.attendees,
        organizer: 'system@actionitems.com',
        createdAt: new Date().toISOString(),
        status: 'confirmed'
      };

      this.events.set(event.id, event);

      console.log(' CALENDAR EVENT CREATED:');
      console.log(`   Title: ${event.title}`);
      console.log(`   Start: ${new Date(event.startTime).toLocaleString()}`);
      console.log(`   Duration: ${event.duration} minutes`);
      console.log(`   Location: ${event.location || 'Not specified'}`);
      console.log(`   Attendees: ${event.attendees.join(', ')}`);

      // Simulate sending invitations
      this.sendInvitations(event);

      return {
        success: true,
        event,
        calendarLink: `https://calendar.google.com/calendar/event?id=${event.id}`
      };
    } catch (error) {
      console.error('Failed to create calendar event:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  sendInvitations(event) {
    event.attendees.forEach(attendee => {
      console.log(`    Invitation sent to: ${attendee}`);
    });
  }

  // Get event by ID
  getEvent(eventId) {
    return this.events.get(eventId);
  }

  // Get all events
  getAllEvents() {
    return Array.from(this.events.values());
  }

  // Update event
  async updateEvent(eventId, updates) {
    const event = this.events.get(eventId);
    if (!event) {
      throw new Error('Event not found');
    }

    const updatedEvent = {
      ...event,
      ...updates,
      updatedAt: new Date().toISOString()
    };

    this.events.set(eventId, updatedEvent);
    
    console.log(` Calendar event updated: ${eventId}`);
    
    return {
      success: true,
      event: updatedEvent
    };
  }

  // Cancel event
  async cancelEvent(eventId) {
    const event = this.events.get(eventId);
    if (!event) {
      throw new Error('Event not found');
    }

    event.status = 'cancelled';
    event.cancelledAt = new Date().toISOString();

    console.log(` Calendar event cancelled: ${eventId}`);
    
    return {
      success: true,
      event
    };
  }

  // Generate iCal format (simplified)
  generateICalendar(event) {
    const ical = `BEGIN:VCALENDAR
VERSION:2.0
PRODID:-//Action Items//Calendar//EN
BEGIN:VEVENT
UID:${event.id}
DTSTAMP:${this.formatICalDate(new Date())}
DTSTART:${this.formatICalDate(new Date(event.startTime))}
DTEND:${this.formatICalDate(new Date(event.endTime))}
SUMMARY:${event.title}
DESCRIPTION:${event.description}
LOCATION:${event.location || ''}
ORGANIZER:${event.organizer}
STATUS:${event.status.toUpperCase()}
END:VEVENT
END:VCALENDAR`;

    return ical;
  }

  formatICalDate(date) {
    return date.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
  }
}

module.exports = new CalendarService();