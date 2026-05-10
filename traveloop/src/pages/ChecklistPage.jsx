import { useEffect, useMemo, useState } from 'react'
import { toast } from 'react-hot-toast'
import { CheckSquare, Plus, Trash2 } from 'lucide-react'
import { supabase } from '../lib/supabase'
import { useAuthStore } from '../store/useAuthStore'
import { EmptyState } from '../components/shared/EmptyState'
import { Skeleton } from '../components/ui/Skeleton'

const categories = ['clothing', 'documents', 'electronics', 'toiletries', 'misc']

export default function ChecklistPage() {
  const { user } = useAuthStore()
  const [trips, setTrips] = useState([])
  const [tripId, setTripId] = useState('')
  const [loading, setLoading] = useState(true)
  const [items, setItems] = useState([])
  const [label, setLabel] = useState('')
  const [category, setCategory] = useState('misc')

  const packedCount = useMemo(() => items.filter((item) => item.is_packed).length, [items])

  useEffect(() => {
    if (!user?.id) return

    const loadTrips = async () => {
      setLoading(true)
      const { data, error } = await supabase
        .from('trips')
        .select('id, name')
        .eq('user_id', user.id)
        .order('start_date', { ascending: true })

      if (error) {
        toast.error('Failed to load trips')
        setLoading(false)
        return
      }

      setTrips(data || [])
      if (data?.[0]?.id) setTripId(data[0].id)
      setLoading(false)
    }

    loadTrips()
  }, [user?.id])

  useEffect(() => {
    if (!tripId) return
    const loadChecklist = async () => {
      setLoading(true)
      const { data, error } = await supabase
        .from('checklist_items')
        .select('id, label, category, is_packed, order_index')
        .eq('trip_id', tripId)
        .order('order_index', { ascending: true })

      if (error) {
        toast.error('Failed to load checklist')
        setLoading(false)
        return
      }
      setItems(data || [])
      setLoading(false)
    }
    loadChecklist()
  }, [tripId])

  const addItem = async () => {
    if (!tripId || !label.trim()) return
    const nextIndex = items.length
    const { error, data } = await supabase
      .from('checklist_items')
      .insert({
        trip_id: tripId,
        label: label.trim(),
        category,
        is_packed: false,
        order_index: nextIndex,
      })
      .select('id, label, category, is_packed, order_index')
      .single()

    if (error) {
      toast.error('Failed to save checklist')
      return
    }

    toast.success('Checklist saved')
    setItems((prev) => [...prev, data])
    setLabel('')
  }

  const togglePacked = async (item) => {
    const nextValue = !item.is_packed
    const { error } = await supabase.from('checklist_items').update({ is_packed: nextValue }).eq('id', item.id)
    if (error) {
      toast.error('Failed to save checklist')
      return
    }
    toast.success('Checklist saved')
    setItems((prev) => prev.map((current) => (current.id === item.id ? { ...current, is_packed: nextValue } : current)))
  }

  const deleteItem = async (id) => {
    const { error } = await supabase.from('checklist_items').delete().eq('id', id)
    if (error) {
      toast.error('Failed to save checklist')
      return
    }
    toast.success('Checklist saved')
    setItems((prev) => prev.filter((item) => item.id !== id))
  }

  return (
    <section className="space-y-6">
      <div className="flex items-end justify-between">
        <div>
          <h1 className="text-3xl font-display font-bold text-dusk">Packing Checklist</h1>
          <p className="mt-1 text-sm text-dusk/70">
            {packedCount}/{items.length} packed
          </p>
        </div>
      </div>

      <div className="card space-y-4">
        <div className="grid gap-3 md:grid-cols-3">
          <select className="input" onChange={(e) => setTripId(e.target.value)} value={tripId}>
            <option value="">Select Trip</option>
            {trips.map((trip) => (
              <option key={trip.id} value={trip.id}>
                {trip.name}
              </option>
            ))}
          </select>
          <input className="input" onChange={(e) => setLabel(e.target.value)} placeholder="Checklist item" value={label} />
          <select className="input" onChange={(e) => setCategory(e.target.value)} value={category}>
            {categories.map((item) => (
              <option key={item} value={item}>
                {item}
              </option>
            ))}
          </select>
        </div>
        <button className="btn-primary w-auto px-5" onClick={addItem} type="button">
          <Plus className="mr-2 h-4 w-4" />
          Add Item
        </button>
      </div>

      {loading ? (
        <div className="space-y-3">
          {Array.from({ length: 5 }).map((_, idx) => (
            <Skeleton className="h-14" key={idx} />
          ))}
        </div>
      ) : null}

      {!loading && tripId && items.length === 0 ? (
        <EmptyState
          actionLabel="Add your first item"
          icon={<CheckSquare className="h-12 w-12" />}
          message="Create your packing list so you do not miss essentials."
          onAction={() => document.querySelector('input[placeholder="Checklist item"]')?.focus()}
          title="Nothing to pack yet"
        />
      ) : null}

      {!loading && items.length > 0 ? (
        <div className="space-y-2">
          {items.map((item) => (
            <div className="flex items-center justify-between rounded-xl border border-dusk/10 bg-white px-4 py-3" key={item.id}>
              <button className="flex items-center gap-3 text-left" onClick={() => togglePacked(item)} type="button">
                <input
                  checked={item.is_packed}
                  onChange={() => togglePacked(item)}
                  onClick={(event) => event.stopPropagation()}
                  type="checkbox"
                />
                <span className={item.is_packed ? 'text-dusk/40 line-through' : 'text-dusk'}>{item.label}</span>
              </button>
              <button className="rounded-lg p-2 text-dusk/40 hover:bg-red-50 hover:text-red-500" onClick={() => deleteItem(item.id)} type="button">
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          ))}
        </div>
      ) : null}
    </section>
  )
}
