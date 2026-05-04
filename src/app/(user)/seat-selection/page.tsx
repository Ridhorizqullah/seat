'use client'

import { useState, useEffect, Suspense } from 'react'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'

function SeatSelectionContent() {
  const searchParams = useSearchParams()
  const performanceId = searchParams.get('performanceId')
  const showId = searchParams.get('showId')

  const [seats, setSeats] = useState<any[]>([])
  const [show, setShow] = useState<any>(null)
  const [selectedSeats, setSelectedSeats] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!performanceId || !showId) {
      setError('Missing session details. Please select an event again.')
      setLoading(false)
      return
    }

    async function fetchData() {
      try {
        setLoading(true)
        setError(null)
        const [showRes, seatsRes] = await Promise.all([
          fetch(`/api/shows/${showId}`),
          fetch(`/api/performances/${performanceId}/seats`)
        ])

        const showData = await showRes.json()
        const seatsData = await seatsRes.json()

        if (showData.success) setShow(showData.data)
        else throw new Error(showData.message || 'Failed to load event')
        
        if (seatsData.success) setSeats(seatsData.data)
        else throw new Error(seatsData.message || 'Failed to load seats')
      } catch (err: any) {
        console.error('Error fetching seat data:', err)
        setError(err.message || 'Connection lost. Please try again.')
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [performanceId, showId])

  const toggleSeat = (seat: any) => {
    if (seat.status === 'booked') return

    const isSelected = selectedSeats.find(s => s.seatId === seat.seatId)
    if (isSelected) {
      setSelectedSeats(selectedSeats.filter(s => s.seatId !== seat.seatId))
    } else {
      setSelectedSeats([...selectedSeats, seat])
    }
  }

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen gap-4 bg-slate-50">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-teal-500/20 border-t-teal-600"></div>
        <p className="text-slate-500 font-medium">Scanning available seats...</p>
      </div>
    )
  }

  if (error || !show || !performanceId) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen gap-6 text-center px-6 bg-slate-50">
        <div className="w-20 h-20 bg-white border border-slate-100 rounded-full flex items-center justify-center shadow-sm">
          <span className="material-symbols-outlined text-4xl text-slate-300">event_seat</span>
        </div>
        <div>
          <h2 className="text-2xl font-bold text-slate-900 mb-2">Selection Unavailable</h2>
          <p className="text-slate-500">{error || 'Unable to load seating chart at this time.'}</p>
        </div>
        <Link 
          href="/events"
          className="px-8 py-3 bg-slate-900 text-white rounded-xl font-bold hover:bg-slate-800 transition-all shadow-lg"
        >
          Return to Events
        </Link>
      </div>
    )
  }

  // Group seats by row
  const rows: Record<string, any[]> = {}
  seats.forEach(seat => {
    if (!rows[seat.row]) rows[seat.row] = []
    rows[seat.row].push(seat)
  })

  const rowKeys = Object.keys(rows).sort()

  const totalPrice = selectedSeats.length * (show.adultPrice || 0)

  return (
    <main className="pt-10 pb-12 px-6 md:px-12 max-w-[1200px] mx-auto min-h-screen">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
        {/* Seat Selection Area */}
        <div className="lg:col-span-8 flex flex-col gap-10">
          <div className="flex flex-col gap-3">
            <h1 className="text-3xl font-bold text-slate-900">{show.title}</h1>
            <div className="flex flex-wrap items-center gap-6 text-slate-500 text-sm font-bold uppercase tracking-wider">
              <span className="flex items-center gap-2">
                <span className="material-symbols-outlined text-[18px]">calendar_today</span>
                {new Date(show.performances?.find((p: any) => p.id === performanceId)?.dateTime).toLocaleDateString()}
              </span>
              <span className="flex items-center gap-2">
                <span className="material-symbols-outlined text-[18px]">location_on</span>
                {show.venue?.name}
              </span>
            </div>
          </div>

          {/* Screen Indicator */}
          <div className="w-full flex flex-col items-center gap-4 py-4">
            <div className="h-1 w-3/4 bg-slate-200 rounded-full"></div>
            <span className="text-[11px] text-slate-400 tracking-[0.3em] uppercase font-bold">Screen</span>
          </div>

          {/* Seat Map */}
          <div className="flex flex-col items-center gap-10 py-6 overflow-x-auto">
            <div className="flex flex-col gap-4 select-none min-w-max">
              {rowKeys.map(rowKey => (
                <div key={rowKey} className="flex items-center gap-6">
                  <span className="text-[12px] font-bold text-slate-400 w-4">{rowKey}</span>
                  <div className="flex gap-2">
                    {rows[rowKey].map(seat => {
                      const booked = seat.status === 'booked'
                      const selected = selectedSeats.find(s => s.seatId === seat.seatId)
                      return (
                        <button
                          key={seat.seatId}
                          disabled={booked}
                          onClick={() => toggleSeat(seat)}
                          className={`w-8 h-8 rounded-lg border transition-all text-[10px] flex items-center justify-center ${
                            booked ? 'bg-slate-100 border-slate-200 cursor-not-allowed text-slate-300' :
                            selected ? 'bg-orange-400 border-orange-500 shadow-[0_0_15px_rgba(251,146,60,0.4)] text-white font-bold' :
                            'bg-white border-teal-500 hover:bg-teal-50 text-slate-400'
                          }`}
                        >
                          {selected ? '✓' : seat.number}
                        </button>
                      )
                    })}
                  </div>
                </div>
              ))}
            </div>

            {/* Legend */}
            <div className="flex gap-10 text-xs font-bold text-slate-500 uppercase tracking-wider">
              <div className="flex items-center gap-2.5">
                <div className="w-4 h-4 rounded-sm border-2 border-teal-500 bg-white"></div>
                <span>Available</span>
              </div>
              <div className="flex items-center gap-2.5">
                <div className="w-4 h-4 rounded-sm border border-slate-200 bg-slate-100"></div>
                <span>Booked</span>
              </div>
              <div className="flex items-center gap-2.5">
                <div className="w-4 h-4 rounded-sm border border-orange-500 bg-orange-400"></div>
                <span>Selected</span>
              </div>
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <aside className="lg:col-span-4 lg:sticky lg:top-24">
          <div className="bg-white border border-slate-100 rounded-2xl p-8 flex flex-col gap-8 shadow-xl">
            <div className="border-b border-slate-100 pb-4">
              <h2 className="text-xs font-bold uppercase tracking-widest text-slate-900">Order Summary</h2>
            </div>
            
            <div className="space-y-4 max-h-[300px] overflow-y-auto pr-2">
              {selectedSeats.length > 0 ? (
                selectedSeats.map(seat => (
                  <div key={seat.seatId} className="flex justify-between items-center">
                    <span className="text-slate-600 text-sm font-medium">Seat {seat.row}{seat.number}</span>
                    <span className="font-bold text-slate-900">${show.adultPrice.toFixed(2)}</span>
                  </div>
                ))
              ) : (
                <p className="text-slate-400 text-sm italic">No seats selected</p>
              )}
            </div>

            <div className="border-t border-slate-100 pt-6">
              <div className="flex justify-between items-end">
                <div className="flex flex-col">
                  <span className="text-[11px] font-bold uppercase tracking-widest text-teal-600 mb-1">Total Amount</span>
                  <span className="text-3xl font-bold text-slate-900">
                    ${totalPrice.toFixed(2)}
                  </span>
                </div>
              </div>
            </div>

            <Link 
              href={selectedSeats.length > 0 ? `/checkout?performanceId=${performanceId}&showId=${showId}&seats=${selectedSeats.map(s => s.seatId).join(',')}` : "#"}
              className={`w-full py-4 rounded-xl font-bold text-sm uppercase tracking-widest text-center transition-all shadow-lg ${
                selectedSeats.length > 0 
                ? 'bg-teal-600 text-white hover:bg-teal-700 active:scale-[0.98]' 
                : 'bg-slate-100 text-slate-400 cursor-not-allowed'
              }`}
            >
              Confirm Selection
            </Link>
          </div>
        </aside>
      </div>
    </main>
  )
}

export default function SeatSelectionPage() {
  return (
    <Suspense fallback={<div>Loading selection...</div>}>
      <SeatSelectionContent />
    </Suspense>
  )
}
