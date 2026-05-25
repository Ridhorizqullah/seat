import React from 'react'
import { getServerSupabase } from '@/lib/supabase'
import Stripe from 'stripe'
import Link from 'next/link'
import { 
  CheckCircle2, 
  Ticket, 
  Calendar, 
  MapPin, 
  Home, 
  Download,
  Info,
  ShieldCheck
} from 'lucide-react'
import { SuccessTracker } from '@/components/booking/success-tracker'

async function fetchBooking(identifier: string) {
  const supabase = getServerSupabase()
  const bookingQuery = supabase
    .from('bookings')
    .select(`
      id,
      bookingNumber,
      totalAmount,
      bookingFee,
      status,
      createdAt,
      qrCodeData,
      stripePaymentIntentId,
      customers ( firstName, lastName, email ),
      performances ( id, dateTime ),
      shows ( id, title, imageUrl )
    `)

  if (identifier.startsWith('cs_')) {
    if (!process.env.STRIPE_SECRET_KEY) {
      throw new Error('Stripe not configured for success page lookup')
    }
    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!)
    const session = await stripe.checkout.sessions.retrieve(identifier)
    const piId = (session.payment_intent as string) || ''
    
    // Attempt to find booking by Payment Intent (updated by webhook)
    if (piId) {
      for (let attempt = 0; attempt < 3; attempt++) {
        const { data } = await bookingQuery.eq('stripePaymentIntentId', piId).maybeSingle()
        if (data && data.status === 'PAID') return data
        await new Promise(r => setTimeout(r, 1000))
      }
    }
    
    // Fallback: use bookingId from session metadata
    const fallbackBookingId = session.metadata?.bookingId as string | undefined
    if (fallbackBookingId) {
      const { data } = await bookingQuery.eq('id', fallbackBookingId).maybeSingle()
      if (data) {
        // If it's still PENDING but session is paid, update it here (fail-safe)
        if (data.status === 'PENDING' && (session.payment_status === 'paid' || session.status === 'complete')) {
          await supabase.from('bookings').update({ 
            status: 'PAID', 
            stripePaymentIntentId: piId,
            paidAt: new Date().toISOString()
          }).eq('id', fallbackBookingId)
          
          // Refetch to get the updated state
          const { data: updated } = await bookingQuery.eq('id', fallbackBookingId).single()
          return updated
        }
        return data
      }
    }
    
    throw new Error('Booking not found')
  }

  const { data, error } = await bookingQuery.eq('id', identifier).maybeSingle()
  if (error) throw new Error(error.message)
  if (!data) throw new Error('Booking not found')
  return data
}

export default async function BookingSuccessPage({ 
  params, 
  searchParams 
}: { 
  params: Promise<{ bookingId: string }>, 
  searchParams?: Promise<Record<string, string>> 
}) {
  const { bookingId } = await params
  const sp = await searchParams || {}
  const fallbackId = sp.bookingId as string | undefined
  
  // Use fallbackId if the main param is a Stripe Session ID
  const identifier = bookingId.startsWith('cs_') && fallbackId ? fallbackId : bookingId
  
  let booking: any
  try {
    booking = await fetchBooking(identifier)
  } catch {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 p-6">
        <div className="max-w-md w-full bg-white rounded-[32px] p-8 shadow-sm border border-slate-100 text-center">
          <div className="w-16 h-16 bg-red-50 rounded-2xl flex items-center justify-center mx-auto mb-6">
            <Info className="w-8 h-8 text-red-600" />
          </div>
          <h1 className="text-2xl font-black text-slate-900 mb-2">Booking Tidak Ditemukan</h1>
          <p className="text-slate-500 mb-8">Maaf, kami tidak dapat menemukan detail pesanan Anda. Silakan hubungi dukungan jika pembayaran Anda sudah berhasil.</p>
          <Link href="/" className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 transition-all">
            <Home className="w-5 h-5" />
            Kembali ke Beranda
          </Link>
        </div>
      </div>
    )
  }

  const show = booking.shows
  const perf = booking.performances
  const customer = booking.customers

  return (
    <main className="min-h-screen bg-[#F8FAFC] pb-20">
      <SuccessTracker totalAmount={Number(booking.totalAmount)} />
      {/* Header / Success Indicator */}
      <div className="bg-white border-b border-slate-100 py-10">
        <div className="max-w-[800px] mx-auto px-6 text-center">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-emerald-50 rounded-[32px] mb-6 relative">
            <CheckCircle2 className="w-10 h-10 text-emerald-600" />
            <div className="absolute -inset-2 bg-emerald-100/50 rounded-[40px] -z-10 animate-pulse"></div>
          </div>
          <h1 className="text-4xl font-black text-slate-900 mb-3">Pembayaran Berhasil!</h1>
          <p className="text-slate-500 font-medium max-w-md mx-auto">
            Terima kasih, **{customer?.firstName}**. Pesanan Anda telah dikonfirmasi dan tiket elektronik telah dikirim ke **{customer?.email}**.
          </p>
        </div>
      </div>

      <div className="max-w-[800px] mx-auto px-6 -mt-8">
        {/* Digital Ticket Card */}
        <div className="bg-white rounded-[40px] shadow-2xl shadow-blue-900/5 border border-slate-100 overflow-hidden relative">
          {/* Top Banner */}
          <div className="h-48 relative overflow-hidden bg-slate-900">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img 
              src={show?.imageUrl || "https://images.unsplash.com/photo-1492684223066-81342ee5ff30?auto=format&fit=crop&q=80"} 
              className="w-full h-full object-cover opacity-40" 
              alt="Show" 
            />
            <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/20 to-transparent"></div>
            <div className="absolute bottom-8 left-10">
              <div className="flex items-center gap-2 mb-3">
                <span className="px-3 py-1 bg-emerald-500 text-[10px] font-black rounded-full uppercase tracking-widest text-white shadow-lg shadow-emerald-500/20">
                  Confirmed
                </span>
                <span className="px-3 py-1 bg-white/10 backdrop-blur-md text-[10px] font-black rounded-full uppercase tracking-widest text-white border border-white/20">
                  {booking.bookingNumber}
                </span>
              </div>
              <h2 className="text-3xl font-black text-white">{show?.title}</h2>
            </div>
          </div>

          {/* Ticket Details */}
          <div className="p-10 relative">
            {/* Perforation Effect */}
            <div className="absolute top-0 left-10 right-10 h-px border-t-2 border-dashed border-slate-100"></div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-y-8 gap-x-12 mb-10 pb-10 border-b border-slate-100">
              <div className="space-y-1">
                <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Jadwal Pertunjukan</p>
                <div className="flex items-center gap-3">
                  <Calendar className="w-5 h-5 text-blue-600" />
                  <p className="text-lg font-black text-slate-900">
                    {new Date(perf?.dateTime).toLocaleDateString('id-ID', { 
                      weekday: 'long', 
                      year: 'numeric', 
                      month: 'long', 
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </p>
                </div>
              </div>
              <div className="space-y-1">
                <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Lokasi Venue</p>
                <div className="flex items-center gap-3">
                  <MapPin className="w-5 h-5 text-blue-600" />
                  <p className="text-lg font-black text-slate-900">Demo Theatre, Hall A</p>
                </div>
              </div>
              <div className="space-y-1">
                <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Metode Pembayaran</p>
                <div className="flex items-center gap-3">
                  <ShieldCheck className="w-5 h-5 text-emerald-600" />
                  <p className="text-lg font-black text-slate-900">Stripe Card Payment</p>
                </div>
              </div>
              <div className="space-y-1">
                <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Total Pembayaran</p>
                <div className="flex items-baseline gap-1">
                  <span className="text-2xl font-black text-slate-900">£{Number(booking.totalAmount).toFixed(2)}</span>
                  <span className="text-slate-400 text-xs font-bold uppercase tracking-widest">GBP</span>
                </div>
              </div>
            </div>

            {/* QR Section */}
            <div className="flex flex-col md:flex-row items-center gap-10">
              <div className="p-4 bg-slate-50 rounded-[32px] border border-slate-100 shadow-inner group">
                <div className="w-32 h-32 bg-white rounded-2xl flex items-center justify-center shadow-sm group-hover:scale-105 transition-transform duration-500 overflow-hidden">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img 
                    src={`https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${booking.bookingNumber}`} 
                    alt="Booking QR Code"
                    className="w-24 h-24"
                  />
                </div>
              </div>
              <div className="flex-1 text-center md:text-left space-y-3">
                <h4 className="text-xl font-black text-slate-900">Tunjukkan QR Code Ini</h4>
                <p className="text-slate-500 text-sm font-medium leading-relaxed">
                  Gunakan kode QR di atas saat memasuki gedung pertunjukan. Pastikan Anda tiba 30 menit sebelum acara dimulai.
                </p>
                <div className="pt-2 flex flex-wrap justify-center md:justify-start gap-4">
                  <button className="flex items-center gap-2 text-blue-600 font-black text-[10px] uppercase tracking-widest hover:text-blue-700 transition-colors">
                    <Download className="w-4 h-4" />
                    Simpan Tiket (PDF)
                  </button>
                  <button className="flex items-center gap-2 text-slate-400 font-black text-[10px] uppercase tracking-widest hover:text-slate-900 transition-colors">
                    <Calendar className="w-4 h-4" />
                    Tambah ke Kalender
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Actions */}
        <div className="mt-12 flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link 
            href="/tickets" 
            className="w-full sm:w-auto px-10 h-16 bg-blue-600 text-white font-black uppercase tracking-widest text-xs rounded-2xl shadow-xl shadow-blue-600/20 hover:bg-blue-700 hover:-translate-y-1 transition-all flex items-center justify-center gap-3 active:translate-y-0"
          >
            <Ticket className="w-5 h-5" />
            Lihat Tiket Saya
          </Link>
          <Link 
            href="/" 
            className="w-full sm:w-auto px-10 h-16 bg-white text-slate-900 border border-slate-100 font-black uppercase tracking-widest text-xs rounded-2xl hover:bg-slate-50 hover:border-slate-200 transition-all flex items-center justify-center gap-3"
          >
            <Home className="w-5 h-5" />
            Kembali ke Beranda
          </Link>
        </div>
      </div>
    </main>
  )
}
