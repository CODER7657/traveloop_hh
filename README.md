# 🌍 Traveloop

Traveloop is a comprehensive, full-stack travel planning application designed to help users effortlessly plan trips, discover activities, manage travel budgets, and share itineraries with friends. 

## ✨ Features

- **User Authentication**: Secure Login/Signup using JWT.
- **Trip Management**: Create, edit, and organize multiple trips via a personalized Dashboard.
- **Itinerary Builder**: Day-by-day planner for tracking stops and schedules.
- **City & Activity Search**: Discover new destinations and activities tailored to your trip.
- **Budgeting & Expenses**: Keep track of trip costs and manage your budget efficiently.
- **Checklists & Notes**: Stay organized with built-in packing lists and trip notes.
- **Itinerary Sharing**: Make your itineraries public or share them directly with others.
- **Interactive UI**: Beautiful, responsive design built leveraging Tailwind CSS.

## 🛠️ Tech Stack

**Frontend:**
- React (Vite)
- Tailwind CSS (with custom UI components)
- Zustand (State management - implied via `useTripStore` & `useAuthStore`)
- Supabase Integration

**Backend:**
- Node.js & Express.js
- PostgreSQL (Database)
- JWT (JSON Web Tokens) for authentication
- bcryptjs for password hashing

**DevOps:**
- Docker & Docker Compose
- NGINX config available

## 🚀 Getting Started

### Prerequisites
- Node.js (v18+)
- Docker & Docker Compose (optional, but recommended)
- PostgreSQL (if running locally natively)

### Setup & Run (Locally)

1. **Install Dependencies:**
   ```bash
   # Install frontend dependencies
   cd traveloop
   npm install --legacy-peer-deps

   # Install backend dependencies
   cd server
   npm install
   ```

2. **Environment Variables:**
   - In the `server` directory, copy `.env.example` to `.env`.
   - Update the variables (Database details, JWT secrets, etc.) to match your environment.

3. **Start the Backend:**
   ```bash
   cd traveloop/server
   npm run dev
   ```

4. **Start the Frontend:**
   ```bash
   cd traveloop
   npm run dev
   ```

### Setup & Run (Docker)

To spin up the entire application stack including the PostgreSQL database, backend, and frontend:
```bash
docker compose up --build
```

## 📂 Project Structure

- `server/`: Express REST API, routing, middlewares, and PostgreSQL connections.
- `src/`: React frontend application containing components, pages, custom hooks, and state management.
- `supabase/`: Scripts and schema declarations for the database.
