'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useState, useEffect } from 'react'
import { logout } from '@/lib/auth-client'
import { Bell, LogOut, User, LayoutDashboard, ArrowRight } from 'lucide-react'

export default function UserNavbar() {
  const pathname = usePathname()
  const [user, setUser] = useState<{ email: string; role: string } | null>(null)

  useEffect(() => {
    const checkUser = async () => {
      try {
        const res = await fetch('/api/auth/me')
        const data = await res.json()
        if (data.success) {
          setUser(data.data)
        } else {
          setUser(null)
        }
      } catch {
        setUser(null)
      }
    }
    checkUser()
  }, [pathname])

  const navLinks = [
    { name: 'Home', href: '/' },
    { name: 'Events', href: '/events' },
    { name: 'My Tickets', href: '/tickets' },
  ]

  return (
    <header className="backdrop-blur-md bg-[#020617]/80 sticky top-0 z-50 border-b border-slate-800/80 transition-all duration-300">
      <div className="flex justify-between items-center w-full max-w-[1200px] mx-auto px-8 h-20 font-sans antialiased text-slate-300">
        <div className="flex items-center gap-8">
          <Link href="/" className="text-2xl font-black tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-teal-400 via-cyan-400 to-indigo-400 hover:opacity-90 transition-opacity">
            EventEase
          </Link>
        </div>

        <nav className="hidden md:flex items-center gap-8">
          {navLinks.map((link) => (
            <Link 
              key={link.name} 
              href={link.href}
              className={`transition-colors text-[15px] ${
                pathname === link.href 
                ? 'text-teal-400 font-semibold border-b-2 border-teal-400 pb-1' 
                : 'text-slate-400 hover:text-teal-300'
              }`}
            >
              {link.name}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-4">
          <button className="p-2.5 text-slate-400 hover:text-teal-400 hover:bg-slate-900/50 rounded-lg transition-all active:opacity-80 active:scale-[0.98]">
            <Bell className="w-5 h-5" />
          </button>
          {user ? (
            <>
              {user.role !== 'CUSTOMER' && (
                <Link href="/admin/shows" className="flex items-center gap-2 px-4 py-2 bg-indigo-950/40 text-indigo-400 border border-indigo-900/50 rounded-xl text-[14px] hover:bg-indigo-900/40 transition-all">
                  <LayoutDashboard className="w-4 h-4" />
                  <span className="font-semibold">Admin</span>
                </Link>
              )}
              <Link href="/profile" className="flex items-center gap-2 px-4 py-2 bg-slate-900/50 border border-slate-800 rounded-xl text-[14px] text-slate-300 hover:bg-slate-800/80 transition-all">
                <User className="w-4 h-4 text-slate-400" />
                <span>Profile</span>
              </Link>
              <button onClick={() => logout()} className="flex items-center gap-2 px-4 py-2 bg-red-950/40 text-red-400 border border-red-900/50 rounded-xl text-[14px] hover:bg-red-900/40 transition-all cursor-pointer">
                <LogOut className="w-4 h-4" />
                <span>Logout</span>
              </button>
            </>
          ) : (
            <Link href="/login" className="flex items-center gap-2 px-6 py-2.5 bg-gradient-to-r from-teal-500 to-cyan-500 text-slate-950 rounded-xl text-[14px] font-bold hover:shadow-[0_0_20px_rgba(45,212,191,0.4)] hover:-translate-y-0.5 transition-all">
              <span>Sign In</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          )}
        </div>
      </div>
    </header>
  )
}
