import React, { useState, useEffect } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { Search, ArrowLeft, Plus, Clock, DollarSign, Tag } from 'lucide-react'
import { toast } from 'react-hot-toast'
import { useDebounce } from '../hooks/useDebounce'
import { Input } from '../components/ui/Input'
import { Select } from '../components/ui/Select'
import { Skeleton } from '../components/ui/Skeleton'

export default function ActivitySearchPage() {
  const [searchParams] = useSearchParams()
  const stopId = searchParams.get('stopId')
  const cityId = searchParams.get('cityId')
  const navigate = useNavigate()
  
  const [query, setQuery] = useState('')
  const debouncedQuery = useDebounce(query, 300)
  
  // Filters
  const [type, setType] = useState('')
  const [maxCost, setMaxCost] = useState('')
  
  const [activities, setActivities] = useState([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (cityId) {
      searchActivities()
    }
  }, [debouncedQuery, type, maxCost, cityId])

  const searchActivities = async () => {
    setLoading(true)
    try {
      let q = supabase.from('activities').select('*').eq('city_id', cityId)
      
      if (debouncedQuery) q = q.ilike('name', `%${debouncedQuery}%`)
      if (type) q = q.eq('type', type)
      if (maxCost) q = q.lte('cost', Number(maxCost))
      
      const { data, error } = await q.limit(20)
      if (error) throw error
      setActivities(data || [])
    } catch (err) {
      toast.error('Search failed')
    } finally {
      setLoading(false)
    }
  }

  const handleAddActivity = async (activity) => {
    if (!stopId) return toast.error('No stop selected')
    try {
      const { error } = await supabase.from('trip_activities').insert({
        stop_id: stopId,
        activity_id: activity.id,
        activity_name: activity.name,
        cost_override: activity.cost
      })
      if (error) throw error
      toast.success(`${activity.name} added to stop!`)
      navigate(-1) // go back to builder
    } catch (err) {
      toast.error('Failed to add activity')
    }
  }

  return (
    <div className="max-w-4xl mx-auto p-4 lg:p-8">
      <button onClick={() => navigate(-1)} className="flex items-center text-forest mb-4 hover:underline">
        <ArrowLeft className="w-4 h-4 mr-2" /> Back to Builder
      </button>

      <h1 className="text-3xl font-display font-bold mb-6">Find Activities</h1>
      
      <div className="grid md:grid-cols-4 gap-4 mb-8">
        <div className="relative md:col-span-2">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-dusk/40 w-5 h-5" />
          <input 
            type="text" 
            placeholder="Search activities..." 
            className="input pl-12 h-full"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </div>
        
        <Select value={type} onChange={e => setType(e.target.value)}>
          <option value="">All Types</option>
          <option value="sightseeing">Sightseeing</option>
          <option value="food">Food</option>
          <option value="adventure">Adventure</option>
          <option value="culture">Culture</option>
          <option value="nightlife">Nightlife</option>
        </Select>

        <Input 
          type="number" 
          placeholder="Max Cost ($)" 
          value={maxCost}
          onChange={e => setMaxCost(e.target.value)}
        />
      </div>

      {loading ? (
        <div className="space-y-3">
          {Array.from({ length: 6 }).map((_, idx) => (
            <div className="card flex items-center justify-between" key={idx}>
              <div className="w-full space-y-2">
                <Skeleton className="h-5 w-1/3" />
                <Skeleton className="h-4 w-2/3" />
                <Skeleton className="h-4 w-1/2" />
              </div>
              <Skeleton className="ml-4 h-10 w-28 rounded-xl" />
            </div>
          ))}
        </div>
      ) : null}

      {!loading ? (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {activities.map(activity => (
            <div key={activity.id} className="card flex flex-col justify-between hover:border-amber transition-colors">
              <div>
                <h3 className="font-bold text-lg mb-2">{activity.name}</h3>
                <p className="text-sm text-dusk/70 mb-4 line-clamp-2">{activity.description}</p>
                
                <div className="flex flex-wrap gap-2 text-xs font-medium text-dusk/60 mb-4">
                  <span className="flex items-center bg-sand px-2 py-1 rounded-md">
                    <Tag className="w-3 h-3 mr-1" /> {activity.type}
                  </span>
                  <span className="flex items-center bg-sand px-2 py-1 rounded-md">
                    <DollarSign className="w-3 h-3 mr-1" /> {activity.cost}
                  </span>
                  <span className="flex items-center bg-sand px-2 py-1 rounded-md">
                    <Clock className="w-3 h-3 mr-1" /> {activity.duration_mins}m
                  </span>
                </div>
              </div>
              
              <button 
                onClick={() => handleAddActivity(activity)}
                className="btn-primary w-full flex items-center justify-center"
              >
                <Plus className="w-4 h-4 mr-2" /> Add to Stop
              </button>
            </div>
          ))}
        </div>
      ) : null}
      
      {!loading && activities.length === 0 && (
        <div className="text-center py-12 text-dusk/60 bg-white rounded-2xl border border-dusk/10">
          No activities found matching your criteria.
        </div>
      )}
    </div>
  )
}
