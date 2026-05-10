import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { useAuthStore } from '../store/useAuthStore'
import { User, LogOut, Map, ArrowRight, Save, Pencil, X } from 'lucide-react'
import { toast } from 'react-hot-toast'

const STYLES = ['Adventure', 'Relaxation', 'Food', 'Budget', 'Luxury']

export default function ProfilePage() {
  const { user, profile, signOut } = useAuthStore()
  const [stats, setStats] = useState({ planned: 0, completed: 0 })
  const [loading, setLoading] = useState(true)
  const [editing, setEditing] = useState(false)
  const [editName, setEditName] = useState('')
  const [editStyle, setEditStyle] = useState('')
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (user?.id) fetchTrips()
  }, [user])

  useEffect(() => {
    if (profile) {
      setEditName(profile.name || '')
      setEditStyle(profile.travel_style || '')
    }
  }, [profile])

  const fetchTrips = async () => {
    try {
      const { data, error } = await supabase
        .from('trips')
        .select('end_date')
        .eq('user_id', user.id)

      if (error) throw error

      const today = new Date().toISOString()
      const completed = data.filter(t => t.end_date && t.end_date < today).length
      const planned = data.length - completed

      setStats({ planned, completed })
    } catch (err) {
      console.error('Error fetching trips for profile stats', err)
    } finally {
      setLoading(false)
    }
  }

  const handleSaveProfile = async () => {
    setSaving(true)
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ name: editName, travel_style: editStyle })
        .eq('id', user.id)

      if (error) throw error
      toast.success('Profile updated!')
      setEditing(false)
      // Update localStorage user too
      const storedUser = JSON.parse(localStorage.getItem('traveloop-user') || '{}')
      storedUser.name = editName
      storedUser.travel_style = editStyle
      localStorage.setItem('traveloop-user', JSON.stringify(storedUser))
    } catch (err) {
      toast.error('Failed to update profile')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="max-w-2xl mx-auto p-4 lg:p-8">
      <h1 className="text-3xl font-display font-bold mb-8">My Profile</h1>

      <div className="bg-white border border-dusk/10 rounded-2xl shadow-sm overflow-hidden mb-6">
        <div className="p-6 md:p-8 flex flex-col md:flex-row items-center gap-6">
          <div className="w-24 h-24 bg-sand rounded-full flex items-center justify-center text-forest overflow-hidden flex-shrink-0">
            {profile?.avatar_url ? (
              <img src={profile.avatar_url} alt="Avatar" className="w-full h-full object-cover" />
            ) : (
              <User className="w-10 h-10" />
            )}
          </div>

          <div className="text-center md:text-left flex-1">
            {editing ? (
              <div className="space-y-3">
                <div>
                  <label className="block text-xs font-medium text-dusk/60 mb-1">Display Name</label>
                  <input
                    className="w-full bg-sand border border-dusk/15 rounded-xl px-4 py-2.5 text-dusk text-sm focus:outline-none focus:border-amber focus:ring-2 focus:ring-amber/20 transition-all"
                    value={editName}
                    onChange={e => setEditName(e.target.value)}
                    placeholder="Your name"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-dusk/60 mb-1">Travel Style</label>
                  <select
                    className="w-full bg-sand border border-dusk/15 rounded-xl px-4 py-2.5 text-dusk text-sm focus:outline-none focus:border-amber focus:ring-2 focus:ring-amber/20 transition-all"
                    value={editStyle}
                    onChange={e => setEditStyle(e.target.value)}
                  >
                    <option value="">Select style</option>
                    {STYLES.map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>
                <div className="flex gap-2">
                  <button onClick={handleSaveProfile} disabled={saving} className="btn-primary px-4 py-2 text-sm flex items-center gap-1.5">
                    <Save className="w-4 h-4" /> {saving ? 'Saving...' : 'Save'}
                  </button>
                  <button onClick={() => setEditing(false)} className="btn-ghost px-4 py-2 text-sm flex items-center gap-1.5">
                    <X className="w-4 h-4" /> Cancel
                  </button>
                </div>
              </div>
            ) : (
              <>
                <div className="flex items-center gap-2">
                  <h2 className="text-2xl font-bold font-display">{profile?.name || 'Traveler'}</h2>
                  <button
                    onClick={() => setEditing(true)}
                    className="p-1.5 text-dusk/40 hover:text-amber hover:bg-amber/10 rounded-lg transition-colors"
                    title="Edit profile"
                  >
                    <Pencil className="w-4 h-4" />
                  </button>
                </div>
                <p className="text-dusk/60 mb-2">{user?.email}</p>

                {profile?.travel_style && (
                  <span className="inline-block bg-forest/10 text-forest font-medium px-3 py-1 rounded-full text-sm">
                    Style: {profile.travel_style}
                  </span>
                )}
              </>
            )}
          </div>
        </div>

        {/* Summary line */}
        <div className="border-t border-dusk/5 bg-cream p-6">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-white rounded-lg text-amber drop-shadow-sm border border-dusk/5">
                <Map className="w-5 h-5" />
              </div>
              <div>
                {!loading ? (
                  <p className="font-medium text-lg text-dusk">
                    {stats.planned} trips planned &middot; {stats.completed} completed
                  </p>
                ) : (
                  <div className="animate-pulse bg-dusk/10 h-6 w-48 rounded"></div>
                )}
                <p className="text-sm text-dusk/50">Keep track of your adventures.</p>
              </div>
            </div>

            <Link to="/trips" className="btn-ghost flex items-center bg-white">
              My Trips <ArrowRight className="w-4 h-4 ml-2" />
            </Link>
          </div>
        </div>
      </div>

      <div className="flex justify-end">
        <button
          onClick={signOut}
          className="flex items-center text-red-500 hover:text-red-700 font-medium px-4 py-2 hover:bg-red-50 rounded-xl transition-colors"
        >
          <LogOut className="w-5 h-5 mr-2" />
          Sign Out
        </button>
      </div>
    </div>
  )
}