# ParkEase – Smart Parking Reservation & Management System

> **A modern, commercial-grade smart parking reservation platform built with React, Vite, Tailwind CSS, Node.js, Express, Socket.IO, and JWT Authentication.**

---

## 🚀 Live Servers & Access URLs

- **Frontend (Live Hot-Reload Dev)**: [http://localhost:3000](http://localhost:3000)
- **Full-Stack Application / Production Bundle**: [http://localhost:5000](http://localhost:5000)
- **Backend API & WebSocket Server**: [http://localhost:5000/api](http://localhost:5000/api)
- **Health Check Endpoint**: [http://localhost:5000/api/health](http://localhost:5000/api/health)

---

## 🔑 Demo Login Accounts

You can log in manually or use the **1-Click Quick Demo Login** buttons on the login page:

| Role | Email | Password | Features Accessible |
|---|---|---|---|
| **Regular User (Driver)** | `user@parkease.com` | `user123` | Search hubs, interactive floor layout, reserve bays, UPI checkout, digital QR pass, garage/vehicles, booking history, tax receipts |
| **Administrator** | `admin@parkease.com` | `admin123` | Full operator console, revenue analytics, hourly occupancy charts, add/delete facilities, live slot state controller, master reservations table, user directory |

---

## 🌟 Implemented Features

### 1. User & Commuter Module
- **JWT Authentication & Profile Management**: Secure token-based auth with session persistence.
- **Location Discovery & Search**: Filter parking facilities by name, city, 24/7 access, and EV charging.
- **Interactive Multi-Level Bay Grid**:
  - Floor switcher: **Ground Floor (G)**, **Level 1 (P1)**, **Level 2 (P2)**.
  - Color-coded bays: **Green (Available)**, **Red (Booked)**, **Yellow (Reserved)**, **Grey (Maintenance)**.
  - Bay categories: **⚡ EV Fast Charging**, **👑 VIP Valet**, **♿ Accessible**, **🚗 Standard**.
- **Dynamic Duration Pricing**: Real-time hourly cost calculation + 18% GST calculation.
- **Vehicle Garage Management**: Save multiple cars, license plates, and EV models for 1-click reservations.
- **Anti Double-Booking Validation**: Atomic backend overlap check prevents conflicting reservations for the same time window.
- **UPI & Google Pay Integration**: Simulated instant UPI payment intent with order verification.
- **Unique QR Ticket Pass**: Boarding pass-style digital ticket with encrypted payload and validity timer.
- **Barrier Scanner Simulator**: Realistic boom barrier interface with live lifting arm and gate activity logs.
- **Booking History & Official Tax Receipts**: View upcoming, active, completed, and cancelled bookings with downloadable tax invoices.

### 2. Admin & Operator Module
- **Real-Time Key Performance Indicators (KPIs)**: Total spaces, available bays, occupied bays, total revenue, bookings counter.
- **Recharts Analytics**:
  - 7-Day Revenue Trend area chart.
  - 24-Hour Peak Occupancy profile bar chart.
  - Bay Type equipment distribution pie chart.
- **Facilities Management**: Add new commercial parking decks, edit details, set base hourly rates and operating hours.
- **Live Bay Controller**: Remotely override and toggle any bay's status between Available, Booked, Reserved, and Maintenance.
- **Master Reservation Registry**: Audit all driver bookings, customer contacts, payment records, and statuses.

---

## 🛠️ Project Structure

```
parkease/
├── backend/
│   ├── src/
│   │   ├── config/db.js          # MongoDB connect with persistent JSON document store fallback
│   │   ├── data/                 # Auto-synced persistent database (parkease_db.json)
│   │   ├── middleware/auth.js    # JWT verification & role guard (requireAdmin)
│   │   ├── routes/
│   │   │   ├── auth.js           # Register, login, profile, vehicles, favorites
│   │   │   ├── parking.js        # Locations & slot queries
│   │   │   ├── bookings.js       # Atomic booking, overlap check, cancellation
│   │   │   ├── payments.js       # UPI intent, verification, tax invoice
│   │   │   ├── admin.js          # Analytics, location CRUD, slot override, user directory
│   │   │   └── entry.js          # Boom barrier QR verification & gate logs
│   │   ├── seed/seedData.js      # Commercial parking hubs, floors, bays, and demo data
│   │   ├── socket/socketHandler.js # Real-time Socket.IO slot broadcasts
│   │   └── app.js                # Express server & static production asset host
│   └── package.json
│
└── frontend/
    ├── src/
    │   ├── context/AuthContext.jsx # Global user authentication state
    │   ├── services/
    │   │   ├── api.js            # Axios client with JWT interceptor
    │   │   └── socket.js         # Socket.IO client for live availability
    │   ├── components/
    │   │   ├── Navbar.jsx        # Responsive navigation with brand styling
    │   │   └── Footer.jsx        # Platform footer
    │   ├── pages/
    │   │   ├── LandingPage.jsx   # Hero, search, how-it-works, features, hot locations
    │   │   ├── Dashboard.jsx     # User dashboard with nearby hubs and vehicle drawer
    │   │   ├── ParkingDetail.jsx # Interactive floor plan, bay selector & calculator
    │   │   ├── BookingConfirmation.jsx # UPI / Google Pay checkout
    │   │   ├── QRTicket.jsx      # Digital boarding pass QR ticket
    │   │   ├── BookingHistory.jsx # History, cancelation, official tax invoice modal
    │   │   ├── GateScanner.jsx   # Interactive boom barrier gate scanner
    │   │   ├── AdminDashboard.jsx # Operator console with Recharts analytics
    │   │   └── AuthPage.jsx      # Login / Registration with 1-click demo buttons
    │   ├── App.jsx               # Routes configuration
    │   └── main.jsx
    ├── tailwind.config.cjs
    └── package.json
```
