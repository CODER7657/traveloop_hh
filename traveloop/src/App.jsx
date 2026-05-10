import { useEffect } from 'react'
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom'
import { AnimatePresence } from 'framer-motion'
import { useAuthStore } from './store/useAuthStore'
import { PageTransition } from './components/shared/PageTransition'

// Layouts
import { AuthLayout } from './components/layout/AuthLayout'
import { AppLayout } from './components/layout/AppLayout'

// Auth Pages
import LoginPage from './pages/auth/LoginPage'
import SignupPage from './pages/auth/SignupPage'

// Main Pages
import DashboardPage from './pages/DashboardPage'
import CreateTripPage from './pages/CreateTripPage'
import ItineraryBuilderPage from './pages/ItineraryBuilderPage'
import CitySearchPage from './pages/CitySearchPage'
import ActivitySearchPage from './pages/ActivitySearchPage'
import ProfilePage from './pages/ProfilePage'
import ItineraryViewPage from './pages/ItineraryViewPage'
import MyTripsPage from './pages/MyTripsPage'
import BudgetPage from './pages/BudgetPage'
import ChecklistPage from './pages/ChecklistPage'
import NotesPage from './pages/NotesPage'

const AppLoading = () => (
  <div className="flex h-screen items-center justify-center bg-cream">
    <div className="animate-pulse w-12 h-12 rounded-full bg-amber text-white flex items-center justify-center font-display">T</div>
  </div>
)

// Protected Route Guard
const AuthGuard = ({ children }) => {
  const { user, isLoading } = useAuthStore()
  if (isLoading) return <AppLoading />
  return user ? children : <Navigate to="/login" replace />
}

import PublicSharedItineraryPage from './pages/PublicSharedItineraryPage'

function AnimatedRoutes() {
  const location = useLocation()

  return (
    <AnimatePresence mode="wait">
      <Routes key={location.pathname} location={location}>
        <Route path="/shared/:id" element={<PageTransition><PublicSharedItineraryPage /></PageTransition>} />

        <Route element={<AuthLayout />}>
          <Route path="/login" element={<PageTransition><LoginPage /></PageTransition>} />
          <Route path="/signup" element={<PageTransition><SignupPage /></PageTransition>} />
        </Route>

        <Route element={
          <AuthGuard>
            <AppLayout />
          </AuthGuard>
        }>
          <Route path="/" element={<PageTransition><DashboardPage /></PageTransition>} />
          <Route path="/trips" element={<PageTransition><MyTripsPage /></PageTransition>} />
          <Route path="/trips/new" element={<PageTransition><CreateTripPage /></PageTransition>} />
          <Route path="/trips/:id" element={<PageTransition><ItineraryViewPage /></PageTransition>} />
          <Route path="/trips/:id/build" element={<PageTransition><ItineraryBuilderPage /></PageTransition>} />
          <Route path="/search" element={<PageTransition><CitySearchPage /></PageTransition>} />
          <Route path="/search/activities" element={<PageTransition><ActivitySearchPage /></PageTransition>} />
          <Route path="/budget" element={<PageTransition><BudgetPage /></PageTransition>} />
          <Route path="/profile" element={<PageTransition><ProfilePage /></PageTransition>} />
          <Route path="/pack" element={<PageTransition><ChecklistPage /></PageTransition>} />
          <Route path="/notes" element={<PageTransition><NotesPage /></PageTransition>} />
        </Route>
      </Routes>
    </AnimatePresence>
  )
}

export default function App() {
  const initializeAuth = useAuthStore(state => state.initializeAuth)

  useEffect(() => {
    initializeAuth()
  }, [initializeAuth])

  return (
    <BrowserRouter>
      <AnimatedRoutes />
    </BrowserRouter>
  )
}

