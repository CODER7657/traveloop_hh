import { Link } from 'react-router-dom'
import { CalendarDays, Trash2 } from 'lucide-react'
import { differenceInDays, format, parseISO } from 'date-fns'

const clamp = (value, min, max) => Math.min(max, Math.max(min, value))

export const TripCard = ({ trip, onDelete }) => {
  const today = new Date()
  const start = parseISO(trip.start_date)
  const end = parseISO(trip.end_date)
  const createdAt = trip.created_at ? parseISO(trip.created_at) : null

  const daysLeft = differenceInDays(start, today)
  const isOngoing = today >= start && today <= end
  const isCompleted = today > end

  const fallbackLeadDays = 30
  const totalLeadDays = createdAt ? Math.max(1, differenceInDays(start, createdAt)) : fallbackLeadDays
  const elapsedLeadDays = createdAt ? Math.max(0, differenceInDays(today, createdAt)) : fallbackLeadDays - daysLeft
  const progressPct = clamp(Math.round((elapsedLeadDays / totalLeadDays) * 100), 0, 100)

  return (
    <article className="overflow-hidden rounded-2xl border border-dusk/10 bg-white shadow-sm transition hover:shadow-md">
      <div className="h-40 bg-sand">
        {trip.cover_url ? (
          <img alt={trip.name} className="h-full w-full object-cover" loading="lazy" src={trip.cover_url} />
        ) : (
          <div className="flex h-full items-center justify-center text-xs font-semibold uppercase tracking-widest text-dusk/30">
            No cover
          </div>
        )}
      </div>

      <div className="space-y-3 p-5">
        <div className="flex items-start justify-between gap-2">
          <h3 className="truncate text-lg font-bold text-dusk">{trip.name}</h3>
          {onDelete ? (
            <button
              className="rounded-lg p-1.5 text-dusk/40 transition hover:bg-red-50 hover:text-red-500"
              onClick={() => onDelete(trip)}
              type="button"
            >
              <Trash2 className="h-4 w-4" />
            </button>
          ) : null}
        </div>
        <p className="flex items-center gap-1.5 text-sm text-dusk/70">
          <CalendarDays className="h-4 w-4" />
          <span>
            {format(start, 'MMM d, yyyy')} - {format(end, 'MMM d, yyyy')}
          </span>
        </p>

        {isCompleted ? (
          <div className="inline-flex rounded-full bg-forest/10 px-3 py-1 text-sm font-medium text-forest">✅ Completed</div>
        ) : null}

        {isOngoing ? (
          <div className="inline-flex rounded-full bg-amber/15 px-3 py-1 text-sm font-medium text-amber-dark">🟢 In Progress</div>
        ) : null}

        {!isCompleted && !isOngoing ? (
          <div className="space-y-1.5">
            <div className="h-1.5 overflow-hidden rounded-full bg-sand">
              <div className="h-full rounded-full bg-amber" style={{ width: `${progressPct}%` }} />
            </div>
            <p className="text-xs font-medium text-dusk/70">{Math.max(0, daysLeft)} days away</p>
          </div>
        ) : null}

        <div className="pt-1">
          <Link className="text-sm font-medium text-amber hover:text-amber-dark" to={`/trips/${trip.id}`}>
            View itinerary
          </Link>
        </div>
      </div>
    </article>
  )
}
