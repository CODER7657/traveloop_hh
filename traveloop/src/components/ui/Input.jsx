import { forwardRef } from 'react'
import { cn } from '../../lib/utils'

export const Input = forwardRef(({ className, label, error, ...props }, ref) => {
  return (
    <div className="w-full">
      {label && <label className="block text-sm font-medium text-dusk mb-1.5">{label}</label>}
      <input
        ref={ref}
        className={cn('input', error && 'border-danger focus:ring-danger/20', className)}
        {...props}
      />
      {error && <p className="mt-1 text-sm text-danger">{error}</p>}
    </div>
  )
})

Input.displayName = 'Input'
