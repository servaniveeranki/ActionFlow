// models/ActionItem.js

class ActionItem {
  constructor(data) {
    this.id = data.id;
    this.title = data.title;
    this.description = data.description || '';
    this.type = data.type; // 'reminder', 'email', 'calendar', 'priority'
    this.status = data.status || 'pending'; // 'pending', 'completed', 'failed', 'in_progress'
    this.priority = data.priority || 'medium'; // 'low', 'medium', 'high', 'urgent'
    this.dueDate = data.dueDate;
    this.metadata = data.metadata || {};
    this.createdAt = data.createdAt || new Date().toISOString();
    this.updatedAt = data.updatedAt || new Date().toISOString();
    this.completedAt = data.completedAt || null;
    this.executedAt = data.executedAt || null;
    this.failureReason = data.failureReason || null;
  }

  validate() {
    const errors = [];

    if (!this.title || this.title.trim().length === 0) {
      errors.push('Title is required');
    }

    if (!['reminder', 'email', 'calendar', 'priority'].includes(this.type)) {
      errors.push('Invalid action type');
    }

    if (!['pending', 'completed', 'failed', 'in_progress'].includes(this.status)) {
      errors.push('Invalid status');
    }

    if (!['low', 'medium', 'high', 'urgent'].includes(this.priority)) {
      errors.push('Invalid priority');
    }

    if (!this.dueDate) {
      errors.push('Due date is required');
    }

    // Type-specific validation
    if (this.type === 'email') {
      if (!this.metadata.emailTo || this.metadata.emailTo.length === 0) {
        errors.push('Email recipients are required');
      }
      if (!this.metadata.emailSubject) {
        errors.push('Email subject is required');
      }
    }

    if (this.type === 'calendar') {
      if (!this.metadata.calendarEventDetails) {
        errors.push('Calendar event details are required');
      }
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  toJSON() {
    return {
      id: this.id,
      title: this.title,
      description: this.description,
      type: this.type,
      status: this.status,
      priority: this.priority,
      dueDate: this.dueDate,
      metadata: this.metadata,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
      completedAt: this.completedAt,
      executedAt: this.executedAt,
      failureReason: this.failureReason
    };
  }
}

module.exports = ActionItem;