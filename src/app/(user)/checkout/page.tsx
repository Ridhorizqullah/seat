'use client'

import { useState, useEffect, Suspense } from 'react'

import { useRouter, useSearchParams } from 'next/navigation'
import { getUser } from '@/lib/auth-client'

function CheckoutContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const performanceId = searchParams.get('performanceId')
  const showId = searchParams.get('showId')
  const seatIds = searchParams.get('seats')?.split(',') || []


  const [show, setShow] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [processing, setProcessing] = useState(false)
  const [error, setError] = useState('')

  // Form State
  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')

  useEffect(() => {
    const currentUser = getUser()
    if (currentUser) {
      setEmail(currentUser.email)
    }

    if (!showId || !performanceId) {
      router.push('/events')
      return
    }

    async function fetchShow() {
      try {
        const res = await fetch(`/api/shows/${showId}`)
        const data = await res.json()
        if (data.success) setShow(data.data)
      } catch (err) {
        console.error('Error fetching show:', err)
      } finally {
        setLoading(false)
      }
    }

    fetchShow()
  }, [showId, performanceId, router])

  const [paymentStatus, setPaymentStatus] = useState('')

  const handleBooking = async (e: React.FormEvent) => {
    e.preventDefault()
    setProcessing(true)
    setError('')
    setPaymentStatus('Verifying seats...')

    try {
      // 1. First, create the booking in PENDING status
      const payload = {
        customer: {
          email: email,
          firstName: fullName.split(' ')[0] || 'Customer',
          lastName: fullName.split(' ').slice(1).join(' ') || 'User',
          phone: phone
        },
        showId: showId,
        performanceId: performanceId,
        seats: seatIds.map(id => ({
          seatId: id,
          ticketType: 'ADULT',
          price: show.adultPrice
        }))
      }

      const res = await fetch('/api/bookings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      })

      const data = await res.json()

      if (!res.ok) {
        throw new Error(data.message || 'Failed to initialize booking')
      }

      // 2. Simulate Payment Step (Task 3 & 5)
      setPaymentStatus('Securing payment...')
      const payRes = await fetch(`/api/bookings/${data.data.bookingId}/pay`, {
        method: 'POST'
      })
      const payData = await payRes.json()

      if (!payRes.ok) {
        throw new Error(payData.message || 'Payment processing failed')
      }

      setPaymentStatus('Booking confirmed!')
      await new Promise(resolve => setTimeout(resolve, 1000))

      router.push(`/success?bookingId=${data.data.bookingId}`)

    } catch (err: any) {
      setError(err.message || 'Something went wrong')
      setPaymentStatus('')
    } finally {
      setProcessing(false)
    }
  }

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen gap-4">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-teal-500/20 border-t-teal-600"></div>
        <p className="text-slate-500 font-medium">Preparing checkout...</p>
      </div>
    )
  }

  if (!show) return null

  const subtotal = seatIds.length * show.adultPrice
  const total = subtotal + 2.50

  return (
    <main className="max-w-[1200px] mx-auto px-8 py-10">
      {/* Breadcrumb */}
      <div className="mb-10">
        <div className="flex items-center gap-2 text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
          <span>Events</span>
          <span className="material-symbols-outlined text-[16px]">chevron_right</span>
          <span>{show.title}</span>
          <span className="material-symbols-outlined text-[16px]">chevron_right</span>
          <span className="text-teal-600">Checkout</span>
        </div>
        <h1 className="text-3xl font-bold text-slate-900">Secure Checkout</h1>
      </div>

      <form onSubmit={handleBooking} className="grid grid-cols-1 lg:grid-cols-12 gap-12">
        {/* Left Side: Form */}
        <div className="lg:col-span-7 space-y-8">
          {error && (
            <div className="p-4 bg-red-50 text-red-600 rounded-xl border border-red-100 font-medium">
              {error}
            </div>
          )}

          {/* Section 1: User Details */}
          <section className="bg-white p-8 rounded-2xl border border-slate-100 shadow-sm">
            <div className="flex items-center gap-3 mb-8">
              <span className="material-symbols-outlined text-teal-600">person</span>
              <h2 className="text-xl font-bold text-slate-900">Personal Information</h2>
            </div>
            <div className="space-y-6">
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-2 tracking-wider">Full Name</label>
                <input 
                  required
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20 outline-none transition-all" 
                  placeholder="e.g. Alex Rivera" 
                  type="text"
                />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-2 tracking-wider">Email Address</label>
                  <input 
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20 outline-none transition-all" 
                    placeholder="alex@aura.com" 
                    type="email"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-2 tracking-wider">Phone Number</label>
                  <input 
                    required
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20 outline-none transition-all" 
                    placeholder="+1 (555) 000-0000" 
                    type="tel"
                  />
                </div>
              </div>
            </div>
          </section>

          {/* Section 2: Payment Method (Simplified/Fake for now as per instructions) */}
          <section className="bg-white p-8 rounded-2xl border border-slate-100 shadow-sm">
            <div className="flex items-center gap-3 mb-8">
              <span className="material-symbols-outlined text-teal-600">payments</span>
              <h2 className="text-xl font-bold text-slate-900">Payment Details</h2>
            </div>
            <p className="text-slate-500 text-sm mb-6 italic">Secure payment processing is active. Please confirm your order details.</p>
          </section>
        </div>

        {/* Right Side: Summary Card */}
        <div className="lg:col-span-5">
          <div className="bg-white rounded-2xl border border-slate-100 overflow-hidden shadow-xl sticky top-28">
            <div className="relative h-48 bg-slate-900">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img 
                className="w-full h-full object-cover opacity-60" 
                src={show.imageUrl || "https://images.unsplash.com/photo-1492684223066-81342ee5ff30?auto=format&fit=crop&q=80"} 
                alt="Event"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent flex items-end p-6">
                <h3 className="text-white text-xl font-bold">{show.title}</h3>
              </div>
            </div>
            <div className="p-8 space-y-6">
              <div className="flex items-start gap-4">
                <span className="material-symbols-outlined text-teal-600">calendar_today</span>
                <div className="flex flex-col">
                  <span className="text-sm font-bold text-slate-900">{new Date(show.performances?.[0]?.dateTime).toLocaleDateString()}</span>
                  <span className="text-xs text-slate-500 font-medium">{new Date(show.performances?.[0]?.dateTime).toLocaleTimeString()}</span>
                </div>
              </div>
              
              <div className="border-t border-slate-100 pt-6">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] block mb-4">Summary</span>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-bold text-slate-900">{seatIds.length} Tickets Selected</span>
                    <span className="text-sm font-bold text-slate-900">${subtotal.toFixed(2)}</span>
                  </div>
                </div>
              </div>

              <div className="border-t border-slate-100 pt-6 space-y-3">
                <div className="flex justify-between text-sm font-medium text-slate-500">
                  <span>Subtotal</span>
                  <span>${subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm font-medium text-slate-500">
                  <span>Service Fee</span>
                  <span>$2.50</span>
                </div>
                <div className="flex justify-between items-center pt-3 border-t border-slate-100">
                  <span className="text-xl font-bold text-slate-900">Total</span>
                  <span className="text-2xl font-bold text-teal-600">${total.toFixed(2)}</span>
                </div>
              </div>

              <button 
                type="submit"
                disabled={processing}
                className="w-full bg-teal-600 text-white py-4 rounded-xl font-bold text-lg hover:bg-teal-700 transition-all flex items-center justify-center gap-2 shadow-lg disabled:opacity-50"
              >
                <span>{paymentStatus || (processing ? 'Processing...' : 'Pay Now')}</span>
                <span className="material-symbols-outlined">lock</span>
              </button>
            </div>
          </div>
        </div>
      </form>
    </main>
  )
}

export default function CheckoutPage() {
  return (
    <Suspense fallback={<div>Loading checkout...</div>}>
      <CheckoutContent />
    </Suspense>
  )
}
