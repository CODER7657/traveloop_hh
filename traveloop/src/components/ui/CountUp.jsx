import { useEffect, useRef } from 'react'
import { animate } from 'framer-motion'

/**
 * CountUp — animates a number from `from` to `to` using Framer Motion.
 * Used on the Dashboard stat cards.
 *
 * Usage: <CountUp to={12} />
 */
export function CountUp({ from = 0, to, duration = 1.5, prefix = '', suffix = '' }) {
  const ref = useRef(null)

  useEffect(() => {
    const controls = animate(from, to, {
      duration,
      ease: 'easeOut',
      onUpdate: (v) => {
        if (ref.current) {
          ref.current.textContent = prefix + Math.round(v).toLocaleString() + suffix
        }
      },
    })
    return controls.stop
  }, [from, to, duration, prefix, suffix])

  return <span ref={ref}>{prefix}{from}{suffix}</span>
}
