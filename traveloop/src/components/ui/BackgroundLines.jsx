import { cn } from '../../lib/utils'

/**
 * BackgroundLines — Aceternity UI inspired animated line grid.
 * Used on the Itinerary View page at opacity-15.
 */
export function BackgroundLines({ className }) {
  return (
    <div
      className={cn('pointer-events-none absolute inset-0 overflow-hidden', className)}
      aria-hidden="true"
    >
      <svg
        className="absolute h-full w-full"
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 800 800"
        preserveAspectRatio="xMidYMid slice"
      >
        <defs>
          <pattern id="lines-h" x="0" y="0" width="800" height="60" patternUnits="userSpaceOnUse">
            <line x1="0" y1="0" x2="800" y2="0" stroke="#c4956a" strokeWidth="0.6" strokeOpacity="0.25" />
          </pattern>
          <pattern id="lines-v" x="0" y="0" width="60" height="800" patternUnits="userSpaceOnUse">
            <line x1="0" y1="0" x2="0" y2="800" stroke="#c4956a" strokeWidth="0.6" strokeOpacity="0.15" />
          </pattern>
        </defs>
        <rect width="800" height="800" fill="url(#lines-h)" />
        <rect width="800" height="800" fill="url(#lines-v)" />

        {/* Diagonal accent lines */}
        {[...Array(4)].map((_, i) => (
          <line
            key={i}
            x1={i * 250}
            y1="0"
            x2={i * 250 + 400}
            y2="800"
            stroke="#f4a940"
            strokeWidth="0.5"
            strokeOpacity="0.1"
          />
        ))}
      </svg>
    </div>
  )
}
