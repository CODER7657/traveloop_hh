import { useEffect, useRef } from 'react'
import { cn } from '../../lib/utils'

/**
 * BackgroundBeams — Aceternity UI inspired animated beam background.
 * Used on the Dashboard page at opacity-20 to 0.30.
 */
export function BackgroundBeams({ className }) {
  return (
    <div
      className={cn(
        'pointer-events-none absolute inset-0 overflow-hidden',
        className
      )}
      aria-hidden="true"
    >
      <svg
        className="absolute h-full w-full"
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 800 800"
        preserveAspectRatio="xMidYMid slice"
      >
        <defs>
          <radialGradient id="beam-grad-1" cx="50%" cy="0%" r="70%">
            <stop offset="0%" stopColor="#f4a940" stopOpacity="0.4" />
            <stop offset="100%" stopColor="#f4a940" stopOpacity="0" />
          </radialGradient>
          <radialGradient id="beam-grad-2" cx="20%" cy="80%" r="60%">
            <stop offset="0%" stopColor="#c4956a" stopOpacity="0.3" />
            <stop offset="100%" stopColor="#c4956a" stopOpacity="0" />
          </radialGradient>
          <radialGradient id="beam-grad-3" cx="80%" cy="60%" r="50%">
            <stop offset="0%" stopColor="#2d6a4f" stopOpacity="0.2" />
            <stop offset="100%" stopColor="#2d6a4f" stopOpacity="0" />
          </radialGradient>

          <filter id="blur-filter">
            <feGaussianBlur stdDeviation="30" />
          </filter>
        </defs>

        {/* Ambient glow blobs */}
        <ellipse cx="400" cy="0" rx="400" ry="300" fill="url(#beam-grad-1)" filter="url(#blur-filter)">
          <animate attributeName="cy" values="0;40;0" dur="8s" repeatCount="indefinite" />
        </ellipse>
        <ellipse cx="100" cy="700" rx="300" ry="250" fill="url(#beam-grad-2)" filter="url(#blur-filter)">
          <animate attributeName="cx" values="100;160;100" dur="10s" repeatCount="indefinite" />
        </ellipse>
        <ellipse cx="700" cy="500" rx="250" ry="200" fill="url(#beam-grad-3)" filter="url(#blur-filter)">
          <animate attributeName="cy" values="500;460;500" dur="12s" repeatCount="indefinite" />
        </ellipse>

        {/* Thin beam lines */}
        {[...Array(6)].map((_, i) => (
          <line
            key={i}
            x1={i * 160 + 80}
            y1="0"
            x2={i * 160 - 40}
            y2="800"
            stroke="#f4a940"
            strokeWidth="0.5"
            strokeOpacity="0.15"
          >
            <animate
              attributeName="stroke-opacity"
              values={`0.05;0.2;0.05`}
              dur={`${5 + i * 1.5}s`}
              repeatCount="indefinite"
              begin={`${i * 0.8}s`}
            />
          </line>
        ))}
      </svg>
    </div>
  )
}
