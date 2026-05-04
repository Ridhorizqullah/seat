import Link from 'next/link'

export default function LandingPage() {
  return (
    <div className="flex flex-col">
      {/* Hero Section */}
      <section className="relative min-h-[700px] flex items-center justify-center overflow-hidden px-6 py-16">
        <div className="absolute inset-0 z-0">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_-20%,_#2dd4bf20_0%,_transparent_50%)]"></div>
          <div className="absolute inset-0 bg-white/40"></div>
        </div>
        
        <div className="relative z-10 text-center max-w-4xl">
          <div className="inline-block px-4 py-1.5 rounded-full bg-teal-500/10 text-teal-600 font-semibold text-xs tracking-wider uppercase mb-6">
            Seamless Experience
          </div>
          <h1 className="text-[48px] md:text-[64px] font-bold text-slate-900 leading-[1.1] tracking-tight mb-6">
            BOOK YOUR SEATS <span className="text-teal-500">EASILY</span>
          </h1>
          <p className="text-[18px] md:text-[20px] text-slate-600 mb-10 max-w-2xl mx-auto leading-relaxed">
            Experience the future of event booking. From underground raves to tech summits, secure your spot with our lightning-fast booking engine.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Link 
              href="/events" 
              className="w-full sm:w-auto px-10 py-4 bg-teal-600 text-white rounded-xl font-semibold shadow-lg hover:shadow-teal-500/20 hover:-translate-y-0.5 transition-all flex items-center justify-center gap-2"
            >
              Get Started
              <span className="material-symbols-outlined text-sm">arrow_forward</span>
            </Link>
            <Link 
              href="/events" 
              className="w-full sm:w-auto px-10 py-4 border border-slate-200 bg-white text-slate-900 rounded-xl font-semibold hover:bg-slate-50 transition-all"
            >
              View Events
            </Link>
          </div>
          
          {/* Floating Stats */}
          <div className="mt-20 flex flex-wrap justify-center gap-8 md:gap-16 px-8 py-8 bg-white border border-slate-100 rounded-2xl aura-shadow">
            <div className="text-center">
              <div className="text-teal-600 font-bold text-3xl">500+</div>
              <div className="text-slate-500 text-xs font-semibold uppercase tracking-wider mt-1">Active Events</div>
            </div>
            <div className="hidden md:block w-px h-12 bg-slate-100"></div>
            <div className="text-center">
              <div className="text-teal-600 font-bold text-3xl">24/7</div>
              <div className="text-slate-500 text-xs font-semibold uppercase tracking-wider mt-1">Instant Support</div>
            </div>
            <div className="hidden md:block w-px h-12 bg-slate-100"></div>
            <div className="text-center">
              <div className="text-teal-600 font-bold text-3xl">12M</div>
              <div className="text-slate-500 text-xs font-semibold uppercase tracking-wider mt-1">Tickets Sold</div>
            </div>
          </div>
        </div>
      </section>

      {/* Upcoming Vibes Bento Grid */}
      <section className="py-16 px-8 max-w-[1200px] mx-auto w-full">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-10 gap-4">
          <div>
            <h2 className="text-3xl font-bold text-slate-900">Upcoming Vibes</h2>
            <p className="text-slate-500 mt-1">Handpicked experiences for the modern pioneer.</p>
          </div>
          <div className="flex gap-2">
            <button className="p-3 border border-slate-200 rounded-full hover:bg-slate-50 transition-all">
              <span className="material-symbols-outlined leading-none">chevron_left</span>
            </button>
            <button className="p-3 border border-slate-200 rounded-full hover:bg-slate-50 transition-all">
              <span className="material-symbols-outlined leading-none">chevron_right</span>
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
          {/* Large Featured Event */}
          <div className="md:col-span-8 group">
            <div className="bg-white border border-slate-100 rounded-3xl overflow-hidden aura-shadow flex flex-col h-full">
              <div className="relative h-[400px]">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img 
                  className="w-full h-full object-cover" 
                  src="https://images.unsplash.com/photo-1540039155733-5bb30b53aa14?auto=format&fit=crop&q=80" 
                  alt="Cyberpunk Summit"
                />
                <div className="absolute top-6 left-6 bg-teal-600 text-white px-4 py-1.5 rounded-full font-semibold text-xs uppercase tracking-wider">Featured</div>
              </div>
              <div className="p-8 flex-1 flex flex-col">
                <div className="flex items-center gap-2 text-teal-600 font-semibold text-xs uppercase tracking-widest mb-3">
                  <span className="material-symbols-outlined text-sm">calendar_month</span>
                  October 24, 2024
                </div>
                <h3 className="text-3xl font-bold mb-3">Cyberpunk Summit 2024</h3>
                <p className="text-slate-600 mb-8">Join the world&apos;s leading tech visionaries for a two-day immersion into the future of decentralization and neuro-tech.</p>
                <div className="mt-auto flex items-center justify-between">
                  <span className="text-2xl font-bold text-slate-900">$199.00</span>
                  <Link 
                    href="/events/1"
                    className="bg-teal-500/10 text-teal-700 px-6 py-2.5 rounded-xl font-bold hover:bg-teal-500/20 transition-all flex items-center gap-2"
                  >
                    Get Tickets
                    <span className="material-symbols-outlined text-sm">arrow_outward</span>
                  </Link>
                </div>
              </div>
            </div>
          </div>

          {/* Vertical Event List */}
          <div className="md:col-span-4 flex flex-col gap-6">
            {[1, 2, 3].map((i) => (
              <div key={i} className="bg-white border border-slate-100 rounded-2xl p-4 aura-shadow group cursor-pointer hover:border-teal-500/30 transition-colors">
                <div className="flex gap-4">
                  <div className="w-24 h-24 rounded-xl bg-slate-100 overflow-hidden">
                     {/* eslint-disable-next-line @next/next/no-img-element */}
                     <img src={`https://images.unsplash.com/photo-1470225620780-dba8ba36b745?auto=format&fit=crop&q=80&w=100&h=100&sig=${i}`} className="w-full h-full object-cover" alt="Event" />
                  </div>
                  <div className="flex flex-col justify-center">
                    <span className="text-teal-600 font-bold text-xs uppercase tracking-widest">Nov {12 + i}</span>
                    <h4 className="font-bold text-lg leading-tight mt-1">Neon Nights Vol. {i}</h4>
                    <p className="text-slate-500 text-sm mt-1">Underground Techno</p>
                  </div>
                </div>
              </div>
            ))}
            <Link 
              href="/events" 
              className="mt-2 w-full py-4 rounded-xl border-2 border-dashed border-slate-200 text-slate-500 font-semibold hover:border-teal-500 hover:text-teal-600 transition-all text-center"
            >
              View All Events
            </Link>
          </div>
        </div>
      </section>

      {/* Seat Selection Preview */}
      <section className="py-16 px-8 bg-slate-50/50">
        <div className="max-w-[1200px] mx-auto grid md:grid-cols-2 gap-16 items-center">
          <div className="order-2 md:order-1">
            <div className="bg-white p-10 rounded-[40px] aura-shadow border border-slate-100">
              <div className="grid grid-cols-6 gap-4 mb-10">
                {[...Array(12)].map((_, i) => (
                  <div 
                    key={i} 
                    className={`w-10 h-10 rounded-xl flex items-center justify-center border ${
                      i === 4 || i === 7 || i === 8 ? 'bg-teal-500 text-white shadow-[0_0_15px_rgba(45,212,191,0.5)] border-teal-500' : 
                      i === 2 || i === 11 ? 'bg-red-50 border-red-100 text-red-500' : 'bg-slate-50 border-slate-100'
                    }`}
                  >
                    {i === 4 || i === 7 || i === 8 ? <span className="material-symbols-outlined text-xs">check</span> : 
                     i === 2 || i === 11 ? <span className="material-symbols-outlined text-xs">close</span> : null}
                  </div>
                ))}
              </div>
              <div className="flex justify-center gap-6">
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 rounded bg-slate-50 border border-slate-100"></div>
                  <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Available</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 rounded bg-red-50 border border-red-100"></div>
                  <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Booked</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 rounded bg-teal-500"></div>
                  <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Selected</span>
                </div>
              </div>
            </div>
          </div>
          <div className="order-1 md:order-2">
            <span className="text-teal-600 font-bold text-sm uppercase tracking-[0.2em] mb-4 block">Precision Control</span>
            <h2 className="text-4xl font-bold mb-6 leading-tight">Choose your perfect vantage point</h2>
            <p className="text-slate-600 text-[18px] mb-8">
              Our interactive seat selection engine gives you a real-time view of the floor. Pick your zone, select your node, and own the night.
            </p>
            <ul className="space-y-5">
              {[
                'Real-time availability tracking',
                'Tiered pricing zones (VIP, Front, Mezzanine)',
                'Mobile-optimized geometric seat maps'
              ].map((item, i) => (
                <li key={i} className="flex items-center gap-4">
                  <div className="w-8 h-8 rounded-full bg-teal-50 flex items-center justify-center text-teal-600">
                    <span className="material-symbols-outlined text-lg">check</span>
                  </div>
                  <span className="font-medium text-slate-900">{item}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>
    </div>
  )
}
