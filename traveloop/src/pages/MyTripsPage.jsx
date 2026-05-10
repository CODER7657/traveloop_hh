import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Compass } from 'lucide-react'
import { motion } from 'framer-motion'
import { supabase } from '../lib/supabase'
import { useAuthStore } from '../store/useAuthStore'
import { TripCard } from '../components/trip/TripCard'
import { Skeleton } from '../components/ui/Skeleton'
import { EmptyState } from '../components/shared/EmptyState'
import { toast } from 'react-hot-toast'

const container = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.07, delayChildren: 0.1 } },
}
const item = {
  hidden: { opacity: 0, y: 20 },
  show:   { opacity: 1, y: 0, transition: { duration: 0.4, ease: [0.4, 0, 0.2, 1] } },
}

export default function MyTripsPage() {
  const navigate = useNavigate()
  const { user } = useAuthStore()
  const [isLoading, setIsLoading] = useState(true)
  const [trips, setTrips] = useState([])

  const fetchTrips = async () => {
    setIsLoading(true)
    const { data, error } = await supabase
      .from('trips')
      .select('id, name, start_date, end_date, vibe_tag, cover_url, created_at')
      .eq('user_id', user.id)
      .order('start_date', { ascending: true })

    if (!error) {
      setTrips(data || [])
    } else {
      setTrips([])
    }
    setIsLoading(false)
  }

  useEffect(() => {
    if (!user?.id) return
    fetchTrips()
  }, [user?.id])

  const handleDeleteTrip = async (trip) => {
    if (!window.confirm(`Delete "${trip.name}"?`)) return

    const { error } = await supabase.from('trips').delete().eq('id', trip.id)
    if (error) {
      toast.error('Failed to delete trip')
      return
    }

    toast.success('Trip deleted')
    fetchTrips()
  }

  return (
    /* dot-grid background as specified in styling master prompt */
    <section className="bg-dot-grid min-h-screen -m-4 md:-m-8 p-4 md:p-8">
      <div className="max-w-6xl mx-auto space-y-6">
        <div className="flex items-end justify-between">
          <div>
            <h1 className="page-title">My Trips</h1>
            <p className="font-body mt-1 text-sm text-mist">Track all your upcoming and past adventures.</p>
          </div>
          <button
            onClick={() => navigate('/trips/new')}
            className="btn-primary hidden sm:inline-flex items-center gap-2"
          >
            + New Trip
          </button>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 6 }).map((_, idx) => (
              <div className="overflow-hidden rounded-2xl border border-parchment bg-white" key={idx}>
                <Skeleton className="h-40 w-full rounded-none" />
                <div className="space-y-3 p-5">
                  <Skeleton className="h-5 w-2/3" />
                  <Skeleton className="h-4 w-1/2" />
                  <Skeleton className="h-2 w-full" />
                  <Skeleton className="h-4 w-1/3" />
                </div>
              </div>
            ))}
          </div>
        ) : null}

        {!isLoading && trips.length === 0 ? (
          <EmptyState
            actionLabel="Plan your first trip"
            icon={<Compass className="h-12 w-12" />}
            message="Start by creating a trip and building your itinerary."
            onAction={() => navigate('/trips/new')}
            title="No trips yet"
          />
        ) : null}

        {!isLoading && trips.length > 0 ? (
          <motion.div
            variants={container}
            initial="hidden"
            animate="show"
            className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3"
          >
            {trips.map((trip) => (
              <motion.div key={trip.id} variants={item} whileHover={{ y: -5, transition: { duration: 0.2 } }}>
                <TripCard onDelete={handleDeleteTrip} trip={trip} />
              </motion.div>
            ))}
          </motion.div>
        ) : null}
      </div>
    </section>
  )
}
