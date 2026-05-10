import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { toast } from 'react-hot-toast'
import { supabase } from '../../lib/supabase'
import { Button } from '../../components/ui/Button'
import { Input } from '../../components/ui/Input'
import { Select } from '../../components/ui/Select'

const STYLES = [
  { value: 'Adventure', label: 'Adventure' },
  { value: 'Relaxation', label: 'Relaxation' },
  { value: 'Food', label: 'Food' },
  { value: 'Budget', label: 'Budget' },
  { value: 'Luxury', label: 'Luxury' }
]

const signupSchema = z.object({
  name: z.string().min(2, 'Name is required'),
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  confirmPassword: z.string(),
  travel_style: z.string().min(1, 'Please select a travel style')
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
})

export default function SignupPage() {
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false)

  const { register, handleSubmit, formState: { errors } } = useForm({
    resolver: zodResolver(signupSchema)
  })

  const onSubmit = async (data) => {
    try {
      setLoading(true)
      
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: data.email,
        password: data.password,
        options: {
          data: {
            name: data.name,
            travel_style: data.travel_style
          }
        }
      })

      if (authError) throw authError

      if (authData.user) {
        // the trigger handles row creation but we can also manually upsert
        const { error: profileError } = await supabase
          .from('profiles')
          .upsert({
            id: authData.user.id,
            name: data.name,
            email: data.email,
            travel_style: data.travel_style
          })

        if (profileError) throw profileError
      }

      toast.success('Account created successfully!')
      navigate('/')
    } catch (error) {
      toast.error(error.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div>
      <h2 className="text-2xl font-bold text-center mb-6">Create Account</h2>
      
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <Input
          label="Full Name"
          placeholder="John Doe"
          {...register('name')}
          error={errors.name?.message}
        />

        <Input
          label="Email"
          type="email"
          placeholder="you@example.com"
          {...register('email')}
          error={errors.email?.message}
        />
        
        <Select
          label="Default Travel Style"
          options={STYLES}
          {...register('travel_style')}
          error={errors.travel_style?.message}
        />

        <Input
          label="Password"
          type="password"
          placeholder="••••••••"
          {...register('password')}
          error={errors.password?.message}
        />

        <Input
          label="Confirm Password"
          type="password"
          placeholder="••••••••"
          {...register('confirmPassword')}
          error={errors.confirmPassword?.message}
        />

        <Button type="submit" disabled={loading} className="mt-4">
          {loading ? 'Creating...' : 'Sign Up'}
        </Button>
      </form>

      <div className="mt-6 text-center text-sm text-secondary">
        Already have an account?{' '}
        <Link to="/login" className="font-medium text-amber hover:text-amber-dark transition-colors">
          Login
        </Link>
      </div>
    </div>
  )
}
