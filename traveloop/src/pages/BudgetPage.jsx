import { useEffect, useMemo, useState } from 'react'
import { toast } from 'react-hot-toast'
import { Plus, Trash2, Wallet } from 'lucide-react'
import { supabase } from '../lib/supabase'
import { useAuthStore } from '../store/useAuthStore'
import { EmptyState } from '../components/shared/EmptyState'
import { Skeleton } from '../components/ui/Skeleton'

const categories = ['transport', 'stay', 'activities', 'meals', 'misc']

export default function BudgetPage() {
  const { user } = useAuthStore()
  const [loading, setLoading] = useState(true)
  const [trips, setTrips] = useState([])
  const [tripId, setTripId] = useState('')
  const [items, setItems] = useState([])
  const [label, setLabel] = useState('')
  const [amount, setAmount] = useState('')
  const [category, setCategory] = useState('misc')

  const selectedTrip = useMemo(() => trips.find((trip) => trip.id === tripId), [trips, tripId])

  useEffect(() => {
    if (!user?.id) return

    const loadTrips = async () => {
      setLoading(true)
      const { data, error } = await supabase
        .from('trips')
        .select('id, name, currency')
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

    const loadItems = async () => {
      setLoading(true)
      const { data, error } = await supabase
        .from('budget_items')
        .select('id, label, amount, category, date')
        .eq('trip_id', tripId)
        .order('date', { ascending: false })

      if (error) {
        toast.error('Failed to load expenses')
        setLoading(false)
        return
      }
      setItems(data || [])
      setLoading(false)
    }

    loadItems()
  }, [tripId])

  const addExpense = async () => {
    if (!tripId || !label.trim() || !amount) return

    const payload = {
      trip_id: tripId,
      label: label.trim(),
      amount: Number(amount),
      category,
      currency: selectedTrip?.currency || 'USD',
      date: new Date().toISOString().slice(0, 10),
    }

    const { error } = await supabase.from('budget_items').insert(payload)
    if (error) {
      toast.error('Failed to add expense')
      return
    }

    toast.success('Expense added')
    setLabel('')
    setAmount('')

    const { data } = await supabase
      .from('budget_items')
      .select('id, label, amount, category, date')
      .eq('trip_id', tripId)
      .order('date', { ascending: false })
    setItems(data || [])
  }

  const deleteExpense = async (id) => {
    const { error } = await supabase.from('budget_items').delete().eq('id', id)
    if (error) {
      toast.error('Failed to delete expense')
      return
    }
    toast.success('Expense deleted')
    setItems((prev) => prev.filter((item) => item.id !== id))
  }

  return (
    <section className="space-y-6">
      <div className="flex items-end justify-between">
        <div>
          <h1 className="text-3xl font-display font-bold text-dusk">Budget</h1>
          <p className="mt-1 text-sm text-dusk/70">Track your trip expenses in one place.</p>
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
          <input className="input md:col-span-1" onChange={(e) => setLabel(e.target.value)} placeholder="Expense label" value={label} />
          <input
            className="input md:col-span-1"
            min="0"
            onChange={(e) => setAmount(e.target.value)}
            placeholder="Amount"
            step="0.01"
            type="number"
            value={amount}
          />
          <select className="input md:col-span-1" onChange={(e) => setCategory(e.target.value)} value={category}>
            {categories.map((item) => (
              <option key={item} value={item}>
                {item}
              </option>
            ))}
          </select>
        </div>
        <button className="btn-primary w-auto px-5" onClick={addExpense} type="button">
          <Plus className="mr-2 h-4 w-4" />
          Add Expense
        </button>
      </div>

      {loading ? (
        <div className="space-y-3">
          {Array.from({ length: 4 }).map((_, idx) => (
            <Skeleton className="h-16" key={idx} />
          ))}
        </div>
      ) : null}

      {!loading && tripId && items.length === 0 ? (
        <EmptyState
          actionLabel="Add your first expense"
          icon={<Wallet className="h-12 w-12" />}
          message="Start tracking spend by adding your first budget item."
          onAction={() => document.querySelector('input[placeholder="Expense label"]')?.focus()}
          title="No expenses added"
        />
      ) : null}

      {!loading && items.length > 0 ? (
        <div className="overflow-hidden rounded-2xl border border-dusk/10 bg-white">
          <table className="w-full text-left">
            <thead className="bg-sand/60">
              <tr>
                <th className="px-4 py-3 text-sm font-medium text-dusk/80">Label</th>
                <th className="px-4 py-3 text-sm font-medium text-dusk/80">Category</th>
                <th className="px-4 py-3 text-sm font-medium text-dusk/80">Amount</th>
                <th className="px-4 py-3 text-sm font-medium text-dusk/80">Action</th>
              </tr>
            </thead>
            <tbody>
              {items.map((item) => (
                <tr className="border-t border-dusk/10" key={item.id}>
                  <td className="px-4 py-3 text-sm text-dusk">{item.label}</td>
                  <td className="px-4 py-3 text-sm capitalize text-dusk/70">{item.category}</td>
                  <td className="px-4 py-3 text-sm font-semibold text-dusk">${Number(item.amount).toFixed(2)}</td>
                  <td className="px-4 py-3">
                    <button className="rounded-lg p-2 text-dusk/40 hover:bg-red-50 hover:text-red-500" onClick={() => deleteExpense(item.id)} type="button">
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : null}
    </section>
  )
}
