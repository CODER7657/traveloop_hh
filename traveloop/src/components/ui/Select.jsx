import { forwardRef } from 'react'
import { cn } from '../../lib/utils'

export const Select = forwardRef(({ className, label, options = [], error, ...props }, ref) => {
  return (
    <div className="w-full">
      {label && <label className="block text-sm font-medium text-dusk mb-1.5">{label}</label>}
      <select
        ref={ref}
        className={cn('input appearance-none bg-white', error && 'border-danger focus:ring-danger/20', className)}
        {...props}
      >
        <option value="" disabled>Select an option</option>
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
      {error && <p className="mt-1 text-sm text-danger">{error}</p>}
    </div>
  )
})

Select.displayName = 'Select'
