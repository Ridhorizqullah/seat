'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useState, useEffect } from 'react'
import { logout } from '@/lib/auth-client'

export default function UserNavbar() {
  const pathname = usePathname()
  const [user, setUser] = useState<{ email: string; role: string } | null>(null)

  useEffect(() => {
    // Check if user is logged in via API
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
    <header className={`bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 shadow-[0px_10px_30px_rgba(0,0,0,0.04)] sticky top-0 z-50 transition-all duration-300`}>
      <div className="flex justify-between items-center w-full max-w-[1200px] mx-auto px-8 h-20 font-['Inter'] antialiased text-slate-600 dark:text-slate-300">
        <div className="flex items-center gap-8">
          <Link href="/" className="text-2xl font-bold tracking-tight text-teal-500 dark:text-teal-400">
            EventEase
          </Link>
          <div className="relative hidden lg:block">
            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">search</span>
            <input 
              className="pl-10 pr-4 py-2 bg-white border border-slate-200 rounded-xl focus:border-teal-500 focus:ring-1 focus:ring-teal-500 outline-none w-64 transition-all text-[14px]" 
              placeholder="Search events..." 
              type="text"
            />
          </div>
        </div>

        <nav className="hidden md:flex items-center gap-8">
          {navLinks.map((link) => (
            <Link 
              key={link.name} 
              href={link.href}
              className={`${
                pathname === link.href 
                ? 'text-teal-500 dark:text-teal-400 font-semibold border-b-2 border-teal-500 pb-1' 
                : 'text-slate-500 dark:text-slate-400 hover:text-teal-500 dark:hover:text-teal-300 transition-colors'
              }`}
            >
              {link.name}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-4">
          <button className="p-2 hover:bg-slate-50 dark:hover:bg-slate-800/50 rounded-lg transition-all active:opacity-80 active:scale-[0.98]">
            <span className="material-symbols-outlined">notifications</span>
          </button>
          {user ? (
            <>
              {user.role !== 'CUSTOMER' && (
                <Link href="/admin/dashboard" className="flex items-center gap-2 px-4 py-2 bg-indigo-50 text-indigo-600 border border-indigo-100 rounded-xl text-[14px] hover:bg-indigo-100 transition-all">
                  <span>Admin</span>
                </Link>
              )}
              <Link href="/profile" className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-[14px] text-on-surface-variant hover:bg-slate-50 transition-all">
                <span>Profile</span>
              </Link>
              <button onClick={() => logout()} className="flex items-center gap-2 px-4 py-2 bg-red-50 text-red-600 border border-red-100 rounded-xl text-[14px] hover:bg-red-100 transition-all cursor-pointer">
                <span>Logout</span>
              </button>
            </>
          ) : (
            <Link href="/login" className="flex items-center gap-2 px-6 py-2 bg-teal-600 text-white rounded-xl text-[14px] font-bold hover:bg-teal-700 transition-all">
              <span>Sign In</span>
            </Link>
          )}
        </div>
      </div>
    </header>
  )
}
