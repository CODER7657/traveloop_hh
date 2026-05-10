import { Outlet } from 'react-router-dom'
import { Plane } from 'lucide-react'

const VIDEO_URL =
  'https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260508_064209_0cb7d815-ff61-4caa-a6d5-bbff145ab272.mp4'

export const AuthLayout = () => {
  return (
    <div className="relative min-h-screen flex items-center justify-center">
      {/* Full-screen video background */}
      <video
        autoPlay
        muted
        loop
        playsInline
        className="absolute inset-0 w-full h-full object-cover"
        src={VIDEO_URL}
      />

      {/* Dark overlay — makes card readable */}
      <div className="absolute inset-0 bg-dusk/50 backdrop-blur-[2px]" />

      {/* Floating content */}
      <div className="relative z-10 w-full max-w-md px-4 flex flex-col items-center gap-6">
        {/* Logo */}
        <div className="text-center animate-fade-up">
          <div className="flex items-center justify-center gap-2 mb-1">
            <Plane className="w-7 h-7 text-amber" />
            <h1 className="font-display text-3xl font-bold text-white tracking-tight">
              Traveloop
            </h1>
          </div>
          <p className="font-body text-sm text-white/60 italic">
            Plan your next adventure
          </p>
        </div>

        {/* Frosted glass auth card */}
        <div
          className="w-full bg-white/10 backdrop-blur-xl border border-white/20 rounded-3xl p-8 shadow-2xl animate-fade-up"
          style={{ animationDelay: '0.1s' }}
        >
          <Outlet />
        </div>
      </div>
    </div>
  )
}
