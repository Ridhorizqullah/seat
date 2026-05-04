'use client'

import Link from 'next/link'
import { useState } from 'react'

export default function SignInPage() {

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      })

      const data = await res.json()
      console.log('LOGIN RESPONSE:', data)

      if (data.status === 'success') {
        const role = data.role?.toUpperCase()
        if (role === 'ADMIN' || role === 'STAFF') {
          window.location.href = '/admin'
        } else {
          window.location.href = '/'
        }
      } else {
        setError(data.message || 'Email or password is incorrect')
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
          <h2 className="text-2xl font-bold text-slate-900">Welcome Back</h2>
          <p className="text-slate-500 mt-2 font-medium">Please enter your details to sign in.</p>
        </div>

        <form onSubmit={handleLogin} className="bg-white p-8 rounded-2xl border border-slate-100 shadow-xl space-y-6">
          {error && (
            <div className="p-3 bg-red-50 text-red-600 text-sm rounded-lg border border-red-100">
              {error}
            </div>
          )}
          <div className="space-y-4">
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
              <div className="flex justify-between items-center mb-2">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Password</label>
              </div>
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
            {loading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>

        <p className="text-center text-sm font-bold text-slate-500 uppercase tracking-wider">
          Don&apos;t have an account? <Link href="/register" className="text-teal-600 hover:underline">Sign Up</Link>
        </p>
      </div>
    </main>
  )
}
