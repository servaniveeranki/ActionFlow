// server.js

const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const { v4: uuidv4 } = require('uuid');

const ActionItem = require('./models/ActionItem');
const database = require('./services/db');
const actionExecutor = require('./services/actionExcutor');
const reminderService = require('./services/reminder');
const calendarService = require('./services/calendar');

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Request logging middleware
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
  next();
});

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
});

// ==================== ACTION ITEMS CRUD ====================

// GET all action items with optional filters
app.get('/api/action-items', (req, res) => {
  try {
    const { status, type, priority } = req.query;
    const filters = {};
    
    if (status) filters.status = status;
    if (type) filters.type = type;
    if (priority) filters.priority = priority;

    const items = database.findAll(filters);
    
    res.json({
      success: true,
      count: items.length,
      data: items
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// GET single action item by ID
app.get('/api/action-items/:id', (req, res) => {
  try {
    const item = database.findById(req.params.id);
    
    if (!item) {
      return res.status(404).json({
        success: false,
        error: 'Action item not found'
      });
    }

    res.json({
      success: true,
      data: item
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// POST create new action item
app.post('/api/action-items', (req, res) => {
  try {
    const itemData = {
      ...req.body,
      id: uuidv4()
    };

    const actionItem = new ActionItem(itemData);
    const validation = actionItem.validate();

    if (!validation.isValid) {
      return res.status(400).json({
        success: false,
        errors: validation.errors
      });
    }

    const created = database.create(actionItem.toJSON());

    res.status(201).json({
      success: true,
      data: created
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// PUT update action item
app.put('/api/action-items/:id', (req, res) => {
  try {
    const item = database.findById(req.params.id);
    
    if (!item) {
      return res.status(404).json({
        success: false,
        error: 'Action item not found'
      });
    }

    const updated = database.update(req.params.id, req.body);

    res.json({
      success: true,
      data: updated
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// DELETE action item
app.delete('/api/action-items/:id', (req, res) => {
  try {
    const item = database.findById(req.params.id);
    
    if (!item) {
      return res.status(404).json({
        success: false,
        error: 'Action item not found'
      });
    }

    database.delete(req.params.id);

    res.json({
      success: true,
      message: 'Action item deleted successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// ==================== ACTION EXECUTION ====================

// POST execute specific action
app.post('/api/action-items/:id/execute', async (req, res) => {
  try {
    const result = await actionExecutor.executeAction(req.params.id);
    
    res.json({
      success: true,
      result
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// POST execute all due actions
app.post('/api/actions/execute-due', async (req, res) => {
  try {
    const results = await actionExecutor.executeAllDue();
    
    res.json({
      success: true,
      executed: results.length,
      results
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// GET execution history
app.get('/api/actions/execution-history', (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 50;
    const history = actionExecutor.getExecutionHistory(limit);
    
    res.json({
      success: true,
      count: history.length,
      data: history
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// ==================== STATISTICS & ANALYTICS ====================

// GET statistics
app.get('/api/stats', (req, res) => {
  try {
    const stats = database.getStats();
    
    res.json({
      success: true,
      data: stats
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// GET items due soon
app.get('/api/action-items/due/soon', (req, res) => {
  try {
    const hours = parseInt(req.query.hours) || 24;
    const items = database.getDueSoon(hours);
    
    res.json({
      success: true,
      count: items.length,
      data: items
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// ==================== REMINDERS ====================

// GET reminder history
app.get('/api/reminders/history', (req, res) => {
  try {
    const history = reminderService.getHistory();
    
    res.json({
      success: true,
      count: history.length,
      data: history
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// POST trigger reminder manually
app.post('/api/reminders/:id/trigger', async (req, res) => {
  try {
    const result = await reminderService.triggerManually(req.params.id);
    
    res.json({
      success: true,
      result
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// ==================== CALENDAR ====================

// GET all calendar events
app.get('/api/calendar/events', (req, res) => {
  try {
    const events = calendarService.getAllEvents();
    
    res.json({
      success: true,
      count: events.length,
      data: events
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// GET specific calendar event
app.get('/api/calendar/events/:id', (req, res) => {
  try {
    const event = calendarService.getEvent(req.params.id);
    
    if (!event) {
      return res.status(404).json({
        success: false,
        error: 'Calendar event not found'
      });
    }

    res.json({
      success: true,
      data: event
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// POST cancel calendar event
app.post('/api/calendar/events/:id/cancel', async (req, res) => {
  try {
    const result = await calendarService.cancelEvent(req.params.id);
    
    res.json({
      success: true,
      result
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// ==================== BULK OPERATIONS ====================

// POST bulk create
app.post('/api/action-items/bulk', (req, res) => {
  try {
    const { items } = req.body;
    
    if (!Array.isArray(items)) {
      return res.status(400).json({
        success: false,
        error: 'Items must be an array'
      });
    }

    const created = [];
    const errors = [];

    items.forEach((itemData, index) => {
      try {
        const item = new ActionItem({ ...itemData, id: uuidv4() });
        const validation = item.validate();
        
        if (validation.isValid) {
          created.push(database.create(item.toJSON()));
        } else {
          errors.push({ index, errors: validation.errors });
        }
      } catch (error) {
        errors.push({ index, error: error.message });
      }
    });

    res.status(201).json({
      success: true,
      created: created.length,
      errors: errors.length,
      data: created,
      validationErrors: errors
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// DELETE bulk delete
app.delete('/api/action-items/bulk', (req, res) => {
  try {
    const { ids } = req.body;
    
    if (!Array.isArray(ids)) {
      return res.status(400).json({
        success: false,
        error: 'IDs must be an array'
      });
    }

    let deleted = 0;
    ids.forEach(id => {
      if (database.delete(id)) {
        deleted++;
      }
    });

    res.json({
      success: true,
      deleted,
      requested: ids.length
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// ==================== ERROR HANDLING ====================

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    error: 'Endpoint not found'
  });
});

// Global error handler
app.use((error, req, res, next) => {
  console.error('Server error:', error);
  res.status(500).json({
    success: false,
    error: 'Internal server error'
  });
});

// ==================== START SERVER ====================

app.listen(PORT, () => {
  console.log('\n===========================================');
  console.log(' Action Items Backend Server Started');
  console.log('===========================================');
  console.log(` Server running on: http://localhost:${PORT}`);
  console.log(` Health check: http://localhost:${PORT}/api/health`);
  console.log(` API Base URL: http://localhost:${PORT}/api`);
  console.log('Available Endpoints:');
  console.log('   GET    /api/action-items');
  console.log('   POST   /api/action-items');
  console.log('   GET    /api/action-items/:id');
  console.log('   PUT    /api/action-items/:id');
  console.log('   DELETE /api/action-items/:id');
  console.log('   POST   /api/action-items/:id/execute');
  console.log('   GET    /api/stats');
  console.log('   GET    /api/action-items/due/soon');
  console.log('===========================================\n');
});

module.exports = app;
