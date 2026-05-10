import { useEffect, useState } from 'react'
import { cn } from '../../lib/utils'

/**
 * TextGenerate — types out text character by character.
 * Used on the Dashboard welcome heading.
 * Inspired by Aceternity UI Text Generate Effect.
 *
 * Usage: <TextGenerate text="Good morning, Pavan ☀️" className="font-display text-5xl" />
 */
export function TextGenerate({ text = '', className, speed = 40 }) {
  const [displayed, setDisplayed] = useState('')

  useEffect(() => {
    setDisplayed('')
    let i = 0
    const interval = setInterval(() => {
      setDisplayed(text.slice(0, i + 1))
      i++
      if (i >= text.length) clearInterval(interval)
    }, speed)
    return () => clearInterval(interval)
  }, [text, speed])

  return (
    <span className={cn(className)}>
      {displayed}
      {displayed.length < text.length && (
        <span className="inline-block w-0.5 h-[1em] bg-amber align-middle ml-0.5 animate-pulse" />
      )}
    </span>
  )
}
