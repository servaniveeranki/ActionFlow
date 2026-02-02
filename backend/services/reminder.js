// services/reminderService.js

const cron = require('node-cron');
const database = require('./db');

class ReminderService {
  constructor() {
    this.reminders = new Map();
    this.startScheduler();
  }

  startScheduler() {
    // Check for due reminders every minute
    cron.schedule('* * * * *', () => {
      this.checkDueReminders();
    });

    console.log('Reminder scheduler started - checking every minute');
  }

  async checkDueReminders() {
    const now = new Date();
    const items = database.getDueSoon(0.1); // Items due in next 6 minutes

    for (const item of items) {
      if (item.type === 'reminder' && item.status === 'pending') {
        const reminderTime = new Date(item.metadata.reminderTime);
        
        if (reminderTime <= now && !this.reminders.has(item.id)) {
          await this.triggerReminder(item);
        }
      }
    }
  }

  async triggerReminder(item) {
    try {
      console.log(` REMINDER TRIGGERED: ${item.title}`);
      console.log(`   Message: ${item.metadata.reminderMessage || item.description}`);
      console.log(`   Priority: ${item.priority.toUpperCase()}`);
      console.log(`   Time: ${new Date().toLocaleString()}`);

      // Mark as executed
      database.update(item.id, {
        status: 'completed',
        executedAt: new Date().toISOString(),
        completedAt: new Date().toISOString()
      });

      // Store that we've triggered this reminder
      this.reminders.set(item.id, {
        triggeredAt: new Date().toISOString(),
        item
      });

      // Simulate push notification
      const notification = {
        title: item.title,
        body: item.metadata.reminderMessage || item.description,
        priority: item.priority,
        timestamp: new Date().toISOString()
      };

      console.log('📱 Push notification sent:', notification);

      return {
        success: true,
        notification
      };
    } catch (error) {
      console.error('Failed to trigger reminder:', error);
      
      database.update(item.id, {
        status: 'failed',
        failureReason: error.message
      });

      return {
        success: false,
        error: error.message
      };
    }
  }

  // Manually trigger a reminder (for testing)
  async triggerManually(itemId) {
    const item = database.findById(itemId);
    if (!item) {
      throw new Error('Action item not found');
    }

    if (item.type !== 'reminder') {
      throw new Error('Action item is not a reminder');
    }

    return await this.triggerReminder(item);
  }

  // Get triggered reminders history
  getHistory() {
    return Array.from(this.reminders.values());
  }
}

module.exports = new ReminderService();