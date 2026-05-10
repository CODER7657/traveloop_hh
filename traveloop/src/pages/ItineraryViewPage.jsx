import React, { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { Calendar, MapPin, ArrowLeft, Printer, Share2 } from 'lucide-react'
import { useWeather } from '../hooks/useWeather'
import { BackgroundLines } from '../components/ui/BackgroundLines'

const WeatherPill = ({ lat, lng, date }) => {
  const { temp, condition } = useWeather(lat, lng, date)

  if (!lat || !lng || !date || temp === null) return null

  return (
    <span className="ml-3 rounded-full bg-sky-50 px-3 py-1 text-xs text-sky-700">
      {condition} {temp}°C
    </span>
  )
}

export default function ItineraryViewPage() {
  const { id } = useParams()
  const [trip, setTrip] = useState(null)
  const [stops, setStops] = useState([])
  const [cityCoords, setCityCoords] = useState({})
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
      if (stopsRes.data) {
        setStops(stopsRes.data)

        const cityIds = stopsRes.data.map((stop) => stop.city_id).filter(Boolean)
        if (cityIds.length > 0) {
          const { data: cities } = await supabase.from('cities').select('id, lat, lng').in('id', cityIds)
          const coordsMap = (cities || []).reduce((acc, city) => {
            acc[city.id] = { lat: city.lat, lng: city.lng }
            return acc
          }, {})
          setCityCoords(coordsMap)
        }
      }
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  if (loading) return <div className="p-8 text-center">Loading Itinerary...</div>
  if (!trip) return <div className="p-8 text-center">Trip not found.</div>

  // Create mock days based on the stops (since we don't have explicit dates mapped per activity in this basic schema)
  // We'll just present each stop as a "Day" block for the sake of the structural override requirements.
  
  return (
    <div className="relative">
      <BackgroundLines className="opacity-15" />
    <div className="relative z-10 max-w-4xl mx-auto p-4 lg:p-8">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
        <div>
          <Link to={`/trips/${id}/build`} className="flex items-center text-forest hover:underline mb-2">
            <ArrowLeft className="w-4 h-4 mr-2" /> Back to Builder
          </Link>
          <h1 className="text-4xl font-display font-bold">{trip.name}</h1>
          <p className="text-dusk/60 flex items-center mt-2">
            <Calendar className="w-4 h-4 mr-2" /> 
            {new Date(trip.start_date).toLocaleDateString()} - {new Date(trip.end_date).toLocaleDateString()}
          </p>
        </div>
        
        <div className="flex gap-2">
          <Link to={`/trips/${id}/share`} className="btn-secondary h-10 px-4">
            <Share2 className="w-4 h-4 mr-2" /> Share
          </Link>
          <button className="btn-secondary h-10 px-4" onClick={() => window.print()}>
            <Printer className="w-4 h-4 mr-2" /> Print
          </button>
        </div>
      </div>

      <div className="space-y-8">
        {stops.map((stop, index) => {
          const activities = stop.trip_activities || []
          const dayTotal = activities.reduce((sum, act) => sum + (Number(act.cost_override) || 0), 0)

          return (
            <div key={stop.id} className="bg-white rounded-2xl shadow-sm border border-parchment overflow-hidden">
              <div className="bg-sand px-6 py-4 border-b border-parchment flex items-center">
                <div className="bg-forest text-white w-8 h-8 rounded-full flex items-center justify-center font-bold mr-4">
                  {index + 1}
                </div>
                <h2 className="font-display text-3xl font-semibold text-dusk flex items-center border-b-0">
                  <MapPin className="w-5 h-5 mr-2 text-amber shrink-0" />
                  {stop.city_name}
                  <WeatherPill
                    date={stop.arrival_date || trip.start_date}
                    lat={cityCoords[stop.city_id]?.lat}
                    lng={cityCoords[stop.city_id]?.lng}
                  />
                </h2>
              </div>
              
              <div className="p-0 overflow-x-auto">
                <table className="w-full text-left border-collapse min-w-[500px]">
                  <thead>
                    <tr className="bg-cream/80 text-ghost text-xs uppercase tracking-widest">
                      <th className="p-4 font-medium">Time</th>
                      <th className="p-4 font-medium">Activity</th>
                      <th className="p-4 font-medium text-right">Cost</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-parchment">
                    {activities.length > 0 ? (
                      activities.map((act, actIdx) => (
                        <tr key={act.id} className="hover:bg-sand/30 transition-colors">
                          <td className="p-4 font-body text-ghost text-sm">TBD</td>
                          <td className="p-4">
                            <span className="font-body font-medium text-dusk">{act.activity_name}</span>
                          </td>
                          <td className="p-4 text-right font-body text-sm text-mist">${Number(act.cost_override).toFixed(2)}</td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan="3" className="p-8 text-center text-dusk/50 italic">
                          No activities added yet for this stop.
                        </td>
                      </tr>
                    )}
                    {/* OVERRIDE: Day Total Row */}
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
        
        {stops.length === 0 && (
          <div className="text-center py-12 bg-white rounded-2xl border border-parchment text-mist font-body">
            No stops in this itinerary yet.
          </div>
        )}
      </div>
    </div>
    </div>
  )
}
