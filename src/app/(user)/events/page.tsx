'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'

const categories = [
  { name: 'Electronic', icon: 'bolt', count: 24, active: true },
  { name: 'Digital Art', icon: 'brush', count: 12 },
  { name: 'Tech', icon: 'memory', count: 8 },
  { name: 'Festivals', icon: 'festival', count: 15 },
]

export default function EventListPage() {
  const [events, setEvents] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function fetchEvents() {
      try {
        setLoading(true)
        setError(null)
        const response = await fetch('/api/shows?published=true')
        const data = await response.json()
        if (data.success) {
          setEvents(data.data)
        } else {
          setError(data.message || 'Failed to load events')
        }
      } catch (err) {
        console.error('Error fetching events:', err)
        setError('Connection error. Please check your internet.')
      } finally {
        setLoading(false)
      }
    }

    fetchEvents()
  }, [])

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] gap-4">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-teal-500/20 border-t-teal-600"></div>
        <p className="text-slate-500 font-medium animate-pulse">Loading amazing experiences...</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] gap-6 text-center px-6">
        <div className="w-16 h-16 bg-red-50 text-red-500 rounded-full flex items-center justify-center">
          <span className="material-symbols-outlined text-3xl">error</span>
        </div>
        <div>
          <h2 className="text-xl font-bold text-slate-900 mb-2">Oops! Something went wrong</h2>
          <p className="text-slate-500">{error}</p>
        </div>
        <button 
          onClick={() => window.location.reload()}
          className="px-6 py-2 bg-slate-900 text-white rounded-full font-bold text-sm hover:bg-slate-800 transition-all"
        >
          Try Again
        </button>
      </div>
    )
  }

  return (
    <main className="max-w-[1200px] mx-auto px-8 py-10">
      <div className="flex flex-col md:flex-row gap-10">
        {/* Left Sidebar Filters */}
        <aside className="w-full md:w-64 flex-shrink-0">
          <div className="sticky top-28 space-y-8">
            <div>
              <h3 className="text-xl font-bold text-slate-900 mb-6">Categories</h3>
              <nav className="flex flex-col gap-2">
                {categories.map((cat) => (
                  <button 
                    key={cat.name}
                    className={`flex items-center justify-between px-4 py-3 rounded-xl text-sm font-medium transition-all ${
                      cat.active 
                      ? 'bg-teal-100 text-teal-800 shadow-sm' 
                      : 'text-slate-600 hover:bg-slate-100'
                    }`}
                  >
                    <span className="flex items-center gap-3">
                      <span className="material-symbols-outlined">{cat.icon}</span> 
                      {cat.name}
                    </span>
                    <span className={`${cat.active ? 'bg-white/40' : 'bg-slate-200'} px-2 py-0.5 rounded text-[10px] font-bold`}>
                      {cat.count}
                    </span>
                  </button>
                ))}
              </nav>
            </div>
            
            <div className="p-6 bg-slate-50 rounded-2xl border border-slate-100">
              <h4 className="text-sm font-bold text-teal-600 mb-4">Newsletter</h4>
              <p className="text-[13px] text-slate-500 leading-relaxed mb-4">Get the freshest drops and event invites delivered to your inbox.</p>
              <input 
                className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl text-sm focus:border-teal-500 focus:ring-0 outline-none transition-all mb-3" 
                placeholder="Your email" 
                type="email"
              />
              <button className="w-full py-3 bg-teal-600 text-white rounded-xl text-sm font-bold breezy-glow transition-all">
                Join Aura
              </button>
            </div>
          </div>
        </aside>

        {/* Main Content Grid */}
        <div className="flex-1">
          <div className="flex items-baseline justify-between mb-8 border-b border-slate-100 pb-4">
            <h1 className="text-2xl font-bold text-slate-900">What&apos;s On</h1>
            <span className="text-sm text-slate-500">Showing {events.length} events</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {events.length === 0 && (
              <div className="col-span-full py-20 text-center text-slate-500">
                No events found.
              </div>
            )}

            {events.map((event, index) => {
              const isFeatured = index === 0 && events.length > 0
              const performanceDate = event.performances?.[0]?.dateTime 
                ? new Date(event.performances[0].dateTime).toLocaleDateString('en-US', {
                    month: 'short',
                    day: 'numeric',
                    year: 'numeric',
                    hour: 'numeric',
                    minute: '2-digit'
                  })
                : 'Date TBA'

              if (isFeatured) {
                return (
                  <div key={event.id} className="md:col-span-2 group relative bg-white border border-slate-100 rounded-2xl overflow-hidden hover:shadow-xl transition-all flex flex-col lg:flex-row">
                    <div className="lg:w-3/5 h-[300px] lg:h-auto overflow-hidden relative">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img 
                        src={event.imageUrl || 'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?auto=format&fit=crop&q=80'} 
                        alt={event.title}
                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                      />
                      <div className="absolute top-4 left-4 bg-teal-600 text-white px-3 py-1 rounded-full text-xs font-semibold shadow-lg">Featured</div>
                    </div>
                    <div className="p-8 lg:w-2/5 flex flex-col justify-center">
                      <div className="flex items-center gap-2 text-teal-600 font-medium text-sm mb-3">
                        <span className="material-symbols-outlined text-[18px]">calendar_today</span>
                        {performanceDate}
                      </div>
                      <h2 className="text-2xl font-bold text-slate-900 mb-4 group-hover:text-teal-600 transition-colors">{event.title}</h2>
                      <p className="text-slate-500 text-sm mb-6 line-clamp-2">{event.description}</p>
                      <div className="flex items-center justify-between mt-auto">
                        <span className="text-2xl font-bold text-slate-800">${event.adultPrice}</span>
                        <Link 
                          href={`/events/${event.id}`}
                          className="px-6 py-3 bg-teal-600 text-white rounded-xl text-sm font-bold breezy-glow transition-all active:scale-[0.98]"
                        >
                          Book Tickets
                        </Link>
                      </div>
                    </div>
                  </div>
                )
              }

              return (
                <div key={event.id} className="group bg-white border border-slate-100 rounded-2xl overflow-hidden hover:shadow-lg transition-all flex flex-col">
                  <div className="h-56 overflow-hidden relative bg-slate-50 flex items-center justify-center">
                     {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img 
                      src={event.imageUrl || 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?auto=format&fit=crop&q=80'} 
                      alt={event.title}
                      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                    />
                    <div className="absolute top-4 right-4">
                      <span className="bg-white/90 backdrop-blur px-2 py-1 rounded-lg text-[10px] font-bold text-slate-800 uppercase tracking-wider">{event.genre}</span>
                    </div>
                  </div>
                  <div className="p-6 flex flex-col flex-1">
                    <div className="text-teal-600 font-medium text-xs mb-2">{performanceDate}</div>
                    <h3 className="text-lg font-bold text-slate-900 mb-3 group-hover:text-teal-600 transition-colors">{event.title}</h3>
                    <div className="flex items-center gap-4 text-slate-500 text-sm mb-6">
                      <span className="flex items-center gap-1"><span className="material-symbols-outlined text-sm">location_on</span> {event.venue?.name || 'Main Hall'}</span>
                    </div>
                    <div className="mt-auto">
                      <Link 
                        href={`/events/${event.id}`}
                        className="w-full py-3 bg-teal-600 text-white rounded-xl text-sm font-bold breezy-glow transition-all block text-center"
                      >
                        Book from ${event.adultPrice}
                      </Link>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>

          {/* Pagination */}
          <div className="mt-16 flex items-center justify-center gap-2">
            <button className="p-2 border border-slate-200 rounded-xl text-slate-400 hover:bg-white transition-all">
              <span className="material-symbols-outlined">chevron_left</span>
            </button>
            <button className="w-10 h-10 bg-teal-600 text-white rounded-xl text-sm font-bold">1</button>
            <button className="p-2 border border-slate-200 rounded-xl text-slate-400 hover:bg-white transition-all">
              <span className="material-symbols-outlined">chevron_right</span>
            </button>
          </div>
        </div>
      </div>
    </main>
  )
}
