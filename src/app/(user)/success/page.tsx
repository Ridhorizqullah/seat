import Link from 'next/link'

export default function SuccessPage() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center py-16 px-6 bg-slate-50">
      <div className="w-full max-w-[600px] flex flex-col items-center space-y-10">
        {/* Success Status Header */}
        <div className="text-center space-y-4">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-teal-100 text-teal-600 mb-2">
            <span className="material-symbols-outlined !text-5xl" style={{ fontVariationSettings: "'FILL' 1" }}>check_circle</span>
          </div>
          <h1 className="text-4xl font-bold text-slate-900">Payment Successful</h1>
          <p className="text-lg text-slate-500 max-w-[400px] mx-auto leading-relaxed">
            Your booking is confirmed! We&apos;ve sent a copy of your ticket to your email address.
          </p>
        </div>

        {/* Digital Ticket Card */}
        <div className="w-full bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-xl relative">
          {/* Ticket Header/Banner Image */}
          <div className="h-48 relative overflow-hidden bg-slate-900">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img 
              className="w-full h-full object-cover opacity-60" 
              src="https://images.unsplash.com/photo-1492684223066-81342ee5ff30?auto=format&fit=crop&q=80" 
              alt="Event"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent"></div>
            <div className="absolute bottom-6 left-6">
              <span className="bg-teal-500 text-white text-[10px] font-bold px-3 py-1 rounded-full mb-2 inline-block uppercase tracking-widest">Confirmed</span>
              <h2 className="text-white text-2xl font-bold">The Neon Symphony</h2>
            </div>
          </div>
          
          {/* Ticket Body */}
          <div className="p-8 relative">
            <div className="grid grid-cols-2 gap-8 pb-8 border-b border-dashed border-slate-200">
              <div className="space-y-1">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Date & Time</p>
                <p className="text-sm font-bold text-slate-900">Aug 24, 2024 • 7:00 PM</p>
              </div>
              <div className="space-y-1">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Location</p>
                <p className="text-sm font-bold text-slate-900">The Aura Garden, SF</p>
              </div>
              <div className="space-y-1">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Seat Assignment</p>
                <p className="text-sm font-bold text-slate-900">Section VIP-A, Seat G-42</p>
              </div>
              <div className="space-y-1">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Order ID</p>
                <p className="text-sm font-bold text-slate-900">#EE-9902148</p>
              </div>
            </div>
            
            {/* Cutout decorations */}
            <div className="absolute w-6 h-6 bg-slate-50 border-r border-slate-200 rounded-full top-1/2 -translate-y-1/2 -left-3"></div>
            <div className="absolute w-6 h-6 bg-slate-50 border-l border-slate-200 rounded-full top-1/2 -translate-y-1/2 -right-3"></div>
            
            {/* Ticket QR & Action */}
            <div className="pt-8 flex flex-col md:flex-row items-center gap-8">
              <div className="p-2 bg-white border border-slate-200 rounded-xl shadow-sm">
                <div className="w-32 h-32 flex items-center justify-center bg-slate-50 rounded-lg">
                  <span className="material-symbols-outlined !text-7xl text-slate-300">qr_code_2</span>
                </div>
              </div>
              <div className="flex-1 text-center md:text-left space-y-2">
                <p className="text-sm text-slate-600 leading-relaxed">
                  Please have this QR code ready at the entrance. Your digital ticket is also available in the &apos;My Tickets&apos; section.
                </p>
                <div className="pt-2">
                  <button className="flex items-center gap-2 text-teal-600 font-bold text-xs uppercase tracking-widest hover:underline">
                    <span className="material-symbols-outlined !text-sm">calendar_add_on</span>
                    Add to Calendar
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Primary Actions */}
        <div className="w-full flex flex-col sm:flex-row items-center justify-center gap-4">
          <button className="w-full sm:w-auto px-8 h-14 bg-teal-600 text-white font-bold rounded-xl shadow-lg hover:bg-teal-700 transition-all flex items-center justify-center gap-3 active:scale-[0.98]">
            <span className="material-symbols-outlined">download</span>
            Download Ticket
          </button>
          <Link 
            href="/" 
            className="w-full sm:w-auto px-8 h-14 bg-white text-slate-900 border border-slate-200 font-bold rounded-xl hover:bg-slate-50 transition-all flex items-center justify-center gap-3 active:scale-[0.98]"
          >
            <span className="material-symbols-outlined">home</span>
            Back to Home
          </Link>
        </div>

        {/* Help Text */}
        <div className="pt-4 text-center">
          <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">
            Need help? <a className="text-teal-600 hover:underline" href="#">Contact Support</a>
          </p>
        </div>
      </div>
    </main>
  )
}
