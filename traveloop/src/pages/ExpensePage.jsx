import React, { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import { useAuthStore } from '../store/useAuthStore'
import { DollarSign, Download, ArrowRight } from 'lucide-react'
import { Select } from '../components/ui/Select'

export default function ExpensePage() {
  const { user } = useAuthStore()
  const [trips, setTrips] = useState([])
  const [loading, setLoading] = useState(true)
  
  // OVERRIDE: Currency selector
  const [currency, setCurrency] = useState('USD')

  useEffect(() => {
    if (user?.id) fetchExpenses()
  }, [user])

  const fetchExpenses = async () => {
    try {
      // Fetch all trips and their stops and activities to calculate totals
      const { data, error } = await supabase
        .from('trips')
        .select(`
          id, 
          title, 
          start_date,
          stops (
            trip_activities (
              cost_override
            )
          )
        `)
        .eq('user_id', user.id)

      if (error) throw error

      const formatted = data.map(trip => {
        let total = 0
        trip.stops?.forEach(stop => {
          stop.trip_activities?.forEach(act => {
            total += Number(act.cost_override) || 0
          })
        })
        return { ...trip, totalCost: total }
      })

      setTrips(formatted)
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const handleDownloadInvoice = () => {
    // OVERRIDE: Faux download invoice
    alert(`Downloading Expense Invoice in ${currency}...`)
  }

  const getCurrencySymbol = () => {
    switch (currency) {
      case 'EUR': return '€'
      case 'GBP': return '£'
      case 'JPY': return '¥'
      default: return '$'
    }
  }

  return (
    <div className="max-w-4xl mx-auto p-4 lg:p-8">
      <h1 className="text-3xl font-display font-bold mb-8">Expenses & Budget</h1>

      <div className="bg-white rounded-2xl shadow-sm border border-dusk/10 overflow-hidden">
        {/* OVERRIDE Header Controls */}
        <div className="p-6 border-b border-dusk/5 flex flex-col sm:flex-row justify-between gap-4 items-center bg-sand/30">
          <div className="flex items-center gap-3">
            <div className="bg-amber/10 text-amber p-2 rounded-lg">
              <DollarSign className="w-5 h-5" />
            </div>
            <h2 className="text-xl font-bold font-display">Trip Ledgers</h2>
          </div>
          
          <div className="flex items-center gap-3">
            <Select 
              value={currency} 
              onChange={e => setCurrency(e.target.value)}
              className="w-24 h-10"
            >
              <option value="USD">USD ($)</option>
              <option value="EUR">EUR (€)</option>
              <option value="GBP">GBP (£)</option>
              <option value="JPY">JPY (¥)</option>
            </Select>
            <button 
              onClick={handleDownloadInvoice}
              className="btn-primary h-10 px-4 text-sm"
            >
              <Download className="w-4 h-4 mr-2" /> Invoice
            </button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[500px]">
            <thead>
              <tr className="bg-cream/50 text-dusk/70 text-sm uppercase tracking-wider border-b border-dusk/10">
                <th className="p-4 font-medium">Trip</th>
                <th className="p-4 font-medium">Date</th>
                <th className="p-4 font-medium text-right">Total Spent</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-dusk/5">
              {loading ? (
                <tr><td colSpan="3" className="p-8 text-center text-dusk/50">Loading ledger...</td></tr>
              ) : trips.length > 0 ? (
                trips.map(trip => (
                  <tr key={trip.id} className="hover:bg-sand/30 transition-colors">
                    <td className="p-4 font-medium text-dusk">{trip.title}</td>
                    <td className="p-4 text-dusk/60">
                      {new Date(trip.start_date).toLocaleDateString()}
                    </td>
                    <td className="p-4 text-right font-bold text-forest">
                      {getCurrencySymbol()}{trip.totalCost.toFixed(2)}
                    </td>
                  </tr>
                ))
              ) : (
                <tr><td colSpan="3" className="p-8 text-center text-dusk/50">No trips recorded yet.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}