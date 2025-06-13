# 🚀 Features Overview — Print Shop Order Tracker

This document outlines all features in the app, including completed, in progress, upcoming, and intentionally excluded features.

---

## ✅ Completed Features

### 🗂️ Order Management
- Kanban board with 8 status columns
- Clickable order cards with modal detail view
- Add/Edit/Delete orders
- Auto-generated IDs
- Calculated balance field
- Human-readable time-in-column labels

### 💾 Data Storage
- IndexedDB for heavy data: orders, attachments, customer logs, sticky notes
- LocalStorage for lightweight data: version info, theme preference

### 🔁 Sync
- 5-minute automatic sync
- Manual swipe-down refresh
- Silent retry within 1 minute if sync fails
- Visible sync status + timestamp
- Sync logs with device-based entries and readable error messages

### 🖼️ Attachments
- PNG, JPG, JPEG, HEIC supported
- Up to 20 images/order
- 10MB soft limit per file
- Image compression options
- Per-image labeling and priority
- Offline storage, sync later
- Quick preview, download, and forwarding options

### 👤 Customer Log
- Auto-created from orders or manually
- Fields: name, phone, email, last interaction, credit, debt, notes
- Auto-deletes after 1 year if inactive

### 💸 Pricing & Quotes
- Dynamic calculator by order type
- Custom formulas for each service
- Quote tool with "Make New Order" from quote
- PIN-based price override
- Profit estimation per order

### 🔐 Admin Tools (PIN Locked)
- Manual sync
- Force delete or override validations
- Hidden internal notes or flags
- Debug info for sync
- Auto-removal timer settings

### 📌 Sticky Notes
- Notes page with grid layout
- Linked to order cards
- Expandable previews
- Editable in the same view structure
- Created/edited timestamps
- Icon on cards showing note count

### 🌙 Interface
- Per-device dark mode toggle
- Collapsible menu
- “Undo” option for deletion (5 seconds)
- “Due in X” display on cards
- Clean, minimal UI
- Discreet version footer (bottom-right)

---

## 🔜 Upcoming Features

- Email/SMS receipt sending
- Consistent receipt layout (logo, app name, date/time)
- Quick contact buttons (call, WhatsApp, email)
- Receipt preview before sending
- Analytics dashboard (column time, income, turnaround)
- CSV/JSON export
- Retro mini-game (internal use)
- Firebase sync backend

---

## ❌ Rejected or Delayed Features

- No "complete later" or partial order saving
- No activity logs or user-based analytics
- No AI-based price calculations (logic-only)
- No priority tag system
- No read-only mode
- No templates or autofill for new orders

---

## 🌍 Language Support

- English
- Spanish

---

## 🧪 Developer Tools

- Developer notes for idea tracking and feedback
- Debug console (planned)
