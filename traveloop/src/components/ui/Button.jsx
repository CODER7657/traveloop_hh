import { cn } from '../../lib/utils'

export const Button = ({ children, variant = 'primary', className, ...props }) => {
  return (
    <button
      className={cn(
        variant === 'primary' ? 'btn-primary' : 'btn-ghost',
        'w-full flex justify-center items-center',
        className
      )}
      {...props}
    >
      {children}
    </button>
  )
}
