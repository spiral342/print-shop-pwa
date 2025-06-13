# 🧾 Print Shop Order Tracker PWA

A custom-built Progressive Web App (PWA) for internal use at a print shop. Designed to streamline order tracking, sync across devices, and provide real-time visibility while remaining lightweight, offline-ready, and future-proof.

---

## ✅ Current Features (as of Day 9)

### 🗂️ Order Management
- Kanban board with status columns:
  - Order Placed, Design, Waiting Approval, Approved, Printing, Ready for Pickup, Completed, Credit
- Add, Edit, Delete orders via form
- Order cards show:
  - Customer info, dates, prices, balance, timestamps
- Modal with full detail view
- Calculated balance from total price and down payment

### 📦 Storage
- Uses:
  - `IndexedDB` for orders, images, sticky notes, customer logs
  - `LocalStorage` for lightweight settings and version info

### 🔁 Sync + Offline Logic
- Auto sync every 5 minutes
- Manual swipe-down refresh
- Silent retry within 1 minute on failure
- Sync log records:
  - Device-specific changes (e.g., "New order from iPad")
  - Last successful sync timestamp
  - Visible sync status + basic error info

### 🖼️ Attachments
- Attach up to 20 images/order (PNG, JPG, JPEG, HEIC)
- 10MB soft cap per file
- Per-image compression options:
  - High Quality / Safe Compress / Low Priority
- Offline storage + later sync
- Preview, download, email/forward

### 👤 Customer Log
- Auto-created from orders or manually
- Fields: Name, Phone, Email, Last Interaction, Credit/Debt, Notes
- Auto-delete after 1 year unless linked to credit/debt or order

### 🧮 Pricing Calculator
- Logic-based formulas per order type
- Used during order creation or via quote tool
- Quotes can become new orders without retyping
- Profit calculation + PIN-locked price overrides

### 🔐 Admin Tools (PIN-Protected)
- Manual sync
- Force delete
- Price override
- Force-create incomplete order
- View hidden flags/notes
- Sync debug info
- Auto-remove config

### 🗒️ Sticky Notes
- Grid layout
- Linked to orders
- Icon + count visible on order cards
- Pop-up previews
- Editable with full context
- Date tracking (created, last edited)

### 🧑‍💻 Developer Notes
- Open to all users for bug reports, observations, ideas

### 🌗 UI/UX
- Responsive design
- Per-device dark mode toggle
- Discreet version footer (bottom-right)
- "Undo" option after deletion (5 seconds)
- “Due in X” labels on order cards
- Collapsible menu with core tools
- Clean, self-explanatory layout

---

## 🔜 Confirmed Upcoming Features

- Receipt sending via Email or SMS
- Consistent receipt format: logo, app name, date/time
- Quick contact buttons (Call, WhatsApp, Email)
- Visual analytics (time per status, profit tracking, volume trends)
- CSV/JSON export
- Internal retro-style mini-game for downtime

---

## 🌐 Languages
- English 🇺🇸
- Spanish 🇪🇸

---

## 📦 Tech Stack
- HTML, CSS, JavaScript (Vanilla + modular)
- LocalStorage + IndexedDB
- Firebase (planned for sync backend)
- PWA Manifest + Service Worker (planned post-MVP)

---

## 🚧 MVP Milestone
Once core CRUD + modal + sync behaviors are stable and reliable, this project will go live in production. Future features will follow staged updates.

---

## 📜 License
Internal use only — not licensed for public distribution.



Built with ❤️ for LogoGraphicsLA.
