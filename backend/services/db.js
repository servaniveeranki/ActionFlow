// services/database.js

class Database {
  constructor() {
    this.actionItems = new Map();
    this.initializeSampleData();
  }

  initializeSampleData() {
    const sampleItems = [
      {
        id: '1',
        title: 'Send Q1 Financial Report',
        description: 'Include revenue metrics, growth projections, and market analysis',
        type: 'email',
        status: 'pending',
        priority: 'high',
        dueDate: new Date(Date.now() + 86400000).toISOString(),
        metadata: {
          emailTo: ['john@company.com', 'sarah@company.com', 'board@company.com'],
          emailSubject: 'Q1 2026 Financial Report',
          emailBody: 'Please find attached the Q1 financial report with detailed analysis.'
        },
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      },
      {
        id: '2',
        title: 'Daily Team Standup',
        description: 'Engineering team daily sync meeting',
        type: 'calendar',
        status: 'pending',
        priority: 'medium',
        dueDate: new Date(Date.now() + 3600000).toISOString(),
        metadata: {
          calendarEventDetails: {
            attendees: ['dev-team@company.com', 'john@company.com'],
            startTime: new Date(Date.now() + 3600000).toISOString(),
            duration: 30,
            location: 'Conference Room B',
            description: 'Daily standup to discuss progress and blockers'
          }
        },
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      },
      {
        id: '3',
        title: 'Follow up with client about contract',
        description: 'Check on project delivery timeline and next steps',
        type: 'reminder',
        status: 'pending',
        priority: 'urgent',
        dueDate: new Date(Date.now() + 7200000).toISOString(),
        metadata: {
          reminderTime: new Date(Date.now() + 7200000).toISOString(),
          reminderMessage: 'Time to follow up with the client!'
        },
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      },
      {
        id: '4',
        title: 'Review code pull requests',
        description: 'Check pending PRs and provide feedback',
        type: 'priority',
        status: 'pending',
        priority: 'high',
        dueDate: new Date(Date.now() + 14400000).toISOString(),
        metadata: {},
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }
    ];

    sampleItems.forEach(item => {
      this.actionItems.set(item.id, item);
    });
  }

  // Create
  create(item) {
    this.actionItems.set(item.id, item);
    return item;
  }

  // Read
  findById(id) {
    return this.actionItems.get(id);
  }

  findAll(filters = {}) {
    let items = Array.from(this.actionItems.values());

    // Apply filters
    if (filters.status) {
      items = items.filter(item => item.status === filters.status);
    }

    if (filters.type) {
      items = items.filter(item => item.type === filters.type);
    }

    if (filters.priority) {
      items = items.filter(item => item.priority === filters.priority);
    }

    // Sort by dueDate
    items.sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate));

    return items;
  }

  // Update
  update(id, updates) {
    const item = this.actionItems.get(id);
    if (!item) return null;

    const updatedItem = {
      ...item,
      ...updates,
      updatedAt: new Date().toISOString()
    };

    this.actionItems.set(id, updatedItem);
    return updatedItem;
  }

  // Delete
  delete(id) {
    return this.actionItems.delete(id);
  }

  // Get statistics
  getStats() {
    const items = Array.from(this.actionItems.values());
    
    return {
      total: items.length,
      pending: items.filter(i => i.status === 'pending').length,
      completed: items.filter(i => i.status === 'completed').length,
      failed: items.filter(i => i.status === 'failed').length,
      byType: {
        reminder: items.filter(i => i.type === 'reminder').length,
        email: items.filter(i => i.type === 'email').length,
        calendar: items.filter(i => i.type === 'calendar').length,
        priority: items.filter(i => i.type === 'priority').length
      },
      byPriority: {
        low: items.filter(i => i.priority === 'low').length,
        medium: items.filter(i => i.priority === 'medium').length,
        high: items.filter(i => i.priority === 'high').length,
        urgent: items.filter(i => i.priority === 'urgent').length
      }
    };
  }

  // Get items due soon
  getDueSoon(hours = 24) {
    const now = Date.now();
    const threshold = now + (hours * 60 * 60 * 1000);
    
    return Array.from(this.actionItems.values())
      .filter(item => {
        const dueTime = new Date(item.dueDate).getTime();
        return item.status === 'pending' && dueTime >= now && dueTime <= threshold;
      })
      .sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate));
  }
}

module.exports = new Database();