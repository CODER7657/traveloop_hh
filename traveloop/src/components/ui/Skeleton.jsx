import { cn } from '../../lib/utils'

export const Skeleton = ({ className }) => {
  return <div className={cn('animate-pulse bg-sand rounded-2xl', className)} />
}
