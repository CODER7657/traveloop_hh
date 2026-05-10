import { Button } from '../ui/Button'

export const EmptyState = ({ icon, title, message, actionLabel, onAction }) => {
  return (
    <div className="card flex flex-col items-center justify-center py-12 text-center">
      <div className="mb-4 text-5xl text-dusk/50">{icon}</div>
      <h3 className="font-display text-2xl font-bold text-dusk">{title}</h3>
      <p className="mt-2 max-w-md text-sm text-dusk/60">{message}</p>
      {actionLabel && onAction ? (
        <Button className="mt-6 w-auto px-6" onClick={onAction}>
          {actionLabel}
        </Button>
      ) : null}
    </div>
  )
}
