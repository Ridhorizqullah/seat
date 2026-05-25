'use client'

import { useState, useEffect, useMemo, useCallback } from 'react'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import { useUsabilityTracking } from '@/lib/usability-analytics'
import { 
  Search, 
  Filter, 
  MapPin, 
  ChevronRight, 
  Star, 
  Clock
} from 'lucide-react'
import { cn } from '@/lib/utils'

export default function EventListPage() {
  const [events, setEvents] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  
  // Filter States
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedGenre, setSelectedGenre] = useState('All')

  // ── Usability & A/B Analytics Tracking ────────────────────────────────────
  const {
    trackSearchVisible,
    trackSearchFocus,
    trackSearchInputStarted,
    trackSearchCompleted,
    trackCategoryFilterVisible,
    trackCategorySelected,
    trackCategoryEventClicked,
    trackEvent
  } = useUsabilityTracking()

  // Track filter step count for UC3 Browsing Efficiency metric
  const [filterStepCount, setFilterStepCount] = useState(0)

  // Track search first interaction time & filter selection start
  const [filterStartTime, setFilterStartTime] = useState<number | null>(null)

  useEffect(() => {
    // Track search bar and category filter visibility on page mount
    trackSearchVisible()
    trackCategoryFilterVisible()

    async function fetchEvents() {
      try {
        setLoading(true)
        const response = await fetch('/api/shows?published=true')
        const data = await response.json()
        if (data.success) {
          setEvents(data.data)
        }
      } catch (err) {
        console.error('Error fetching events:', err)
      } finally {
        setLoading(false)
      }
    }

    fetchEvents()
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const genres = useMemo(() => {
    const uniqueGenres = Array.from(new Set(events.map(e => e.genre).filter(Boolean)))
    return ['All', ...uniqueGenres]
  }, [events])

  const filteredEvents = useMemo(() => {
    return events.filter(event => {
      const matchesSearch = event.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                           (event.description?.toLowerCase().includes(searchQuery.toLowerCase()))
      const matchesGenre = selectedGenre === 'All' || event.genre === selectedGenre
      return matchesSearch && matchesGenre
    })
  }, [events, searchQuery, selectedGenre])

  // Stable handlers for filter interactions
  const handleSearchChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const val = e.target.value
      setSearchQuery(val)
      if (val === '') {
        trackEvent('search_cleared')
      } else {
        if (val.length === 1) {
          trackSearchInputStarted(val)
        }
        trackSearchCompleted(val, filteredEvents.length)
      }
    },
    [trackEvent, trackSearchInputStarted, trackSearchCompleted, filteredEvents.length],
  )

  const handleCategoryClick = useCallback(
    (genre: string) => {
      setSelectedGenre(genre)
      setFilterStepCount(prev => prev + 1)
      if (genre === 'All') {
        trackEvent('category_filter_cleared')
      } else {
        const selectionTime = filterStartTime ? Date.now() - filterStartTime : 0
        // 'sidebar' is Variant A; change to 'horizontal' if you move filters
        trackCategorySelected(genre, selectionTime)
      }
    },
    [trackEvent, trackCategorySelected, filterStartTime],
  )

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen gap-6 bg-[#0F172A]">
        <div className="relative">
          <div className="w-16 h-16 border-4 border-teal-500/20 border-t-teal-500 rounded-full animate-spin"></div>
          <div className="absolute inset-0 flex items-center justify-center">
            <Star className="w-6 h-6 text-teal-500 animate-pulse" />
          </div>
        </div>
        <p className="text-teal-500/50 font-black tracking-[0.3em] uppercase text-[10px]">Initializing Experience...</p>
      </div>
    )
  }

  return (
    <main className="min-h-screen bg-[#0F172A] pb-32 overflow-hidden">
      {/* Premium Hero Section */}
      <div className="relative pt-32 pb-24 overflow-hidden">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[600px] bg-teal-500/10 blur-[120px] rounded-full -z-10"></div>
        <div className="max-w-[1200px] mx-auto px-8 text-center relative z-10">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center gap-3 px-4 py-2 rounded-full bg-white/5 border border-white/10 backdrop-blur-md mb-8"
          >
            <span className="w-2 h-2 rounded-full bg-teal-500 animate-pulse"></span>
            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-teal-400">Live Experiences Now Available</span>
          </motion.div>
          
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-6xl md:text-8xl font-black text-white mb-8 tracking-tighter leading-none"
          >
            DISCOVER THE <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-teal-400 to-blue-500">SPECTACLE.</span>
          </motion.h1>
          
          <motion.p 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="max-w-2xl mx-auto text-slate-400 text-lg md:text-xl font-medium leading-relaxed mb-12"
          >
            Access exclusive performances, theater, and live music across the country. 
            Secure your front-row seat to the extraordinary.
          </motion.p>
        </div>
      </div>

      <div className="max-w-[1200px] mx-auto px-8">
        <div className="flex flex-col lg:grid lg:grid-cols-12 gap-16">
          
          {/* Sidebar Navigation & Filters */}
          <aside className="lg:col-span-3 space-y-12">
            <div className="sticky top-32 space-y-10">
              
              {/* Search */}
              <div className="space-y-4">
                <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-500">Search Events</h3>
                <div className="relative group">
                  <input 
                    id="search-input"
                    type="text"
                    data-track-hover="search_input"
                    value={searchQuery}
                    onChange={handleSearchChange}
                    onFocus={trackSearchFocus}
                    placeholder="E.g. Hamlet, Jazz Festival..."
                    className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 text-sm font-bold text-white focus:bg-white/10 focus:ring-2 focus:ring-teal-500/20 outline-none transition-all placeholder:text-slate-600"
                  />
                  <Search className="absolute right-6 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-600 group-focus-within:text-teal-400 transition-colors" />
                </div>
              </div>

              {/* Categories */}
              <div className="space-y-6">
                <h3 id="category-filter-label" className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-500">Categories</h3>
                <div 
                  id="category-filter-group" 
                  data-track-hover="category_filters"
                  onMouseEnter={() => { if (!filterStartTime) setFilterStartTime(Date.now()); }}
                  className="flex flex-col gap-2"
                >
                  {genres.map((genre) => (
                    <button 
                      key={genre}
                      id={`category-btn-${genre.toLowerCase().replace(/\s+/g, '-')}`}
                      onClick={() => handleCategoryClick(genre)}
                      className={cn(
                        "flex items-center justify-between px-6 py-3 rounded-xl text-sm font-bold transition-all group",
                        selectedGenre === genre 
                        ? "bg-teal-500 text-slate-900 shadow-lg shadow-teal-500/20" 
                        : "text-slate-400 hover:text-white hover:bg-white/5"
                      )}
                    >
                      {genre}
                      {selectedGenre === genre && <ChevronRight className="w-4 h-4" />}
                    </button>
                  ))}
                </div>
              </div>

              {/* VIP Promotion */}
              <div className="p-8 rounded-[32px] bg-gradient-to-br from-teal-500 to-blue-600 relative overflow-hidden group shadow-2xl shadow-teal-500/10">
                <div className="absolute -right-4 -bottom-4 w-24 h-24 bg-white/20 blur-2xl rounded-full group-hover:scale-150 transition-transform duration-700"></div>
                <h4 className="text-xl font-black text-slate-900 mb-2 relative z-10">VIP ACCESS</h4>
                <p className="text-slate-900/70 text-xs font-bold leading-relaxed mb-6 relative z-10">
                  Join our member list for priority booking and early bird discounts.
                </p>
                <button className="w-full py-3 bg-slate-900 text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-black transition-all">
                  Join The Club
                </button>
              </div>
            </div>
          </aside>

          {/* Event Grid */}
          <div className="lg:col-span-9">
            <AnimatePresence mode='popLayout'>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                {filteredEvents.length === 0 ? (
                  <motion.div 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="col-span-full py-40 text-center space-y-6"
                  >
                    <div className="w-24 h-24 bg-white/5 border border-white/10 rounded-full flex items-center justify-center mx-auto">
                      <Filter className="w-10 h-10 text-slate-700" />
                    </div>
                    <div className="space-y-2">
                      <h3 className="text-2xl font-black text-white">No matches found</h3>
                      <p className="text-slate-500 font-medium">Try broadening your search or choosing a different category.</p>
                    </div>
                  </motion.div>
                ) : (
                  filteredEvents.map((event, index) => {
                    const perfDate = event.performances?.[0]?.dateTime 
                      ? new Date(event.performances[0].dateTime).toLocaleDateString('en-US', {
                          month: 'long',
                          day: 'numeric',
                          year: 'numeric'
                        })
                      : 'To Be Announced'

                    return (
                      <motion.div 
                        layout
                        key={event.id}
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: index * 0.1 }}
                        className="group relative"
                      >
                        <div className="absolute inset-0 bg-teal-500/20 blur-[40px] opacity-0 group-hover:opacity-100 transition-opacity duration-500 -z-10"></div>
                        <div className="bg-white/5 border border-white/10 rounded-[40px] overflow-hidden backdrop-blur-sm hover:border-white/20 transition-all duration-500 flex flex-col h-full">
                          
                          <div className="h-72 overflow-hidden relative">
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img 
                              src={event.imageUrl || 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?auto=format&fit=crop&q=80'} 
                              alt={event.title}
                              className="w-full h-full object-cover grayscale-[20%] group-hover:grayscale-0 transition-all duration-700 group-hover:scale-105"
                            />
                            <div className="absolute top-6 right-6">
                               <span className="bg-teal-500 text-slate-900 px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest shadow-xl">
                                  {event.genre || 'Live'}
                               </span>
                            </div>
                            <div className="absolute bottom-0 inset-x-0 h-32 bg-gradient-to-t from-[#0F172A] via-[#0F172A]/40 to-transparent"></div>
                          </div>

                          <div className="px-10 pb-10 flex-1 flex flex-col -mt-12 relative z-10">
                            <div className="flex items-center gap-3 text-teal-400 font-black text-[10px] uppercase tracking-[0.2em] mb-4 bg-teal-400/10 w-fit px-4 py-1 rounded-full border border-teal-400/20">
                              <Clock className="w-3.5 h-3.5" />
                              {perfDate}
                            </div>
                            
                            <h3 className="text-3xl font-black text-white mb-6 leading-tight group-hover:text-teal-400 transition-colors">
                              {event.title}
                            </h3>
                            
                            <div className="flex items-center gap-4 text-slate-400 text-xs font-bold mb-10">
                              <span className="flex items-center gap-2">
                                <MapPin className="w-4 h-4 text-teal-500" /> 
                                {event.venue?.name || 'Grand Arena'}
                              </span>
                            </div>

                            <div className="mt-auto flex items-center justify-between pt-8 border-t border-white/5">
                              <div>
                                 <p className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-600 mb-1">From</p>
                                 <p className="text-3xl font-black text-white">£{event.adultPrice}</p>
                              </div>
                              <Link 
                                href={`/events/${event.slug}`}
                                onClick={() => trackCategoryEventClicked(event.title, filterStepCount)}
                                className="px-8 py-4 bg-white text-slate-900 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-teal-500 hover:text-slate-900 transition-all shadow-xl active:scale-95"
                              >
                                View Details
                              </Link>
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    )
                  })
                )}
              </div>
            </AnimatePresence>

            {filteredEvents.length > 0 && (
              <div className="mt-24 text-center">
                <div className="h-px w-32 bg-white/5 mx-auto mb-8"></div>
                <p className="text-slate-600 text-[10px] font-black uppercase tracking-[0.4em]">Curated by EventSeats Team</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </main>
  )
}
