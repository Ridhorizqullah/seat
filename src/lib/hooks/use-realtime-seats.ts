import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'

export function useRealtimeSeats(performanceId: string) {
  const [bookedSeats, setBookedSeats] = useState<string[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!performanceId) return

    // 1. Initial Fetch
    const fetchBookedSeats = async () => {
      try {
        setLoading(true)
        const res = await fetch(`/api/booked-seats/${performanceId}`)
        const json = await res.json()
        if (json.success && json.data) {
          setBookedSeats(json.data.bookedSeatIds || [])
        }
      } catch (err) {
        console.error('Error fetching booked seats:', err)
      } finally {
        setLoading(false)
      }
    }

    fetchBookedSeats()

    // 2. Realtime Listener
    // We listen to booking_items table. When a new item is added, we check if it's for our performance.
    // However, since booking_items doesn't have performanceId directly (it's via bookings),
    // we might want to listen to a view or just refresh on any booking_item change if performanceId matches.
    
    const channel = supabase
      .channel(`realtime-seats-${performanceId}`)
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'booking_items' }, 
        () => {
          // Re-fetch when anything changes in booking_items
          // Optimisasi: Bisa lebih spesifik, tapi untuk keandalan kita re-fetch.
          fetchBookedSeats()
        }
      )
      .on('postgres_changes',
        { event: '*', schema: 'public', table: 'seats' },
        () => {
          // Listen to direct seat status updates (for admin maintenance etc)
          fetchBookedSeats()
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [performanceId])

  return { bookedSeats, loading }
}
