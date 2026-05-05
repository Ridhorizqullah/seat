'use client'

import { useState, useEffect, use } from 'react'
import Link from 'next/link'

export default function EventDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const [event, setEvent] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedPerformanceId, setSelectedPerformanceId] = useState<string | null>(null)
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
  }, [])

  useEffect(() => {
    async function fetchEvent() {
      try {
        setLoading(true)
        setError(null)
        const response = await fetch(`/api/shows/${id}`)
        const data = await response.json()
        if (data.success) {
          setEvent(data.data)
          if (data.data.performances && data.data.performances.length > 0) {
            setSelectedPerformanceId(data.data.performances[0].id)
          }
        } else {
          setError(data.message || 'Event not found')
        }
      } catch (err) {
        console.error('Error fetching event:', err)
        setError('Could not connect to the server.')
      } finally {
        setLoading(false)
      }
    }

    fetchEvent()
  }, [id])

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen gap-4 bg-slate-50">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-teal-500/20 border-t-teal-600"></div>
        <p className="text-slate-500 font-medium">Fetching event details...</p>
      </div>
    )
  }

  if (error || !event) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen gap-6 text-center px-6 bg-slate-50">
        <div className="w-20 h-20 bg-white border border-slate-100 rounded-full flex items-center justify-center shadow-sm">
          <span className="material-symbols-outlined text-4xl text-slate-300">event_busy</span>
        </div>
        <div>
          <h2 className="text-2xl font-bold text-slate-900 mb-2">{error || 'Event Not Found'}</h2>
          <p className="text-slate-500">The event you are looking for might have been removed or is currently unavailable.</p>
        </div>
        <Link 
          href="/events"
          className="px-8 py-3 bg-teal-600 text-white rounded-xl font-bold hover:bg-teal-700 transition-all shadow-lg"
        >
          Back to Events
        </Link>
      </div>
    )
  }

  return (
    <div className="flex flex-col">
      {/* Hero Section */}
      <div className="relative h-[600px] w-full overflow-hidden">
        <div className="absolute inset-0 z-0">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img 
            alt={event.title} 
            className="w-full h-full object-cover opacity-90" 
            src={event.imageUrl || "https://images.unsplash.com/photo-1492684223066-81342ee5ff30?auto=format&fit=crop&q=80"} 
          />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/40 to-transparent"></div>
        </div>
        <div className="relative z-10 max-w-[1200px] mx-auto px-8 h-full flex flex-col justify-end pb-12">
          <div className="max-w-3xl">
            <div className="inline-flex items-center px-4 py-1 rounded-full bg-teal-500/10 border border-teal-500/20 text-teal-400 font-bold text-xs mb-4 uppercase tracking-widest">
              {event.genre || 'Live Event'}
            </div>
            <h1 className="text-5xl md:text-6xl font-bold text-white mb-4 leading-none uppercase">{event.title}</h1>
            <div className="flex flex-wrap items-center gap-8 text-slate-300">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-teal-500">calendar_today</span>
                <span className="text-lg uppercase">Available Dates: {event.performances?.length || 0}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-teal-500">location_on</span>
                <span className="text-lg uppercase">{event.venue?.name || 'Main Venue'}, {event.venue?.address?.split(',').pop() || ''}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Content Grid */}
      <div className="max-w-[1200px] mx-auto px-8 py-12 w-full">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Left Column: Details */}
          <div className="lg:col-span-8 space-y-8">
            <section className="bg-white border border-slate-100 p-8 rounded-2xl shadow-sm">
              <h2 className="text-2xl font-bold mb-4 text-teal-700">The Experience</h2>
              <p className="text-slate-600 text-lg mb-8 leading-relaxed">
                {event.description || 'No description available.'}
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-start gap-4 p-6 rounded-xl bg-slate-50 border border-slate-100">
                  <span className="material-symbols-outlined text-teal-600 p-2 bg-teal-50 rounded-lg">spatial_audio</span>
                  <div>
                    <h4 className="font-bold text-slate-900 mb-1">Duration</h4>
                    <p className="text-sm text-slate-500">{event.duration || 120} minutes of pure entertainment.</p>
                  </div>
                </div>
                <div className="flex items-start gap-4 p-6 rounded-xl bg-slate-50 border border-slate-100">
                  <span className="material-symbols-outlined text-teal-600 p-2 bg-teal-50 rounded-lg">shield</span>
                  <div>
                    <h4 className="font-bold text-slate-900 mb-1">Age Rating</h4>
                    <p className="text-sm text-slate-500">Rated {event.ageRating || 'PG'} for this event.</p>
                  </div>
                </div>
              </div>
            </section>

            <section className="bg-white border border-slate-100 p-8 rounded-2xl shadow-sm">
              <h2 className="text-2xl font-bold mb-4 text-teal-700">Location</h2>
              <div className="w-full h-64 rounded-xl mb-6 relative overflow-hidden bg-slate-100">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img 
                  alt="Location" 
                  className="w-full h-full object-cover grayscale opacity-50" 
                  src="https://images.unsplash.com/photo-1516738901171-8eb4fc13bd20?auto=format&fit=crop&q=80" 
                />
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-10 h-10 bg-teal-600 rounded-full flex items-center justify-center shadow-lg">
                    <span className="material-symbols-outlined text-white text-xl">location_on</span>
                  </div>
                </div>
              </div>
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                  <p className="font-bold text-slate-900 text-lg">{event.venue?.name}</p>
                  <p className="text-slate-500">{event.venue?.address}</p>
                </div>
                <button className="text-teal-600 font-bold text-sm border border-teal-200 px-6 py-2 rounded-full hover:bg-teal-50 transition-all flex items-center gap-2">
                  <span className="material-symbols-outlined text-sm">directions</span> GET DIRECTIONS
                </button>
              </div>
            </section>
          </div>

          {/* Right Column: Booking Card */}
          <div className="lg:col-span-4">
            <div className="bg-white border border-slate-100 p-8 rounded-2xl sticky top-28 shadow-xl">
              <div className="mb-8">
                <p className="text-slate-500 text-xs font-bold uppercase mb-1">Tickets from</p>
                <h3 className="text-4xl font-bold text-slate-900">${event.adultPrice}</h3>
              </div>
              
              <div className="mb-8">
                <h4 className="text-xs font-bold text-slate-500 uppercase mb-4 tracking-wider">Select Time Slot</h4>
                <div className="flex flex-col gap-3">
                  {event.performances?.map((perf: any) => {
                    const dateObj = new Date(perf.dateTime)
                    const dateStr = dateObj.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })
                    const timeStr = dateObj.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })
                    const isSelected = selectedPerformanceId === perf.id

                    return (
                      <button 
                        key={perf.id}
                        onClick={() => setSelectedPerformanceId(perf.id)}
                        className={`px-4 py-3 rounded-xl border text-left transition-all ${
                          isSelected 
                          ? 'border-teal-500 bg-teal-50 text-teal-700 font-bold' 
                          : 'border-slate-200 text-slate-600 font-medium hover:border-teal-500 hover:text-teal-600'
                        }`}
                      >
                        <div className="text-sm">{dateStr}</div>
                        <div className="text-xs opacity-70">{timeStr}</div>
                      </button>
                    )
                  })}
                  {(!event.performances || event.performances.length === 0) && (
                    <div className="text-slate-400 text-sm italic">No slots available.</div>
                  )}
                </div>
              </div>

              <div className="mb-8 space-y-4">
                <div className="flex justify-between text-sm">
                  <span className="text-slate-500">Adult Ticket</span>
                  <span className="text-slate-900 font-semibold">${event.adultPrice}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-slate-500">Booking Fee</span>
                  <span className="text-slate-900 font-semibold">$2.50</span>
                </div>
                <hr className="border-slate-100" />
                <div className="flex justify-between font-bold text-teal-700 text-lg">
                  <span>Total</span>
                  <span>${(event.adultPrice + 2.50).toFixed(2)}</span>
                </div>
              </div>

              {user ? (
                <Link 
                  href={selectedPerformanceId ? `/seat-selection?performanceId=${selectedPerformanceId}&showId=${event.id}` : "#"}
                  className={`w-full bg-teal-600 text-white py-4 rounded-xl font-bold uppercase tracking-tight flex items-center justify-center gap-3 hover:bg-teal-700 transition-all ${!selectedPerformanceId ? 'opacity-50 cursor-not-allowed' : ''}`}
                >
                  <span className="material-symbols-outlined">event_seat</span>
                  Select Seats
                </Link>
              ) : (
                <Link 
                  href={`/login?callbackUrl=/events/${event.id}&message=Please login to continue booking`}
                  className="w-full bg-slate-100 text-slate-900 py-4 rounded-xl font-bold uppercase tracking-tight flex items-center justify-center gap-3 hover:bg-slate-200 transition-all"
                >
                  Login to Book
                </Link>
              )}
              
              <p className="text-center text-[10px] text-slate-400 mt-4 uppercase font-bold tracking-wider">
                * Tickets are non-refundable 24h before event start.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Lineup Section (Placeholder/Static as in design) */}
      <div className="max-w-[1200px] mx-auto px-8 py-16 w-full">
        <h2 className="text-3xl font-bold mb-10 text-teal-800 text-center">Featured Artists</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {[
            { name: 'SYNTH_SOUL', img: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?auto=format&fit=crop&q=80&w=300&h=300' },
            { name: 'DATA_DRIFT', img: 'https://images.unsplash.com/photo-1514525253361-bee8a187499b?auto=format&fit=crop&q=80&w=300&h=300' },
            { name: 'VOID_ECHO', img: 'https://images.unsplash.com/photo-1493225255756-d9584f8606e9?auto=format&fit=crop&q=80&w=300&h=300' },
            { name: 'CORE_LOGIC', img: 'https://images.unsplash.com/photo-1459749411177-042180ce673c?auto=format&fit=crop&q=80&w=300&h=300' },
          ].map((artist, i) => (
            <div key={i} className="relative rounded-2xl overflow-hidden aspect-square border border-slate-100 group shadow-sm">
               {/* eslint-disable-next-line @next/next/no-img-element */}
              <img 
                src={artist.img} 
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" 
                alt={artist.name} 
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent flex items-end p-6">
                <p className="font-bold text-white text-lg">{artist.name}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
