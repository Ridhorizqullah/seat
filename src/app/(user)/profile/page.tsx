'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { useRouter } from 'next/navigation'

export default function ProfilePage() {
  const router = useRouter()
  
  // Authentication & Profile States
  const [session, setSession] = useState<any>(null)
  const [customer, setCustomer] = useState<any>(null)
  const [bookings, setBookings] = useState<any[]>([])
  
  // UI States
  const [activeTab, setActiveTab] = useState<'bookings' | 'profile' | 'security' | 'payments'>('bookings')
  const [bookingFilter, setBookingFilter] = useState<'all' | 'upcoming'>('all')
  const [loading, setLoading] = useState(true)
  const [updating, setUpdating] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)

  // Edit Profile Form State
  const [form, setForm] = useState({
    firstName: '',
    lastName: '',
    phone: '',
    address: ''
  })

  // Fetch Session, Profile, and Bookings on load
  useEffect(() => {
    async function initProfile() {
      try {
        setLoading(true)
        
        // 1. Get Session
        const authRes = await fetch('/api/auth/me')
        const authData = await authRes.json()
        
        if (!authData.success || !authData.data) {
          // If not logged in, redirect to login
          router.push('/login?callbackUrl=/profile&message=Please login to view your profile')
          return
        }
        
        const userEmail = authData.data.email
        setSession(authData.data)

        // 2. Get Supabase Customer Profile
        const profileRes = await fetch(`/api/profile?email=${userEmail}`)
        const profileData = await profileRes.json()
        
        if (profileData.success && profileData.data) {
          setCustomer(profileData.data)
          setForm({
            firstName: profileData.data.firstName || '',
            lastName: profileData.data.lastName || '',
            phone: profileData.data.phone || '',
            address: profileData.data.address || ''
          })
        } else {
          // Fallback if customer row not found yet
          setCustomer({ email: userEmail })
        }

        // 3. Get Real Bookings
        const ticketsRes = await fetch(`/api/tickets?email=${userEmail}`)
        const ticketsData = await ticketsRes.json()
        
        if (ticketsData.success && ticketsData.data) {
          setBookings(ticketsData.data)
        }
      } catch (err) {
        console.error('Error initializing profile data:', err)
      } finally {
        setLoading(false)
      }
    }

    initProfile()
  }, [router])

  // Handle Profile Update
  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      setUpdating(true)
      setMessage(null)

      const response = await fetch('/api/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: session.email,
          firstName: form.firstName,
          lastName: form.lastName,
          phone: form.phone,
          address: form.address
        })
      })

      const data = await response.json()

      if (data.success) {
        setCustomer(data.data)
        setMessage({ type: 'success', text: 'Profile updated successfully!' })
        // Clear message after 3 seconds
        setTimeout(() => setMessage(null), 3000)
      } else {
        setMessage({ type: 'error', text: data.message || 'Failed to update profile' })
      }
    } catch (err) {
      console.error('Error updating profile:', err)
      setMessage({ type: 'error', text: 'An unexpected error occurred.' })
    } finally {
      setUpdating(false)
    }
  }

  // Filter Bookings (All vs Upcoming)
  const filteredBookings = bookings.filter((booking) => {
    if (bookingFilter === 'all') return true
    
    // Check if performance is in the future
    const perfDate = new Date(booking.performances?.dateTime)
    return perfDate > new Date()
  })

  // Determine Loyalty Member Status
  const getMemberStatus = (bookingCount: number) => {
    if (bookingCount >= 5) return 'Gold'
    if (bookingCount >= 2) return 'Silver'
    return 'Bronze'
  }

  // Format Helper for Icons depending on genre
  const getGenreIcon = (title: string) => {
    const lTitle = title.toLowerCase()
    if (lTitle.includes('jazz') || lTitle.includes('music') || lTitle.includes('concert') || lTitle.includes('festival')) {
      return 'music_note'
    }
    if (lTitle.includes('art') || lTitle.includes('expo') || lTitle.includes('canvas')) {
      return 'palette'
    }
    if (lTitle.includes('summit') || lTitle.includes('conference') || lTitle.includes('tech')) {
      return 'co_present'
    }
    return 'stadium'
  }

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen gap-4 bg-slate-50">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-teal-500/20 border-t-teal-600"></div>
        <p className="text-slate-500 font-bold tracking-wide uppercase text-xs">Synchronizing profile vault...</p>
      </div>
    )
  }

  const displayName = customer?.firstName || customer?.lastName
    ? `${customer.firstName || ''} ${customer.lastName || ''}`.trim()
    : session?.email?.split('@')[0] || 'User'

  return (
    <main className="max-w-[1200px] mx-auto px-8 py-10 w-full min-h-[80px]">
      <div className="grid grid-cols-1 md:grid-cols-12 gap-10">
        
        {/* Left Profile Sidebar */}
        <aside className="md:col-span-4 lg:col-span-3">
          <div className="bg-white border border-slate-100 rounded-2xl p-8 flex flex-col items-center text-center space-y-6 sticky top-28 shadow-sm">
            <div className="relative">
              <div className="w-32 h-32 rounded-full overflow-hidden border-4 border-teal-50 flex items-center justify-center bg-teal-600/10">
                <span className="material-symbols-outlined text-[64px] text-teal-600">person</span>
              </div>
            </div>
            <div className="space-y-1">
              <h1 className="text-xl font-bold text-slate-900 leading-tight">{displayName}</h1>
              <p className="text-sm text-slate-500 font-semibold">{session?.email}</p>
            </div>
            
            {/* Interactive Tab Buttons */}
            <div className="w-full pt-6 border-t border-slate-100 flex flex-col gap-2">
              <button 
                onClick={() => { setActiveTab('bookings'); setMessage(null); }}
                className={`flex items-center justify-between px-4 py-3 rounded-xl font-bold text-xs uppercase tracking-widest transition-all ${
                  activeTab === 'bookings' 
                    ? 'bg-teal-50 text-teal-700' 
                    : 'text-slate-500 hover:bg-slate-50'
                }`}
              >
                <div className="flex items-center gap-3">
                  <span className="material-symbols-outlined text-[18px]">local_activity</span>
                  <span>Bookings</span>
                </div>
                <span className="material-symbols-outlined text-[16px]">chevron_right</span>
              </button>
              
              <button 
                onClick={() => { setActiveTab('profile'); setMessage(null); }}
                className={`flex items-center justify-between px-4 py-3 rounded-xl font-bold text-xs uppercase tracking-widest transition-all ${
                  activeTab === 'profile' 
                    ? 'bg-teal-50 text-teal-700' 
                    : 'text-slate-500 hover:bg-slate-50'
                }`}
              >
                <div className="flex items-center gap-3">
                  <span className="material-symbols-outlined text-[18px]">person</span>
                  <span>Profile Details</span>
                </div>
                <span className="material-symbols-outlined text-[16px]">chevron_right</span>
              </button>

              <button 
                onClick={() => { setActiveTab('security'); setMessage(null); }}
                className={`flex items-center justify-between px-4 py-3 rounded-xl font-bold text-xs uppercase tracking-widest transition-all ${
                  activeTab === 'security' 
                    ? 'bg-teal-50 text-teal-700' 
                    : 'text-slate-500 hover:bg-slate-50'
                }`}
              >
                <div className="flex items-center gap-3">
                  <span className="material-symbols-outlined text-[18px]">security</span>
                  <span>Security</span>
                </div>
                <span className="material-symbols-outlined text-[16px]">chevron_right</span>
              </button>

              <button 
                onClick={() => { setActiveTab('payments'); setMessage(null); }}
                className={`flex items-center justify-between px-4 py-3 rounded-xl font-bold text-xs uppercase tracking-widest transition-all ${
                  activeTab === 'payments' 
                    ? 'bg-teal-50 text-teal-700' 
                    : 'text-slate-500 hover:bg-slate-50'
                }`}
              >
                <div className="flex items-center gap-3">
                  <span className="material-symbols-outlined text-[18px]">payments</span>
                  <span>Payments</span>
                </div>
                <span className="material-symbols-outlined text-[16px]">chevron_right</span>
              </button>
            </div>
          </div>
        </aside>

        {/* Right Content Area */}
        <section className="md:col-span-8 lg:col-span-9 space-y-10">
          
          {/* TAB 1: BOOKING HISTORY */}
          {activeTab === 'bookings' && (
            <div className="space-y-10 animate-fade-in">
              <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
                <div>
                  <h2 className="text-3xl font-bold text-slate-900">Booking History</h2>
                  <p className="text-slate-500 text-sm font-medium mt-1">Manage your dynamic event reservations connected with Supabase.</p>
                </div>
                <div className="flex bg-white border border-slate-200 rounded-xl p-1 self-start sm:self-auto shadow-sm">
                  <button 
                    onClick={() => setBookingFilter('all')}
                    className={`px-4 py-1.5 rounded-lg font-bold text-xs uppercase tracking-widest transition-all ${
                      bookingFilter === 'all' 
                        ? 'bg-teal-500 text-white' 
                        : 'text-slate-500 hover:bg-slate-50'
                    }`}
                  >
                    All
                  </button>
                  <button 
                    onClick={() => setBookingFilter('upcoming')}
                    className={`px-4 py-1.5 rounded-lg font-bold text-xs uppercase tracking-widest transition-all ${
                      bookingFilter === 'upcoming' 
                        ? 'bg-teal-500 text-white' 
                        : 'text-slate-500 hover:bg-slate-50'
                    }`}
                  >
                    Upcoming
                  </button>
                </div>
              </div>

              {/* Booking Cards */}
              <div className="space-y-4">
                {filteredBookings.length === 0 ? (
                  <div className="py-20 text-center bg-white border border-slate-100 rounded-2xl shadow-sm">
                    <span className="material-symbols-outlined text-5xl text-slate-300 mb-4">event_busy</span>
                    <h3 className="text-lg font-bold text-slate-700 mb-1">No Bookings Found</h3>
                    <p className="text-slate-400 text-sm font-medium max-w-sm mx-auto mb-6">
                      {bookingFilter === 'upcoming' 
                        ? "You don't have any upcoming experiences scheduled." 
                        : "Your digital booking list is currently empty."}
                    </p>
                    <Link href="/events" className="inline-flex items-center gap-2 px-6 py-3 bg-teal-600 text-white rounded-xl font-bold text-xs uppercase tracking-wider hover:bg-teal-700 transition-all shadow-md">
                      <span className="material-symbols-outlined text-[16px]">search</span>
                      Explore Shows
                    </Link>
                  </div>
                ) : (
                  filteredBookings.map((booking) => {
                    const dateObj = new Date(booking.performances?.dateTime)
                    const showTitle = booking.performances?.shows?.title || 'Live Event'
                    const showGenreIcon = getGenreIcon(showTitle)
                    
                    const dateStr = dateObj.toLocaleDateString('en-US', { 
                      month: 'long', 
                      day: 'numeric', 
                      year: 'numeric' 
                    })
                    const timeStr = dateObj.toLocaleTimeString('en-US', { 
                      hour: '2-digit', 
                      minute: '2-digit' 
                    })

                    const isCancelled = booking.status === 'CANCELLED'
                    const isUpcoming = dateObj > new Date()
                    const displayStatus = isCancelled 
                      ? 'Cancelled' 
                      : !isUpcoming 
                        ? 'Past Event' 
                        : booking.status === 'PAID' 
                          ? 'Confirmed' 
                          : 'Pending'

                    return (
                      <div 
                        key={booking.id} 
                        className={`bg-white border border-slate-100 rounded-2xl p-6 hover:shadow-md transition-all flex flex-col md:flex-row md:items-center justify-between gap-6 ${isCancelled ? 'opacity-60 grayscale' : ''}`}
                      >
                        <div className="flex items-center gap-6">
                          <div className={`w-16 h-16 rounded-xl flex items-center justify-center shrink-0 ${
                            isCancelled 
                              ? 'bg-red-50 text-red-500' 
                              : !isUpcoming 
                                ? 'bg-slate-50 text-slate-500' 
                                : 'bg-teal-50 text-teal-600'
                          }`}>
                            <span className="material-symbols-outlined text-[32px]">{showGenreIcon}</span>
                          </div>
                          
                          <div className="space-y-1">
                            <span className={`inline-flex px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-widest ${
                              isCancelled 
                                ? 'bg-red-50 text-red-700' 
                                : !isUpcoming 
                                  ? 'bg-slate-100 text-slate-600' 
                                  : 'bg-emerald-50 text-emerald-700 border border-emerald-100'
                            }`}>
                              {displayStatus}
                            </span>
                            <h3 className="text-lg font-bold text-slate-900 leading-snug">{showTitle}</h3>
                            <p className="text-xs text-slate-500 font-bold uppercase tracking-wider flex items-center gap-1.5">
                              <span className="material-symbols-outlined text-[16px] text-teal-500">calendar_month</span>
                              {dateStr} • {timeStr}
                            </p>
                          </div>
                        </div>

                        {/* Booking Action Buttons */}
                        <div className="flex items-center gap-3 shrink-0">
                          {isCancelled ? (
                            <button className="px-5 py-2.5 rounded-xl border border-slate-200 font-bold text-[10px] uppercase tracking-widest text-slate-600 hover:bg-slate-50 transition-all">
                              Details
                            </button>
                          ) : isUpcoming ? (
                            <>
                              <button 
                                onClick={() => alert(`Downloading ticket PDF for Booking ${booking.bookingNumber}...`)}
                                className="px-5 py-2.5 rounded-xl border border-slate-200 font-bold text-[10px] uppercase tracking-widest text-slate-600 hover:bg-slate-50 transition-all flex items-center gap-2"
                              >
                                <span className="material-symbols-outlined text-[16px]">download</span>
                                Download
                              </button>
                              <Link 
                                href="/tickets"
                                className="px-5 py-2.5 rounded-xl bg-teal-600 text-white font-bold text-[10px] uppercase tracking-widest hover:bg-teal-700 transition-all flex items-center gap-2 shadow-sm"
                              >
                                <span className="material-symbols-outlined text-[16px]">confirmation_number</span>
                                View Pass
                              </Link>
                            </>
                          ) : (
                            <>
                              <button 
                                onClick={() => alert(`Opening Invoice for Booking ${booking.bookingNumber}...`)}
                                className="px-5 py-2.5 rounded-xl border border-slate-200 font-bold text-[10px] uppercase tracking-widest text-slate-600 hover:bg-slate-50 transition-all flex items-center gap-2"
                              >
                                <span className="material-symbols-outlined text-[16px]">receipt_long</span>
                                Invoice
                              </button>
                              <Link 
                                href="/events"
                                className="px-5 py-2.5 rounded-xl border border-teal-500 text-teal-600 font-bold text-[10px] uppercase tracking-widest hover:bg-teal-50 transition-all flex items-center gap-2"
                              >
                                <span className="material-symbols-outlined text-[16px]">history</span>
                                Rebook
                              </Link>
                            </>
                          )}
                        </div>
                      </div>
                    )
                  })
                )}
              </div>

              {/* Dynamic Quick Stats */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-4">
                <div className="bg-teal-50/50 p-6 rounded-2xl border border-teal-100/40 space-y-2 shadow-sm">
                  <span className="material-symbols-outlined text-teal-600 text-3xl">local_activity</span>
                  <h4 className="text-3xl font-bold text-teal-800">{bookings.length}</h4>
                  <p className="text-[10px] font-bold text-teal-700 opacity-80 uppercase tracking-widest">Total Bookings</p>
                </div>
                <div className="bg-white p-6 rounded-2xl border border-slate-100 space-y-2 shadow-sm">
                  <span className="material-symbols-outlined text-teal-500 text-3xl">star</span>
                  <h4 className="text-3xl font-bold text-slate-900">4.9</h4>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Attendee Score</p>
                </div>
                <div className="bg-white p-6 rounded-2xl border border-slate-100 space-y-2 shadow-sm">
                  <span className="material-symbols-outlined text-teal-500 text-3xl">loyalty</span>
                  <h4 className="text-3xl font-bold text-slate-900">{getMemberStatus(bookings.length)}</h4>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Loyalty Status</p>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: PROFILE DETAILS EDIT FORM */}
          {activeTab === 'profile' && (
            <div className="bg-white border border-slate-100 p-8 rounded-2xl shadow-sm space-y-8 animate-fade-in">
              <div>
                <h2 className="text-2xl font-bold text-slate-900">Profile Details</h2>
                <p className="text-slate-500 text-sm font-medium mt-1">Update your personal contact details, which are securely synced with Supabase.</p>
              </div>

              <form onSubmit={handleUpdateProfile} className="space-y-6">
                
                {/* Form Alert Message */}
                {message && (
                  <div className={`p-4 rounded-xl text-sm font-bold flex items-center gap-2 border ${
                    message.type === 'success' 
                      ? 'bg-emerald-50 text-emerald-800 border-emerald-100' 
                      : 'bg-red-50 text-red-800 border-red-100'
                  }`}>
                    <span className="material-symbols-outlined">
                      {message.type === 'success' ? 'check_circle' : 'error'}
                    </span>
                    <span>{message.text}</span>
                  </div>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">First Name</label>
                    <input 
                      type="text" 
                      value={form.firstName}
                      onChange={(e) => setForm({ ...form, firstName: e.target.value })}
                      placeholder="e.g. Alex"
                      className="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm font-semibold text-slate-800 focus:outline-none focus:border-teal-500 transition-colors"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Last Name</label>
                    <input 
                      type="text" 
                      value={form.lastName}
                      onChange={(e) => setForm({ ...form, lastName: e.target.value })}
                      placeholder="e.g. Rivers"
                      className="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm font-semibold text-slate-800 focus:outline-none focus:border-teal-500 transition-colors"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Email Address (Read-Only)</label>
                  <input 
                    type="email" 
                    value={session?.email || ''} 
                    disabled
                    className="w-full px-4 py-3 rounded-xl border border-slate-100 bg-slate-50 text-sm font-semibold text-slate-400 cursor-not-allowed"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Phone Number</label>
                  <input 
                    type="tel" 
                    value={form.phone}
                    onChange={(e) => setForm({ ...form, phone: e.target.value })}
                    placeholder="e.g. +62 812-3456-7890"
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm font-semibold text-slate-800 focus:outline-none focus:border-teal-500 transition-colors"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Physical Address</label>
                  <textarea 
                    value={form.address}
                    onChange={(e) => setForm({ ...form, address: e.target.value })}
                    placeholder="e.g. Sudirman Suite 14B, South Jakarta"
                    rows={3}
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm font-semibold text-slate-800 focus:outline-none focus:border-teal-500 transition-colors resize-none"
                  />
                </div>

                <div className="pt-4 flex justify-end">
                  <button 
                    type="submit" 
                    disabled={updating}
                    className="px-8 py-3.5 bg-teal-600 text-white rounded-xl font-bold text-xs uppercase tracking-widest hover:bg-teal-700 transition-all shadow-md flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {updating ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-2 border-white/20 border-t-white"></div>
                        <span>Saving...</span>
                      </>
                    ) : (
                      <>
                        <span className="material-symbols-outlined text-[16px]">save</span>
                        <span>Save Changes</span>
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* TAB 3: SECURITY INFORMATION */}
          {activeTab === 'security' && (
            <div className="bg-white border border-slate-100 p-8 rounded-2xl shadow-sm space-y-8 animate-fade-in">
              <div>
                <h2 className="text-2xl font-bold text-slate-900">Security & Sign In</h2>
                <p className="text-slate-500 text-sm font-medium mt-1">Manage your account security configurations and credentials.</p>
              </div>

              <div className="p-6 rounded-xl bg-slate-50 border border-slate-100 flex items-start gap-4">
                <span className="material-symbols-outlined text-teal-600 p-2 bg-teal-50 rounded-lg">verified_user</span>
                <div>
                  <h4 className="font-bold text-slate-900 mb-1">Authenticated Account</h4>
                  <p className="text-sm text-slate-500">Your account is fully synchronized and validated via secure tokens using standard Session protocols.</p>
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex justify-between items-center p-4 border-b border-slate-100">
                  <div>
                    <h5 className="font-bold text-slate-800 text-sm">Two-Factor Authentication</h5>
                    <p className="text-xs text-slate-400">Add an extra layer of protection to your profile.</p>
                  </div>
                  <button 
                    onClick={() => alert("MFA settings will be configurable in your next security release!")}
                    className="px-4 py-2 border border-slate-200 rounded-lg font-bold text-[10px] uppercase tracking-wider text-slate-500 hover:bg-slate-50 transition-all"
                  >
                    Configure
                  </button>
                </div>

                <div className="flex justify-between items-center p-4 border-b border-slate-100">
                  <div>
                    <h5 className="font-bold text-slate-800 text-sm">Change Password</h5>
                    <p className="text-xs text-slate-400 font-medium">To update your password, request a security code link.</p>
                  </div>
                  <button 
                    onClick={() => alert("A reset code link has been simulated to your email.")}
                    className="px-4 py-2 bg-teal-50 text-teal-700 hover:bg-teal-100 rounded-lg font-bold text-[10px] uppercase tracking-wider transition-all"
                  >
                    Reset Password
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: SAVED PAYMENTS */}
          {activeTab === 'payments' && (
            <div className="bg-white border border-slate-100 p-8 rounded-2xl shadow-sm space-y-8 animate-fade-in">
              <div>
                <h2 className="text-2xl font-bold text-slate-900">Payment Gateways</h2>
                <p className="text-slate-500 text-sm font-medium mt-1">Securely manage your saved credit cards and billing settings integrated with Stripe.</p>
              </div>

              <div className="p-8 border border-slate-100 rounded-2xl bg-gradient-to-br from-slate-950 to-slate-850 text-white flex flex-col justify-between aspect-[1.58/1] max-w-sm relative overflow-hidden shadow-lg">
                <div className="absolute top-0 right-0 w-32 h-32 bg-teal-500/10 rounded-full blur-[40px] -z-0"></div>
                
                <div className="z-10 flex justify-between items-start">
                  <span className="material-symbols-outlined text-3xl text-teal-400">credit_card</span>
                  <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">TEST PLATFORM CARD</span>
                </div>

                <div className="z-10 text-xl font-bold tracking-[0.2em] py-4">
                  ••••  ••••  ••••  4242
                </div>

                <div className="z-10 flex justify-between items-end">
                  <div>
                    <p className="text-[8px] font-bold text-slate-500 uppercase tracking-wider">Card Holder</p>
                    <p className="text-xs font-bold uppercase">{displayName}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-[8px] font-bold text-slate-500 uppercase tracking-wider">Expires</p>
                    <p className="text-xs font-bold">12 / 29</p>
                  </div>
                </div>
              </div>

              <p className="text-xs text-slate-400 font-semibold uppercase tracking-wider flex items-center gap-2">
                <span className="material-symbols-outlined text-teal-500 text-sm">lock</span>
                Payments are securely managed inside the Sandbox Stripe API.
              </p>
            </div>
          )}

        </section>
      </div>
    </main>
  )
}
