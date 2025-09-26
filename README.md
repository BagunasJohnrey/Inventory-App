# Sports Inventory Dashboard with Barcode Scanner (Prototype Only)

A **React + Vite** application for managing a sports inventory, integrated with **SQLite3** for database storage and a **barcode scanner** for quick item lookup and management.

---

## Features

- View and manage sports inventory items.
- Add, edit, and delete items.
- Barcode scanning for quick product lookup.
- Real-time updates to inventory.
- Clean, responsive UI using Tailwind CSS.

---

## Tech Stack

- **Frontend:** React, Vite, Tailwind CSS
- **Backend / Database:** SQLite3
- **Barcode Scanning:** @zxing/library

---

## Prerequisites

Make sure you have the following installed:

- Node.js (v22+ recommended)
- npm (v10+)
- Git

---

## Quick Start (Clone & Run)

Run the following commands in your terminal:

```bash
# Clone the repo
git clone <https://github.com/BagunasJohnrey/Inventory-App.git> sports-inventory
cd inventory-app

# Install dependencies
npm install

# Start the development server
npm run dev 

# Create another terminal for Sqlite3
cd inventory-app
cd server

# Install dependencies
npm install

# Start the SQLite server
npm start


