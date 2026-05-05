'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Ticket as TicketIcon, 
  Calendar, 
  MapPin, 
  Download, 
  ChevronRight,
  Clock,
  ArrowUpRight
} from 'lucide-react'

export default function MyTicketsPage() {
  const [tickets, setTickets] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchTickets(email: string) {
      try {
        const res = await fetch(`/api/tickets?email=${email}`)
        const data = await res.json()
        if (data.success || data.status === 'success') {
          setTickets(data.data)
        }
      } catch (err) {
        console.error('Error fetching tickets:', err)
      } finally {
        setLoading(false)
      }
    }

    async function checkAuthAndFetch() {
      try {
        const res = await fetch('/api/auth/me')
        const data = await res.json()
        if (data.success && data.data) {
          fetchTickets(data.data.email)
        } else {
          setLoading(false)
        }
      } catch {
        setLoading(false)
      }
    }

    checkAuthAndFetch()
  }, [])

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-[#0F172A] gap-6">
        <div className="w-12 h-12 border-4 border-teal-500/20 border-t-teal-500 rounded-full animate-spin"></div>
        <p className="text-teal-500/50 font-black tracking-widest uppercase text-[10px]">Retrieving Digital Assets...</p>
      </div>
    )
  }

  return (
    <main className="min-h-screen bg-[#0F172A] pb-32">
      {/* Header */}
      <div className="relative pt-24 pb-16 overflow-hidden">
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-blue-600/10 blur-[120px] rounded-full -z-10"></div>
        <div className="max-w-[1200px] mx-auto px-8">
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="space-y-4"
          >
            <div className="flex items-center gap-3">
              <div className="p-2 bg-teal-500/10 border border-teal-500/20 rounded-lg">
                <TicketIcon className="w-5 h-5 text-teal-400" />
              </div>
              <span className="text-[10px] font-black uppercase tracking-[0.3em] text-teal-400">Vault</span>
            </div>
            <h1 className="text-5xl font-black text-white tracking-tight">MY <span className="text-transparent bg-clip-text bg-gradient-to-r from-teal-400 to-blue-500">TICKETS</span></h1>
            <p className="text-slate-500 font-medium max-w-md">Your gateway to upcoming experiences and past memories, secured in your digital vault.</p>
          </motion.div>
        </div>
      </div>

      <div className="max-w-[1200px] mx-auto px-8">
        <AnimatePresence mode="wait">
          {tickets.length === 0 ? (
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="py-32 text-center bg-white/5 border border-white/10 rounded-[40px] backdrop-blur-sm"
            >
              <div className="w-20 h-20 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-6">
                <TicketIcon className="w-10 h-10 text-slate-700" />
              </div>
              <h3 className="text-xl font-black text-white mb-2">No active tickets</h3>
              <p className="text-slate-500 font-medium mb-8">Ready for your next adventure? Explore our live events.</p>
              <Link href="/events" className="inline-flex items-center gap-3 px-8 py-4 bg-teal-500 text-slate-900 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-teal-400 transition-all">
                Browse Experiences
                <ChevronRight className="w-4 h-4" />
              </Link>
            </motion.div>
          ) : (
            <div className="grid grid-cols-1 gap-8">
              {tickets.map((ticket, index) => {
                const dateObj = new Date(ticket.performances?.dateTime)
                const dateStr = dateObj.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })
                const timeStr = dateObj.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })
                const isPaid = ticket.status === 'PAID' || ticket.status === 'CONFIRMED'

                return (
                  <motion.div 
                    key={ticket.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="group bg-white/5 border border-white/10 rounded-[40px] overflow-hidden flex flex-col lg:flex-row hover:border-white/20 transition-all duration-500"
                  >
                    {/* Event Image */}
                    <div className="w-full lg:w-[400px] h-64 lg:h-auto relative overflow-hidden">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img 
                        src={ticket.performances?.shows?.imageUrl || 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?auto=format&fit=crop&q=80'} 
                        alt={ticket.performances?.shows?.title}
                        className="w-full h-full object-cover grayscale-[30%] group-hover:grayscale-0 transition-all duration-700 group-hover:scale-105"
                      />
                      <div className="absolute top-6 left-6">
                        <span className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest shadow-xl ${
                          isPaid ? "bg-emerald-500 text-white" : "bg-slate-800 text-slate-400"
                        }`}>
                          {ticket.status === 'PAID' ? 'CONFIRMED' : ticket.status}
                        </span>
                      </div>
                      <div className="absolute inset-0 bg-gradient-to-r from-[#0F172A] via-transparent to-transparent hidden lg:block"></div>
                    </div>

                    {/* Ticket Content */}
                    <div className="flex-1 p-10 flex flex-col justify-between">
                      <div className="space-y-6">
                        <div className="flex justify-between items-start">
                          <div>
                            <h2 className="text-3xl font-black text-white mb-2 leading-tight uppercase group-hover:text-teal-400 transition-colors">
                              {ticket.performances?.shows?.title}
                            </h2>
                            <p className="text-teal-500/60 font-black text-[10px] uppercase tracking-[0.3em]">Booking ID: {ticket.bookingNumber}</p>
                          </div>
                          <div className="text-right">
                             <div className="text-4xl font-black text-white">{dateObj.getDate()}</div>
                             <div className="text-[10px] font-black text-slate-500 uppercase tracking-widest">{dateObj.toLocaleDateString('en-US', { month: 'short' })}</div>
                          </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 py-8 border-y border-white/5">
                          <div className="space-y-4">
                            <div className="flex items-center gap-3 text-slate-400">
                              <Calendar className="w-4 h-4 text-teal-500" />
                              <span className="text-xs font-bold">{dateStr}</span>
                            </div>
                            <div className="flex items-center gap-3 text-slate-400">
                              <Clock className="w-4 h-4 text-teal-500" />
                              <span className="text-xs font-bold">{timeStr}</span>
                            </div>
                          </div>
                          <div className="space-y-4">
                            <div className="flex items-center gap-3 text-slate-400">
                              <MapPin className="w-4 h-4 text-teal-500" />
                              <span className="text-xs font-bold">{ticket.performances?.shows?.venue?.name || 'Main Hall'}</span>
                            </div>
                            <div className="flex items-center gap-3 text-slate-400">
                              <TicketIcon className="w-4 h-4 text-teal-500" />
                              <span className="text-xs font-bold">{ticket.booking_items?.length || 0} Reserved Seats</span>
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="mt-10 flex flex-wrap items-center justify-between gap-6">
                        <div className="flex items-center gap-4">
                          <div className="p-3 bg-white rounded-2xl">
                             {/* eslint-disable-next-line @next/next/no-img-element */}
                             <img 
                               src={`https://api.qrserver.com/v1/create-qr-code/?size=100x100&data=${ticket.bookingNumber}`} 
                               alt="Ticket QR"
                               className="w-16 h-16"
                             />
                          </div>
                          <div className="space-y-1">
                             <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Entry Pass</p>
                             <p className="text-white font-bold text-xs">Scan at entrance</p>
                          </div>
                        </div>
                        
                        <div className="flex gap-4">
                          <button className="px-6 py-4 bg-white/5 border border-white/10 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-white hover:text-slate-900 transition-all flex items-center gap-2">
                             <Download className="w-4 h-4" />
                             Download PDF
                          </button>
                          <Link 
                            href={`/book/success/${ticket.id}`}
                            className="px-6 py-4 bg-teal-500 text-slate-900 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-teal-400 transition-all flex items-center gap-2"
                          >
                             View Details
                             <ArrowUpRight className="w-4 h-4" />
                          </Link>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                )
              })}
            </div>
          )}
        </AnimatePresence>
      </div>
    </main>
  )
}
