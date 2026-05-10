import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { toast } from 'react-hot-toast'
import { nanoid } from 'nanoid'
import { ArrowLeft, Image as ImageIcon } from 'lucide-react'
import { supabase } from '../lib/supabase'
import { useAuthStore } from '../store/useAuthStore'
import { Button } from '../components/ui/Button'
import { Input } from '../components/ui/Input'
import { Select } from '../components/ui/Select'

const VIBES = [
  { value: '', label: 'Select a vibe' },
  { value: 'Adventure', label: '🏔 Adventure' },
  { value: 'Relaxation', label: '🧘 Relaxation' },
  { value: 'Food', label: '🍜 Food' },
  { value: 'Budget', label: '💰 Budget' },
  { value: 'Luxury', label: '💎 Luxury' }
]

const CURRENCIES = [
  { value: 'USD', label: 'USD ($)' },
  { value: 'INR', label: 'INR (₹)' },
  { value: 'EUR', label: 'EUR (€)' }
]

const tripSchema = z.object({
  name: z.string().min(2, 'Trip Name is required'),
  description: z.string().optional(),
  start_date: z.string().min(1, 'Start Date is required'),
  end_date: z.string().min(1, 'End Date is required'),
  vibe_tag: z.string().optional(),
  total_budget: z.string().optional().transform(val => (val === '' ? 0 : Number(val))),
  currency: z.string().default('USD'),
  is_public: z.boolean().default(false),
})

export default function CreateTripPage() {
  const navigate = useNavigate()
  const { user, profile } = useAuthStore()
  const [loading, setLoading] = useState(false)

  const { register, handleSubmit, formState: { errors } } = useForm({
    resolver: zodResolver(tripSchema),
    defaultValues: {
      currency: 'USD',
      is_public: false
    }
  })

  const onSubmit = async (data) => {
    try {
      setLoading(true)

      // Guard: profile must exist (FK trips.user_id → profiles.id)
      if (!profile) {
        toast.error('Profile not ready. Please wait a moment and try again.')
        return
      }

      const slug = data.is_public ? nanoid(8) : null

      const { data: trip, error } = await supabase
        .from('trips')
        .insert({
          user_id: user.id,
          name: data.name,
          description: data.description,
          start_date: data.start_date,
          end_date: data.end_date,
          vibe_tag: data.vibe_tag,
          total_budget: data.total_budget,
          currency: data.currency,
          is_public: data.is_public,
          slug
        })
        .select()
        .single()

      if (error) throw error

      toast.success('Trip created successfully!')
      // Redirect to builder
      navigate(`/trips/${trip.id}/build`)
    } catch (error) {
      toast.error(error.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="flex items-center gap-4 mb-6">
        <button onClick={() => navigate(-1)} className="p-2 hover:bg-dusk/5 rounded-full transition-colors">
          <ArrowLeft className="w-5 h-5" />
        </button>
        <h1 className="text-2xl font-display font-bold">Create New Trip</h1>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="card space-y-6">
        {/* OVERRIDE: Trip Name at the very top */}
        <Input
          label="Trip Name *"
          placeholder="e.g. Summer in Tokyo"
          {...register('name')}
          error={errors.name?.message}
        />

        <div className="space-y-1.5">
          <label className="block text-sm font-medium text-dusk">Description</label>
          <textarea
            className="w-full bg-sand border border-dusk/15 rounded-xl px-4 py-2.5 text-dusk placeholder:text-dusk/40 focus:outline-none focus:border-amber focus:ring-2 focus:ring-amber/20 transition-all resize-none"
            rows="3"
            placeholder="What's the goal of this trip?"
            {...register('description')}
          ></textarea>
        </div>

        {/* OVERRIDE: Start Date and End Date explicitly labeled and side-by-side */}
        <div className="grid grid-cols-2 gap-4">
          <Input
            type="date"
            label="Start Date *"
            {...register('start_date')}
            error={errors.start_date?.message}
          />
          <Input
            type="date"
            label="End Date *"
            {...register('end_date')}
            error={errors.end_date?.message}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Select
            label="Trip Vibe"
            options={VIBES}
            {...register('vibe_tag')}
            error={errors.vibe_tag?.message}
          />
        </div>

        <div className="space-y-1.5">
          <label className="block text-sm font-medium text-dusk">Cover Photo (optional)</label>
          <div className="border-2 border-dashed border-dusk/15 rounded-xl p-6 flex flex-col items-center justify-center text-secondary hover:bg-sand/50 transition-colors cursor-pointer">
            <ImageIcon className="w-8 h-8 mb-2 opacity-50" />
            <p className="text-sm">Drop image here or click browse</p>
            <p className="text-xs opacity-60 mt-1">Or auto-generate from destination later</p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <Input
            label="Total Budget (optional)"
            type="number"
            step="0.01"
            placeholder="0.00"
            {...register('total_budget')}
            error={errors.total_budget?.message}
          />
          <Select
            label="Currency"
            options={CURRENCIES}
            {...register('currency')}
            error={errors.currency?.message}
          />
        </div>

        <div className="flex items-center justify-between p-4 bg-sand/50 rounded-xl">
          <div>
            <p className="font-medium text-dusk">Make Public</p>
            <p className="text-sm text-secondary">Generate a shareable link for friends</p>
          </div>
          <label className="relative inline-flex items-center cursor-pointer">
            <input type="checkbox" className="sr-only peer" {...register('is_public')} />
            <div className="w-11 h-6 bg-dusk/20 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-amber"></div>
          </label>
        </div>

        <div className="flex gap-4 pt-4 border-t border-dusk/5">
          <Button type="button" variant="ghost" onClick={() => navigate(-1)}>
            Cancel
          </Button>
          <Button type="submit" disabled={loading}>
            {loading ? 'Creating...' : 'Create Trip →'}
          </Button>
        </div>
      </form>

      {/* Popular Destinations */}
      <div className="pt-6">
        <h3 className="font-display font-bold text-2xl mb-4 text-dusk">Popular Destinations</h3>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { name: 'Goa',    img: 'https://images.unsplash.com/photo-1512343879784-a960bf40e7f2?w=400&h=300&fit=crop' },
            { name: 'Jaipur', img: 'https://images.unsplash.com/photo-1599661046289-e31897846e41?w=400&h=300&fit=crop' },
            { name: 'Manali', img: 'https://images.unsplash.com/photo-1626621341517-bbf3d9990a23?w=400&h=300&fit=crop' },
            { name: 'Varanasi', img: 'https://images.unsplash.com/photo-1561361513-2d000a50f0dc?w=400&h=300&fit=crop' },
          ].map(({ name, img }) => (
            <div key={name} className="bg-white rounded-2xl shadow-sm border border-parchment cursor-pointer hover:shadow-md transition-all hover:-translate-y-1 overflow-hidden group">
              <div className="h-24 overflow-hidden">
                <img
                  src={img}
                  alt={name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
              </div>
              <p className="font-body font-medium text-center text-sm text-dusk py-2">{name}</p>
            </div>
          ))}
        </div>
      </div>

    </div>
  )
}
