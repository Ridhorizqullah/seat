'use client'

import React, { useState, useEffect } from 'react'
import { SeatGrid } from '../seat/seat-grid'
import { useRealtimeSeats } from '@/lib/hooks/use-realtime-seats'
import { X, RefreshCw } from 'lucide-react'
import { motion } from 'framer-motion'

interface RealtimeSeatViewerProps {
  performance: any
  show: any
  onClose: () => void
}

export const RealtimeSeatViewer: React.FC<RealtimeSeatViewerProps> = ({ performance, show, onClose }) => {
  const { bookedSeats, loading } = useRealtimeSeats(performance.id)
  const [seatingLayout, setSeatingLayout] = useState<any>(null)
  const [fetchingLayout, setFetchingLayout] = useState(true)

  useEffect(() => {
    const fetchLayout = async () => {
      try {
        setFetchingLayout(true)
        // Fetch layout details
        const res = await fetch(`/api/shows/${show.id}`)
        const data = await res.json()
        
        if (data.success && data.data.seatingLayout) {
          setSeatingLayout(data.data.seatingLayout)
        }
      } catch (err) {
        console.error('Error fetching layout:', err)
      } finally {
        setFetchingLayout(false)
      }
    }

    fetchLayout()
  }, [show.id])

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-slate-900/80 backdrop-blur-sm z-[60] flex items-center justify-center p-4 md:p-8"
    >
      <motion.div 
        initial={{ scale: 0.9, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        className="bg-white w-full max-w-6xl max-h-full overflow-hidden rounded-[32px] shadow-2xl flex flex-col"
      >
        {/* Header */}
        <div className="p-6 md:p-8 border-b border-slate-100 flex justify-between items-center bg-slate-50">
          <div>
            <div className="flex items-center gap-3 mb-1">
              <h2 className="text-2xl font-black text-slate-900">{show.title}</h2>
              <span className="px-3 py-1 bg-blue-600 text-white text-[10px] font-black rounded-full uppercase tracking-widest">
                Realtime Monitor
              </span>
            </div>
            <p className="text-slate-500 font-medium">
              Performance: {new Date(performance.dateTime).toLocaleString('id-ID', { 
                weekday: 'long', 
                day: 'numeric', 
                month: 'long', 
                hour: '2-digit', 
                minute: '2-digit' 
              })}
            </p>
          </div>
          
          <div className="flex items-center gap-4">
            {loading && (
              <div className="flex items-center gap-2 text-blue-600 font-bold text-sm">
                <RefreshCw className="w-4 h-4 animate-spin" />
                Syncing...
              </div>
            )}
            <button 
              onClick={onClose}
              className="p-3 hover:bg-slate-200 rounded-2xl transition-colors text-slate-400 hover:text-slate-900"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-8 md:p-12">
          {fetchingLayout ? (
            <div className="h-96 flex flex-col items-center justify-center gap-4">
              <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
              <p className="text-slate-400 font-bold uppercase tracking-widest text-xs">Loading Seating Data...</p>
            </div>
          ) : seatingLayout ? (
            <SeatGrid
              seatingLayout={seatingLayout}
              bookedSeats={bookedSeats}
              selectedSeats={[]}
              onSeatSelect={() => {}}
              onSeatDeselect={() => {}}
              onTicketTypeChange={() => {}}
              readOnly={true}
            />
          ) : (
            <div className="text-center py-20 text-slate-400 font-bold">
              Layout tidak ditemukan untuk pertunjukan ini.
            </div>
          )}
        </div>

        {/* Footer info */}
        <div className="p-4 bg-slate-900 text-white flex justify-center gap-8 text-[10px] font-black uppercase tracking-widest">
           <div className="flex items-center gap-2">
             <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
             Live Connection Active
           </div>
           <div>Booked: {bookedSeats.length} / {seatingLayout?.seats?.length || 0}</div>
        </div>
      </motion.div>
    </motion.div>
  )
}
