import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { toast } from 'react-hot-toast'
import { supabase } from '../../lib/supabase'

const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
})

export default function LoginPage() {
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false)

  const { register, handleSubmit, formState: { errors } } = useForm({
    resolver: zodResolver(loginSchema)
  })

  const onSubmit = async (data) => {
    try {
      setLoading(true)
      const { error } = await supabase.auth.signInWithPassword({
        email: data.email,
        password: data.password,
      })

      if (error) throw error
      toast.success('Welcome back!')
      navigate('/')
    } catch (error) {
      toast.error(error.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div>
      <h2 className="font-display text-2xl font-bold text-white text-center mb-6 tracking-tight">
        Welcome Back
      </h2>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div className="space-y-1">
          <label className="font-body text-xs text-white/70 uppercase tracking-widest">Email</label>
          <input
            type="email"
            placeholder="you@example.com"
            className="w-full bg-white/10 border border-white/30 text-white placeholder:text-white/50 rounded-xl px-4 py-3 font-body text-sm focus:outline-none focus:border-amber focus:ring-2 focus:ring-amber/30 transition-all duration-200"
            {...register('email')}
          />
          {errors.email && <p className="font-body text-xs text-amber-dark mt-1">{errors.email.message}</p>}
        </div>

        <div className="space-y-1">
          <label className="font-body text-xs text-white/70 uppercase tracking-widest">Password</label>
          <input
            type="password"
            placeholder="••••••••"
            className="w-full bg-white/10 border border-white/30 text-white placeholder:text-white/50 rounded-xl px-4 py-3 font-body text-sm focus:outline-none focus:border-amber focus:ring-2 focus:ring-amber/30 transition-all duration-200"
            {...register('password')}
          />
          {errors.password && <p className="font-body text-xs text-amber-dark mt-1">{errors.password.message}</p>}
        </div>

        <div className="flex justify-end">
          <button type="button" className="font-body text-sm text-white/60 hover:text-white transition-colors">
            Forgot password?
          </button>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-amber hover:bg-amber-dark text-dusk font-body font-medium text-sm tracking-wide px-6 py-3 rounded-xl transition-all duration-200 active:scale-95 shadow-sm disabled:opacity-60 disabled:cursor-not-allowed mt-2"
        >
          {loading ? 'Signing in…' : 'Login'}
        </button>
      </form>

      <div className="mt-6 text-center font-body text-sm text-white/60">
        Don't have an account?{' '}
        <Link to="/signup" className="font-medium text-amber hover:text-amber-dark transition-colors">
          Sign Up
        </Link>
      </div>
    </div>
  )
}
