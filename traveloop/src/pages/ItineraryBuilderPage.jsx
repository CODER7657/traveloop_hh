import React, { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { Plus, ArrowLeft } from 'lucide-react'
import { toast } from 'react-hot-toast'
import StopCard from '../components/trip/StopCard'
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors } from '@dnd-kit/core'
import { SortableContext, arrayMove, sortableKeyboardCoordinates, verticalListSortingStrategy } from '@dnd-kit/sortable'

export default function ItineraryBuilderPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [trip, setTrip] = useState(null)
  const [stops, setStops] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchTripAndStops()
  }, [id])

  const fetchTripAndStops = async () => {
    try {
      const { data: tripData, error: tripErr } = await supabase.from('trips').select('*').eq('id', id).single()
      if (tripErr) throw tripErr
      setTrip(tripData)

      const { data: stopsData, error: stopsErr } = await supabase.from('stops').select('*, trip_activities(*)').eq('trip_id', id).order('order_index')
      if (stopsErr) throw stopsErr
      setStops(stopsData || [])
    } catch (err) {
      console.error(err)
      toast.error('Failed to load itinerary.')
    } finally {
      setLoading(false)
    }
  }

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  )

  const handleDragEnd = async (event) => {
    const { active, over } = event
    if (active.id !== over.id) {
      const oldIndex = stops.findIndex((s) => s.id === active.id)
      const newIndex = stops.findIndex((s) => s.id === over.id)
      
      const newStops = arrayMove(stops, oldIndex, newIndex).map((s, i) => ({ ...s, order_index: i }))
      setStops(newStops)

      // update supabase
      try {
        await supabase.from('stops').upsert(newStops.map(s => ({ id: s.id, order_index: s.order_index })))
      } catch (err) {
        toast.error('Failed to save order')
      }
    }
  }

  // Calculate Running Budget
  const totalBudget = stops.reduce((acc, stop) => {
    const stopTotal = (stop.trip_activities || []).reduce((sum, act) => sum + Number(act.cost_override || 0), 0)
    return acc + stopTotal
  }, 0)

  if (loading) return <div className="p-8">Loading itinerary...</div>

  return (
    <div className="max-w-4xl mx-auto p-4 lg:p-8">
      <button onClick={() => navigate(-1)} className="flex items-center text-forest mb-4 hover:underline">
        <ArrowLeft className="w-4 h-4 mr-2" /> Back
      </button>
      
      <div className="flex justify-between items-end mb-8">
        <div>
          <h1 className="text-3xl font-display font-bold">{trip?.name} - Builder</h1>
          <p className="text-earth mt-1">Add and manage your stops</p>
        </div>
        <div className="bg-amber/20 px-4 py-2 rounded-xl text-dusk">
          <span className="text-sm uppercase tracking-wider font-semibold text-amber-dark">Running Budget</span>
          <div className="text-2xl font-bold font-display">${totalBudget.toFixed(2)}</div>
        </div>
      </div>

      <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
        <SortableContext items={stops} strategy={verticalListSortingStrategy}>
          <div className="space-y-4">
            {stops.map(stop => (
              <StopCard key={stop.id} stop={stop} refresh={fetchTripAndStops} />
            ))}
          </div>
        </SortableContext>
      </DndContext>

      {stops.length === 0 && (
        <div className="text-center py-12 bg-white rounded-2xl border border-dusk/10 mt-6 shadow-sm">
          <p className="text-dusk/60">No stops added yet.</p>
        </div>
      )}

      <div className="mt-8 flex justify-center">
        <button 
          onClick={() => navigate(`/search?tripId=${id}`)}
          className="flex items-center btn-primary"
        >
          <Plus className="w-5 h-5 mr-2" /> Add New Stop
        </button>
      </div>
    </div>
  )
}