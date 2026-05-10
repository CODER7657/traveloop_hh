import React from 'react'
import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { GripVertical, MapPin, Plus, Trash2 } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../../lib/supabase'
import { toast } from 'react-hot-toast'

export default function StopCard({ stop, refresh }) {
  const navigate = useNavigate()
  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id: stop.id })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  }

  const handleDelete = async () => {
    if (!window.confirm('Delete this stop?')) return
    try {
      await supabase.from('stops').delete().eq('id', stop.id)
      toast.success('Stop removed')
      refresh()
    } catch (e) {
      toast.error('Failed to delete')
    }
  }

  const removeActivity = async (actId) => {
    try {
      await supabase.from('trip_activities').delete().eq('id', actId)
      refresh()
    } catch (e) {
      toast.error('Failed to remove activity')
    }
  }

  const totalStopBudget = (stop.trip_activities || []).reduce((sum, act) => sum + Number(act.cost_override || 0), 0)

  return (
    <div ref={setNodeRef} style={style} className="bg-white border border-dusk/10 rounded-2xl shadow-sm overflow-hidden">
      <div className="bg-sand px-4 py-3 border-b border-dusk/5 flex justify-between items-center">
        <div className="flex items-center gap-3">
          <div {...attributes} {...listeners} className="cursor-grab hover:text-amber text-dusk/40 p-1">
            <GripVertical className="w-5 h-5" />
          </div>
          <h3 className="font-display font-bold text-xl flex items-center gap-2">
            <MapPin className="w-5 h-5 text-forest" />
            {stop.city_name}
          </h3>
        </div>
        <div className="flex gap-4 items-center">
          <span className="text-sm font-medium text-dusk/60">
            Stop sum: ${totalStopBudget.toFixed(2)}
          </span>
          <button onClick={handleDelete} className="p-2 text-red-400 hover:bg-red-50 rounded-lg transition-colors">
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>
      
      <div className="p-4">
        {stop.trip_activities?.length > 0 ? (
          <ul className="space-y-2 mb-4">
            {stop.trip_activities.map(act => (
              <li key={act.id} className="flex justify-between items-center bg-cream p-3 rounded-xl">
                <span className="font-medium text-dusk">{act.activity_name}</span>
                <div className="flex gap-4 items-center">
                  <span className="text-earth font-mono font-semibold">${Number(act.cost_override).toFixed(2)}</span>
                  <button onClick={() => removeActivity(act.id)} className="text-dusk/40 hover:text-red-500">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-sm text-dusk/50 mb-4 italic">No activities added yet.</p>
        )}

        <button 
          onClick={() => navigate(`/search/activities?stopId=${stop.id}&cityId=${stop.city_id}`)}
          className="text-amber hover:text-amber-dark text-sm font-medium flex items-center transition-colors"
        >
          <Plus className="w-4 h-4 mr-1" /> Add Activity
        </button>
      </div>
    </div>
  )
}