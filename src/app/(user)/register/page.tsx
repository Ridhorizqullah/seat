'use client'

import Link from 'next/link'
import { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function SignUpPage() {
  const router = useRouter()
  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, firstName, lastName })
      })

      const data = await res.json()

      if (data.success) {
        router.push('/')
        router.refresh()
      } else {
        setError(data.error || 'Failed to register')
      }
    } catch (err: any) {
      setError(err.message || 'Something went wrong')
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="min-h-screen flex items-center justify-center py-16 px-6 bg-slate-50">
      <div className="w-full max-w-[400px] space-y-8">
        <div className="text-center">
          <Link href="/" className="text-3xl font-bold tracking-tight text-teal-500 mb-6 inline-block">
            EventEase
          </Link>
          <h2 className="text-2xl font-bold text-slate-900">Create Account</h2>
          <p className="text-slate-500 mt-2 font-medium">Join us for seamless event bookings.</p>
        </div>

        <form onSubmit={handleRegister} className="bg-white p-8 rounded-2xl border border-slate-100 shadow-xl space-y-6">
          {error && (
            <div className="p-3 bg-red-50 text-red-600 text-sm rounded-lg border border-red-100">
              {error}
            </div>
          )}
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-2 tracking-wider">First Name</label>
                <input 
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  required
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20 outline-none transition-all" 
                  placeholder="Alex" 
                  type="text"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-2 tracking-wider">Last Name</label>
                <input 
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  required
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20 outline-none transition-all" 
                  placeholder="Rivers" 
                  type="text"
                />
              </div>
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase mb-2 tracking-wider">Email Address</label>
              <input 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20 outline-none transition-all" 
                placeholder="alex@example.com" 
                type="email"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase mb-2 tracking-wider">Password</label>
              <input 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20 outline-none transition-all" 
                placeholder="••••••••" 
                type="password"
              />
            </div>
          </div>

          <button disabled={loading} type="submit" className="w-full bg-teal-600 text-white py-4 rounded-xl font-bold uppercase tracking-widest hover:bg-teal-700 transition-all shadow-lg active:scale-[0.98] disabled:opacity-50">
            {loading ? 'Processing...' : 'Get Started'}
          </button>
        </form>

        <p className="text-center text-sm font-bold text-slate-500 uppercase tracking-wider">
          Already have an account? <Link href="/login" className="text-teal-600 hover:underline">Sign In</Link>
        </p>
      </div>
    </main>
  )
}
