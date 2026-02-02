// services/actionExecutor.js

const database = require('./db');
const emailService = require('./email');
const calendarService = require('./calendar');
const reminderService = require('./reminder');

class ActionExecutor {
  constructor() {
    this.executionHistory = [];
  }

  async executeAction(actionItemId) {
    const item = database.findById(actionItemId);
    
    if (!item) {
      throw new Error('Action item not found');
    }

    if (item.status !== 'pending') {
      throw new Error(`Cannot execute action with status: ${item.status}`);
    }

    // Update status to in_progress
    database.update(actionItemId, { status: 'in_progress' });

    let result;

    try {
      switch (item.type) {
        case 'email':
          result = await this.executeEmail(item);
          break;
        case 'calendar':
          result = await this.executeCalendar(item);
          break;
        case 'reminder':
          result = await this.executeReminder(item);
          break;
        case 'priority':
          result = await this.executePriority(item);
          break;
        default:
          throw new Error(`Unknown action type: ${item.type}`);
      }

      // Update action item based on result
      if (result.success) {
        database.update(actionItemId, {
          status: 'completed',
          executedAt: new Date().toISOString(),
          completedAt: new Date().toISOString(),
          metadata: {
            ...item.metadata,
            executionResult: result
          }
        });
      } else {
        database.update(actionItemId, {
          status: 'failed',
          failureReason: result.error
        });
      }

      // Log execution
      this.logExecution(item, result);

      return result;
    } catch (error) {
      database.update(actionItemId, {
        status: 'failed',
        failureReason: error.message
      });

      const errorResult = {
        success: false,
        error: error.message
      };

      this.logExecution(item, errorResult);

      throw error;
    }
  }

  async executeEmail(item) {
    console.log(`\n Executing EMAIL action: ${item.title}`);
    const result = await emailService.sendEmail(item);
    return result;
  }

  async executeCalendar(item) {
    console.log(`\n Executing CALENDAR action: ${item.title}`);
    const result = await calendarService.createCalendarEvent(item);
    return result;
  }

  async executeReminder(item) {
    console.log(`\n Executing REMINDER action: ${item.title}`);
    const result = await reminderService.triggerManually(item.id);
    return result;
  }

  async executePriority(item) {
    console.log(`\n Executing PRIORITY action: ${item.title}`);
    
    // Priority tasks are just marked as completed with special handling
    return {
      success: true,
      message: 'Priority task marked as ready for execution',
      priorityLevel: item.priority
    };
  }

  logExecution(item, result) {
    const log = {
      timestamp: new Date().toISOString(),
      actionId: item.id,
      title: item.title,
      type: item.type,
      success: result.success,
      result
    };

    this.executionHistory.push(log);

    // Keep only last 100 executions
    if (this.executionHistory.length > 100) {
      this.executionHistory.shift();
    }
  }

  getExecutionHistory(limit = 50) {
    return this.executionHistory.slice(-limit).reverse();
  }

  async executeAllDue() {
    const dueItems = database.getDueSoon(0);
    const results = [];

    for (const item of dueItems) {
      try {
        const result = await this.executeAction(item.id);
        results.push({ item, result });
      } catch (error) {
        results.push({ 
          item, 
          result: { success: false, error: error.message } 
        });
      }
    }

    return results;
  }
}

module.exports = new ActionExecutor();