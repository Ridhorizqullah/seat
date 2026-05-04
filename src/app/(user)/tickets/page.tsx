'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { getUser } from '@/lib/auth-client'

export default function MyTicketsPage() {
  const [tickets, setTickets] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const user = getUser()
    if (!user) {
      setLoading(false)
      return
    }

    async function fetchTickets() {
      try {
        const res = await fetch(`/api/tickets?email=${user!.email}`)
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

    fetchTickets()
  }, [])

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-teal-500"></div>
      </div>
    )
  }

  return (
    <main className="max-w-[1200px] mx-auto px-8 py-10 w-full">
      <header className="mb-10">
        <h1 className="text-4xl font-bold text-slate-900 mb-2">My Tickets</h1>
        <p className="text-slate-500 text-lg">Manage your upcoming experiences and past memories.</p>
      </header>

      {/* Tickets Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {tickets.length === 0 ? (
          <div className="lg:col-span-12 py-20 text-center bg-white rounded-2xl border border-dashed border-slate-300">
            <span className="material-symbols-outlined text-slate-300 text-6xl mb-4">confirmation_number</span>
            <p className="text-slate-500 text-lg">You don&apos;t have any tickets yet.</p>
            <Link href="/events" className="text-teal-600 font-bold hover:underline mt-2 inline-block">Browse Events</Link>
          </div>
        ) : (
          <>
            {/* Featured Ticket (Most recent) */}
            <div className="lg:col-span-8 bg-white border border-slate-100 rounded-2xl overflow-hidden flex flex-col md:flex-row shadow-xl group">
              <div className="w-full md:w-2/5 h-64 md:h-auto relative overflow-hidden">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img 
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" 
                  src={tickets[0].shows?.imageUrl || 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?auto=format&fit=crop&q=80'} 
                  alt={tickets[0].shows?.title}
                />
                <div className="absolute top-4 left-4">
                  <span className="bg-teal-500 text-white px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1 shadow-md uppercase">
                    {tickets[0].status}
                  </span>
                </div>
              </div>
              <div className="p-8 flex-grow flex flex-col justify-between">
                <div>
                  <div className="flex justify-between items-start mb-4">
                    <h2 className="text-2xl font-bold text-slate-900">{tickets[0].shows?.title}</h2>
                    <div className="text-right">
                      <p className="text-teal-600 text-2xl font-bold leading-tight">
                        {new Date(tickets[0].performances?.dateTime).getDate()}
                      </p>
                      <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">
                        {new Date(tickets[0].performances?.dateTime).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}
                      </p>
                    </div>
                  </div>
                  <p className="text-slate-500 flex items-center gap-1.5 mb-6 text-sm font-medium">
                    <span className="material-symbols-outlined text-sm">location_on</span>
                    {tickets[0].shows?.venue?.name || 'Main Hall'}
                  </p>
                  <div className="grid grid-cols-2 gap-4 border-t border-slate-100 pt-6 mb-8">
                    <div>
                      <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mb-1">Seats</p>
                      <p className="font-bold text-slate-900">{tickets[0].booking_items?.length} Tickets</p>
                    </div>
                    <div>
                      <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mb-1">Total</p>
                      <p className="font-bold text-slate-900">${tickets[0].totalAmount}</p>
                    </div>
                  </div>
                </div>
                <div className="flex flex-wrap gap-3">
                  <button className="bg-teal-600 text-white px-6 py-2.5 rounded-xl font-bold text-xs uppercase tracking-widest flex items-center gap-2 hover:bg-teal-700 transition-all shadow-md">
                    <span className="material-symbols-outlined text-sm">download</span>
                    Download PDF
                  </button>
                </div>
              </div>
            </div>

            {/* Ticket Stats */}
            <div className="lg:col-span-4 flex flex-col gap-6">
              <div className="bg-white border border-slate-100 rounded-2xl p-8 flex-grow shadow-lg">
                <h3 className="text-lg font-bold text-slate-900 mb-6">Booking Info</h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 rounded-xl bg-teal-50 border border-teal-100">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-teal-500 text-white flex items-center justify-center">
                        <span className="material-symbols-outlined">confirmation_number</span>
                      </div>
                      <span className="text-sm font-bold text-slate-900">Total Bookings</span>
                    </div>
                    <span className="text-2xl font-bold text-teal-600">{tickets.length}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* All Tickets List */}
            <div className="lg:col-span-12 grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
              {tickets.map(ticket => (
                <div key={ticket.id} className="bg-white border border-slate-100 rounded-2xl overflow-hidden group shadow-md hover:shadow-lg transition-all">
                  <div className="h-40 relative">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img 
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" 
                      src={ticket.shows?.imageUrl || 'https://images.unsplash.com/photo-1514525253361-bee8a187499b?auto=format&fit=crop&q=80'} 
                      alt={ticket.shows?.title}
                    />
                    <div className="absolute top-4 left-4">
                      <span className={`px-3 py-1 rounded-full text-[10px] font-bold shadow-md uppercase tracking-widest ${
                        ticket.status === 'PAID' || ticket.status === 'CONFIRMED' ? 'bg-teal-500 text-white' : 'bg-slate-200 text-slate-600'
                      }`}>
                        {ticket.status}
                      </span>
                    </div>
                  </div>
                  <div className="p-6">
                    <div className="flex justify-between items-start mb-6">
                      <div>
                        <h3 className="text-lg font-bold text-slate-900 group-hover:text-teal-600 transition-colors">{ticket.shows?.title}</h3>
                        <p className="text-xs text-slate-500 font-bold uppercase tracking-wider mt-1">
                          {new Date(ticket.performances?.dateTime).toLocaleString()}
                        </p>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <button className="flex-1 py-2.5 bg-teal-600 text-white rounded-xl text-[10px] font-bold uppercase tracking-widest hover:bg-teal-700 transition-colors">View Details</button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </main>
  )
}
