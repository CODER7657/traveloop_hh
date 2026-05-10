import { useEffect, useState } from 'react'
import { toast } from 'react-hot-toast'
import { NotebookPen, Plus, Save, Trash2 } from 'lucide-react'
import { supabase } from '../lib/supabase'
import { useAuthStore } from '../store/useAuthStore'
import { EmptyState } from '../components/shared/EmptyState'
import { Skeleton } from '../components/ui/Skeleton'

export default function NotesPage() {
  const { user } = useAuthStore()
  const [loading, setLoading] = useState(true)
  const [trips, setTrips] = useState([])
  const [tripId, setTripId] = useState('')
  const [notes, setNotes] = useState([])
  const [draft, setDraft] = useState('')

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

    const loadNotes = async () => {
      setLoading(true)
      const { data, error } = await supabase
        .from('notes')
        .select('id, content, created_at, updated_at')
        .eq('trip_id', tripId)
        .order('created_at', { ascending: false })

      if (error) {
        toast.error('Failed to load notes')
        setLoading(false)
        return
      }
      setNotes(data || [])
      setLoading(false)
    }

    loadNotes()
  }, [tripId])

  const saveNewNote = async () => {
    if (!tripId || !draft.trim()) return
    const payload = {
      trip_id: tripId,
      content: draft.trim(),
      updated_at: new Date().toISOString(),
    }
    const { data, error } = await supabase.from('notes').insert(payload).select('id, content, created_at, updated_at').single()
    if (error) {
      toast.error('Failed to save notes')
      return
    }
    toast.success('Notes saved')
    setNotes((prev) => [data, ...prev])
    setDraft('')
  }

  const updateNote = async (note) => {
    const { error } = await supabase
      .from('notes')
      .update({ content: note.content, updated_at: new Date().toISOString() })
      .eq('id', note.id)
    if (error) {
      toast.error('Failed to save notes')
      return
    }
    toast.success('Notes saved')
  }

  const deleteNote = async (id) => {
    const { error } = await supabase.from('notes').delete().eq('id', id)
    if (error) {
      toast.error('Failed to save notes')
      return
    }
    toast.success('Notes saved')
    setNotes((prev) => prev.filter((note) => note.id !== id))
  }

  return (
    <section className="space-y-6">
      <div className="flex items-end justify-between">
        <div>
          <h1 className="text-3xl font-display font-bold text-dusk">Notes</h1>
          <p className="mt-1 text-sm text-dusk/70">Keep important reminders for your trip.</p>
        </div>
      </div>

      <div className="card space-y-4">
        <div className="grid gap-3 md:grid-cols-4">
          <select className="input md:col-span-1" onChange={(e) => setTripId(e.target.value)} value={tripId}>
            <option value="">Select Trip</option>
            {trips.map((trip) => (
              <option key={trip.id} value={trip.id}>
                {trip.name}
              </option>
            ))}
          </select>
          <textarea
            className="input md:col-span-3 min-h-[88px] resize-y"
            onChange={(e) => setDraft(e.target.value)}
            placeholder="Write a note..."
            value={draft}
          />
        </div>
        <button className="btn-primary w-auto px-5" onClick={saveNewNote} type="button">
          <Plus className="mr-2 h-4 w-4" />
          Add Note
        </button>
      </div>

      {loading ? (
        <div className="space-y-3">
          {Array.from({ length: 4 }).map((_, idx) => (
            <Skeleton className="h-24" key={idx} />
          ))}
        </div>
      ) : null}

      {!loading && tripId && notes.length === 0 ? (
        <EmptyState
          actionLabel="Write your first note"
          icon={<NotebookPen className="h-12 w-12" />}
          message="Capture hotel details, reminders, and ideas for your itinerary."
          onAction={() => document.querySelector('textarea[placeholder="Write a note..."]')?.focus()}
          title="No notes yet"
        />
      ) : null}

      {!loading && notes.length > 0 ? (
        <div className="space-y-3">
          {notes.map((note) => (
            <article className="rounded-2xl border border-dusk/10 bg-white p-4" key={note.id}>
              <textarea
                className="input min-h-[92px] resize-y"
                onChange={(e) =>
                  setNotes((prev) => prev.map((current) => (current.id === note.id ? { ...current, content: e.target.value } : current)))
                }
                value={note.content || ''}
              />
              <div className="mt-3 flex justify-end gap-2">
                <button className="btn-ghost w-auto px-4 py-2" onClick={() => updateNote(note)} type="button">
                  <Save className="mr-2 h-4 w-4" />
                  Save
                </button>
                <button className="rounded-xl px-3 py-2 text-red-500 hover:bg-red-50" onClick={() => deleteNote(note.id)} type="button">
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </article>
          ))}
        </div>
      ) : null}
    </section>
  )
}
