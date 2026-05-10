import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { MapPin, Wallet, Calendar, Compass, Plus } from 'lucide-react'
import { motion } from 'framer-motion'
import { useAuthStore } from '../store/useAuthStore'
import { supabase } from '../lib/supabase'
import { differenceInDays, parseISO } from 'date-fns'
import { Skeleton } from '../components/ui/Skeleton'
import { BackgroundBeams } from '../components/ui/BackgroundBeams'
import { TextGenerate } from '../components/ui/TextGenerate'
import { CountUp } from '../components/ui/CountUp'

const container = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.06, delayChildren: 0.05 } },
}
const item = {
  hidden: { opacity: 0, y: 16 },
  show:   { opacity: 1, y: 0, transition: { duration: 0.35, ease: [0.4, 0, 0.2, 1] } },
}

export default function DashboardPage() {
  const { profile, user } = useAuthStore()
  const [stats, setStats] = useState({ totalTrips: 0, citiesVisited: 0, totalSpent: 0, daysTravelled: 0 })
  const [upcomingTrips, setUpcomingTrips] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!user) return

    const fetchDashboard = async () => {
      try {
        const today = new Date()

        // Step 1: Get trips (fast — indexed by user_id)
        const { data: allTrips } = await supabase
          .from('trips')
          .select('id, name, start_date, end_date, cover_url, vibe_tag')
          .eq('user_id', user.id)
          .order('start_date', { ascending: true })

        const tripIds = (allTrips || []).map(t => t.id)

        // Step 2: Stops + budget in parallel (only if there are trips)
        const [stopsRes, budgetRes] = tripIds.length > 0
          ? await Promise.all([
              supabase.from('stops').select('city_name').in('trip_id', tripIds),
              supabase.from('budget_items').select('amount').in('trip_id', tripIds),
            ])
          : [{ data: [] }, { data: [] }]

        const allStops = stopsRes.data || []
        const allBudget = budgetRes.data || []

        const uniqueCities = new Set(allStops.map(s => s.city_name).filter(Boolean))
        const totalSpent = allBudget.reduce((sum, b) => sum + (Number(b.amount) || 0), 0)

        let daysTravelled = 0
        ;(allTrips || []).forEach(trip => {
          if (trip.start_date && trip.end_date) {
            const start = parseISO(trip.start_date)
            const end = parseISO(trip.end_date)
            if (end < today) daysTravelled += differenceInDays(end, start) + 1
            else if (start <= today && end >= today) daysTravelled += differenceInDays(today, start) + 1
          }
        })

        const upcoming = (allTrips || []).filter(t => {
          if (!t.start_date) return false
          const start = parseISO(t.start_date)
          const end = t.end_date ? parseISO(t.end_date) : null
          return start >= today || (end && end >= today && start < today)
        })

        setStats({ totalTrips: (allTrips || []).length, citiesVisited: uniqueCities.size, totalSpent, daysTravelled })
        setUpcomingTrips(upcoming.slice(0, 3))
      } catch (err) {
        console.error('Dashboard fetch error:', err)
      } finally {
        setLoading(false)
      }
    }

    fetchDashboard()
  }, [user?.id])


  const greeting = (() => {
    const h = new Date().getHours()
    if (h < 12) return 'Good morning'
    if (h < 18) return 'Good afternoon'
    return 'Good evening'
  })()

  const firstName = profile?.name?.split(' ')[0] || 'Traveler'

  if (loading) {
    return (
      <div className="relative min-h-screen bg-cream">
        <BackgroundBeams className="opacity-20" />
        <div className="relative z-10 space-y-6">
          <Skeleton className="h-10 w-1/3" />
          <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <Skeleton className="h-28" key={i} />
            ))}
          </div>
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <div className="overflow-hidden rounded-2xl border border-parchment bg-white" key={i}>
                <Skeleton className="h-40 w-full rounded-none" />
                <div className="space-y-3 p-5">
                  <Skeleton className="h-5 w-2/3" />
                  <Skeleton className="h-4 w-1/2" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="relative min-h-screen bg-cream">
      {/* Subtle animated background beams */}
      <BackgroundBeams className="opacity-20" />

      <motion.div
        variants={container}
        initial="hidden"
        animate="show"
        className="relative z-10 space-y-10"
      >
        {/* Welcome heading */}
        <motion.div variants={item} className="flex justify-between items-end">
          <div>
            <h1 className="font-display text-5xl font-bold text-dusk tracking-tight leading-tight">
              <TextGenerate text={`${greeting}, ${firstName}`} speed={35} />
            </h1>
            <p className="font-body text-base text-mist mt-2 leading-relaxed">
              Here's an overview of your travels.
            </p>
          </div>
          <Link
            to="/trips/new"
            className="btn-primary hidden md:inline-flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            Plan New Trip
          </Link>
        </motion.div>

        {/* Stats Row */}
        <motion.div variants={item} className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { icon: Compass, label: 'Total Trips',     value: stats.totalTrips,    prefix: '',  suffix: '' },
            { icon: MapPin,  label: 'Cities Visited',  value: stats.citiesVisited, prefix: '',  suffix: '' },
            { icon: Wallet,  label: 'Total Spent',     value: stats.totalSpent,    prefix: '$', suffix: '' },
            { icon: Calendar,label: 'Days Travelled',  value: stats.daysTravelled, prefix: '',  suffix: '' },
          ].map(({ icon: Icon, label, value, prefix, suffix }) => (
            <div key={label} className="bg-white border border-parchment rounded-2xl p-5">
              <p className="section-label mb-2">{label}</p>
              <p className="font-display text-4xl font-bold text-dusk">
                <CountUp to={value} prefix={prefix} suffix={suffix} />
              </p>
              <Icon className="w-4 h-4 text-earth mt-2" />
            </div>
          ))}
        </motion.div>

        {/* Upcoming Trips */}
        <motion.div variants={item}>
          <div className="flex items-center justify-between mb-5">
            <h2 className="font-display text-3xl font-semibold text-dusk">Upcoming Trips</h2>
            <Link
              to="/trips/new"
              className="font-body text-sm font-medium text-amber hover:text-amber-dark flex items-center gap-1 transition-colors"
            >
              <Plus className="w-4 h-4" /> New Trip
            </Link>
          </div>

          {upcomingTrips.length === 0 ? (
            <div className="card py-14 text-center border-2 border-dashed border-parchment">
              <Compass className="w-12 h-12 text-ghost mx-auto mb-3" />
              <h3 className="font-display text-2xl text-dusk mb-1">No upcoming trips</h3>
              <p className="font-body text-sm text-mist mb-5">
                Time to plan your next adventure!
              </p>
              <Link to="/trips/new" className="btn-primary inline-flex">
                Create a Trip
              </Link>
            </div>
          ) : (
            <motion.div
              variants={container}
              initial="hidden"
              animate="show"
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
            >
              {upcomingTrips.map((trip) => (
                <motion.div key={trip.id} variants={item} whileHover={{ y: -5, transition: { duration: 0.2 } }}>
                  <Link
                    to={`/trips/${trip.id}`}
                    className="bg-white border border-parchment rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-all duration-300 group block"
                  >
                    <div className="aspect-video overflow-hidden bg-sand relative">
                      {trip.cover_url ? (
                        <img
                          src={trip.cover_url}
                          alt={trip.name}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-ghost uppercase tracking-widest text-xs font-bold bg-sand">
                          No Cover
                        </div>
                      )}
                      {trip.vibe_tag && (
                        <span className="absolute top-3 right-3 bg-amber/15 text-amber-dark font-body text-xs font-medium px-3 py-1 rounded-full capitalize backdrop-blur-sm">
                          {trip.vibe_tag}
                        </span>
                      )}
                    </div>
                    <div className="p-5">
                      <h3 className="font-display text-xl font-semibold text-dusk mb-1 truncate">
                        {trip.name}
                      </h3>
                      <div className="font-body text-sm text-mist flex items-center gap-1.5">
                        <Calendar className="w-4 h-4 shrink-0" />
                        <span>
                          {trip.start_date || 'TBD'} → {trip.end_date || 'TBD'}
                        </span>
                      </div>
                    </div>
                  </Link>
                </motion.div>
              ))}
            </motion.div>
          )}
        </motion.div>
      </motion.div>
    </div>
  )
}
