import React, { useState, useEffect } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { Search, MapPin, Plus, ArrowLeft, Globe } from 'lucide-react'
import { toast } from 'react-hot-toast'
import { useDebounce } from '../hooks/useDebounce'
import { Skeleton } from '../components/ui/Skeleton'
import CityExploreModal from '../components/ui/CityExploreModal'

export default function CitySearchPage() {
  const [searchParams] = useSearchParams()
  const tripId = searchParams.get('tripId')
  const navigate = useNavigate()

  const [query, setQuery] = useState('')
  const debouncedQuery = useDebounce(query, 300)
  const [cities, setCities] = useState([])
  const [loading, setLoading] = useState(true)
  const [selectedCity, setSelectedCity] = useState(null)

  // Load popular cities on mount; filter as user types
  useEffect(() => {
    fetchCities()
  }, [debouncedQuery])

  const fetchCities = async () => {
    setLoading(true)
    try {
      let q = supabase.from('cities').select('*')
      if (debouncedQuery.trim().length >= 2) {
        q = q.ilike('name', `%${debouncedQuery}%`)
      } else {
        q = q.order('popularity', { ascending: false })
      }
      const { data, error } = await q.limit(24)
      if (error) throw error
      setCities(data || [])
    } catch (err) {
      toast.error('Failed to load cities')
    } finally {
      setLoading(false)
    }
  }

  const handleAddCityToTrip = async (city) => {
    if (!tripId) return toast.error('No trip selected. Open a trip first.')
    try {
      const { data: existing } = await supabase
        .from('stops')
        .select('order_index')
        .eq('trip_id', tripId)
        .order('order_index', { ascending: false })
        .limit(1)
      const nextIndex = existing?.length > 0 ? existing[0].order_index + 1 : 0
      const { error } = await supabase.from('stops').insert({
        trip_id: tripId,
        city_id: city.id,
        city_name: city.name,
        order_index: nextIndex,
      })
      if (error) throw error
      toast.success(`${city.name} added to trip!`)
      navigate(`/trips/${tripId}/build`)
    } catch (err) {
      toast.error('Failed to add stop')
    }
  }

  // Gradient fallback palettes keyed by city name initial
  const gradients = [
    'from-amber/30 to-earth/20',
    'from-forest/20 to-amber/10',
    'from-mist/30 to-ghost/20',
    'from-earth/20 to-sand',
    'from-amber/20 to-forest/10',
  ]
  const getGradient = (name) => gradients[name.charCodeAt(0) % gradients.length]

  const costLabel = (idx) => ['', '$', '$$', '$$$', '$$$$', '$$$$$'][idx] || ''

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <button
          onClick={() => navigate(-1)}
          className="p-2 hover:bg-sand rounded-xl transition-colors min-h-[44px] min-w-[44px] flex items-center justify-center"
        >
          <ArrowLeft className="w-5 h-5 text-mist" />
        </button>
        <div>
          <h1 className="font-display text-4xl font-semibold text-dusk">Discover Cities</h1>
          <p className="font-body text-sm text-mist mt-0.5">
            {tripId ? 'Choose a city to add as a stop' : 'Explore destinations around the world'}
          </p>
        </div>
      </div>

      {/* Search bar */}
      <div className="relative">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-ghost w-5 h-5" />
        <input
          type="text"
          placeholder="Search cities, countries…"
          className="input pl-12 py-4 text-base"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          autoFocus
        />
      </div>

      <p className="section-label">
        {debouncedQuery.length >= 2 ? `Results for "${debouncedQuery}"` : 'Popular destinations'}
      </p>

      {/* Loading skeletons */}
      {loading && (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 9 }).map((_, idx) => (
            <div className="bg-white border border-parchment rounded-2xl p-4 flex items-center gap-4" key={idx}>
              <Skeleton className="h-12 w-12 rounded-xl shrink-0" />
              <div className="flex-1 space-y-2">
                <Skeleton className="h-4 w-2/3" />
                <Skeleton className="h-3 w-1/3" />
              </div>
            </div>
          ))}
        </div>
      )}

      {/* City grid */}
      {!loading && cities.length > 0 && (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {cities.map((city) => (
            <div
              key={city.id}
              className="bg-white border border-parchment rounded-2xl overflow-hidden shadow-sm hover:shadow-md hover:-translate-y-1 transition-all duration-300 group"
            >
              {/* Cover image */}
              <div className="h-36 bg-sand overflow-hidden relative">
                {city.image_url ? (
                  <img
                    src={city.image_url}
                    alt={city.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    onError={(e) => {
                      e.target.style.display = 'none'
                      e.target.nextSibling.style.display = 'flex'
                    }}
                  />
                ) : null}
                {/* Gradient fallback — always rendered, hidden when real image loads */}
                <div
                  className={`w-full h-full bg-gradient-to-br ${getGradient(city.name)} flex items-center justify-center ${
                    city.image_url ? 'hidden' : 'flex'
                  }`}
                >
                  <span className="font-display text-4xl font-bold text-dusk/20">
                    {city.name.charAt(0)}
                  </span>
                </div>
                {city.cost_index ? (
                  <span className="absolute top-2 right-2 bg-white/90 backdrop-blur font-body text-xs font-medium px-2 py-0.5 rounded-full text-earth">
                    {costLabel(city.cost_index)}
                  </span>
                ) : null}
              </div>

              {/* Info + action */}
              <div className="p-4 flex items-center justify-between">
                <div>
                  <h3 className="font-display text-xl font-semibold text-dusk">{city.name}</h3>
                  <p className="font-body text-xs text-mist">
                    {city.country}{city.continent ? ` · ${city.continent}` : ''}
                  </p>
                </div>
                {tripId ? (
                  <button
                    onClick={() => handleAddCityToTrip(city)}
                    className="bg-amber/10 text-amber hover:bg-amber hover:text-dusk p-2.5 rounded-xl transition-all duration-200 min-w-[44px] min-h-[44px] flex items-center justify-center"
                    title={`Add ${city.name} to trip`}
                  >
                    <Plus className="w-5 h-5" />
                  </button>
                ) : (
                  <button
                    onClick={() => setSelectedCity(city)}
                    className="font-body text-xs text-amber border border-amber/30 hover:bg-amber hover:text-dusk px-3 py-1.5 rounded-full flex items-center gap-1 transition-all duration-200"
                  >
                    <MapPin className="w-3 h-3" /> Explore
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Empty state */}
      {!loading && cities.length === 0 && (
        <div className="text-center py-16 bg-white rounded-2xl border border-parchment">
          <Globe className="w-12 h-12 text-ghost mx-auto mb-3" />
          <h3 className="font-display text-2xl text-dusk mb-1">No cities found</h3>
          <p className="font-body text-sm text-mist">Try a different search term</p>
        </div>
      )}

      {/* City Explore Modal */}
      {selectedCity && (
        <CityExploreModal
          city={selectedCity}
          tripId={tripId}
          onClose={() => setSelectedCity(null)}
          onAddToTrip={(city) => {
            setSelectedCity(null)
            handleAddCityToTrip(city)
          }}
        />
      )}
    </div>
  )
}
