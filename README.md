# ActionFlow

**ActionFlow** is an execution-first action management system designed to reliably convert intent into outcomes.  
Unlike traditional task managers, ActionFlow focuses on **orchestration, execution, and visibility** of actions such as reminders, emails, and calendar events.

---

## Overview

ActionFlow is a **full-stack prototype** that demonstrates:
- Unified action modeling
- Autonomous execution via background workers
- Clear action lifecycle and observability
- Web-based interface backed by real APIs

The system is designed with **enterprise execution reliability** in mind rather than simple task tracking.

---

## Key Concepts

- **Action-Centric Design** – All items are treated as executable actions
- **Unified Action Model** – Single abstraction for reminders, emails, and calendar events
- **Execution Engine** – Background jobs handle time-based and manual execution
- **Clear Lifecycle** – Actions move through predictable states (pending → executed → completed / failed)

---

## Features

### Backend
- REST APIs for action creation and management
- Background job scheduler for autonomous execution
- Email, calendar, and reminder execution support
- Execution history and system statistics
- Bulk operations support

### Frontend
- React-based web interface
- Real-time API-driven data updates
- Action execution and status visibility
- Filtering by type, priority, and state
- Execution history view

---

## Tech Stack

**Backend**
- Node.js
- Express.js
- node-cron
- Nodemailer

**Frontend**
- React 18
- Tailwind CSS
- Fetch API

---
```text
action-items-fullstack/
│
├── backend/
│   ├── models/
│   │   └── ActionItem.js        # Data model (Action Items schema)
│   │
│   ├── services/
│   │   ├── db.js               # In-memory database logic
│   │   ├── email.js            # Email notifications
│   │   ├── calendar.js         # Calendar event handling
│   │   ├── reminder.js         # Reminder scheduler
│   │   └── actionExecutor.js   # Core execution engine
│   │
│   ├── server.js               # Express API server
│   └── package.json            # Backend dependencies
│
├── frontend/
│   └── index.html              # React frontend application
│
└── README.md

## 1. Install dependencies
cd backend && npm install

## 2. Start backend
npm start

## 3. Open frontend (new terminal)
cd ../frontend && open index.html
 npx serve
```
