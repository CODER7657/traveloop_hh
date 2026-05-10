import React, { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { Calendar, MapPin, Globe } from 'lucide-react'

// OVERRIDE: Replaces Community tab scope with Public Shared Itinerary
export default function PublicSharedItineraryPage() {
  const { id } = useParams()
  const [trip, setTrip] = useState(null)
  const [stops, setStops] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchItinerary()
  }, [id])

  const fetchItinerary = async () => {
    try {
      const [tripRes, stopsRes] = await Promise.all([
        supabase.from('trips').select('*').eq('id', id).single(),
        supabase.from('stops').select('*, trip_activities(*)').eq('trip_id', id).order('order_index', { ascending: true })
      ])
      
      if (tripRes.data) setTrip(tripRes.data)
      if (stopsRes.data) setStops(stopsRes.data)
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  if (loading) return <div className="p-8 text-center min-h-screen bg-cream flex items-center justify-center">Loading Shared Itinerary...</div>
  if (!trip) return <div className="p-8 text-center min-h-screen bg-cream flex items-center justify-center">Trip not found or is private.</div>

  return (
    <div className="min-h-screen bg-cream">
      {/* Public Header */}
      <header className="bg-white border-b border-dusk/10 sticky top-0 z-50">
        <div className="max-w-4xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-forest text-white flex items-center justify-center font-display font-bold">
              T
            </div>
            <span className="font-display font-bold text-xl tracking-tight">Traveloop</span>
          </div>
          <div className="flex items-center gap-2 text-sm font-medium text-forest bg-forest/10 px-3 py-1 rounded-full">
            <Globe className="w-4 h-4" /> Public View
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto p-4 lg:p-8">
        <div className="mb-8">
          <h1 className="text-4xl font-display font-bold">{trip.title}</h1>
          <p className="text-dusk/60 flex items-center mt-2">
            <Calendar className="w-4 h-4 mr-2" /> 
            {new Date(trip.start_date).toLocaleDateString()} - {new Date(trip.end_date).toLocaleDateString()}
          </p>
          <div className="mt-4 text-sm text-dusk/70 bg-white p-4 rounded-xl border border-dusk/10">
            This is a read-only shared itinerary. <Link to="/signup" className="text-forest hover:underline font-bold">Create your own adventure on Traveloop.</Link>
          </div>
        </div>

        <div className="space-y-8">
          {stops.map((stop, index) => {
            const activities = stop.trip_activities || []
            const dayTotal = activities.reduce((sum, act) => sum + (Number(act.cost_override) || 0), 0)

            return (
              <div key={stop.id} className="bg-white rounded-2xl shadow-sm border border-dusk/10 overflow-hidden">
                <div className="bg-sand px-6 py-4 border-b border-dusk/5 flex items-center">
                  <div className="bg-forest text-white w-8 h-8 rounded-full flex items-center justify-center font-bold mr-4">
                    {index + 1}
                  </div>
                  <h2 className="text-xl font-bold font-display flex items-center">
                    <MapPin className="w-5 h-5 mr-2 text-amber" />
                    {stop.city_name}
                  </h2>
                </div>
                
                <div className="p-0 overflow-x-auto">
                  <table className="w-full text-left border-collapse min-w-[500px]">
                    <thead>
                      <tr className="bg-cream/50 text-dusk/70 text-sm uppercase tracking-wider">
                        <th className="p-4 font-medium">Time</th>
                        <th className="p-4 font-medium">Activity</th>
                        <th className="p-4 font-medium text-right">Cost</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-dusk/5">
                      {activities.length > 0 ? (
                        activities.map((act) => (
                          <tr key={act.id} className="hover:bg-sand/30 transition-colors">
                            <td className="p-4 text-dusk/60">TBD</td>
                            <td className="p-4">
                              <span className="font-medium text-dusk">{act.activity_name}</span>
                            </td>
                            <td className="p-4 text-right">${Number(act.cost_override).toFixed(2)}</td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan="3" className="p-8 text-center text-dusk/50 italic">
                            No activities added.
                          </td>
                        </tr>
                      )}
                      {activities.length > 0 && (
                        <tr className="bg-sand/50 font-bold border-t-2 border-dusk/10">
                          <td colSpan="2" className="p-4 text-right">Day Total:</td>
                          <td className="p-4 text-right text-amber">${dayTotal.toFixed(2)}</td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            )
          })}
        </div>
      </main>
    </div>
  )
}