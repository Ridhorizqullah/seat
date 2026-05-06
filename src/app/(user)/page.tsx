import Link from 'next/link'
import { 
  ArrowRight, 
  ArrowUpRight, 
  Calendar, 
  Check, 
  ChevronLeft, 
  ChevronRight, 
  X,
  Sparkles,
  Activity,
  Ticket
} from 'lucide-react'

export default function LandingPage() {
  return (
    <div className="flex flex-col bg-[#020617] text-slate-100 min-h-screen font-sans overflow-hidden">
      {/* Hero Section */}
      <section className="relative min-h-[750px] flex items-center justify-center px-6 py-16">
        {/* Glow Spheres */}
        <div className="absolute inset-0 z-0 overflow-hidden">
          <div className="absolute top-[-25%] left-[-15%] w-[600px] h-[600px] rounded-full bg-teal-500/10 blur-[130px] pointer-events-none"></div>
          <div className="absolute bottom-[5%] right-[-15%] w-[700px] h-[700px] rounded-full bg-indigo-500/10 blur-[150px] pointer-events-none"></div>
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_120%,_#0f172a_0%,_transparent_60%)]"></div>
        </div>
        
        <div className="relative z-10 text-center max-w-4xl">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-teal-500/10 border border-teal-500/20 text-teal-400 font-bold text-xs tracking-wider uppercase mb-8">
            <Sparkles className="w-3.5 h-3.5 animate-pulse" />
            Seamless Experience
          </div>
          <h1 className="text-5xl md:text-7xl font-black text-white leading-[1.05] tracking-tight mb-6">
            BOOK YOUR SEATS <span className="text-transparent bg-clip-text bg-gradient-to-r from-teal-400 via-cyan-400 to-indigo-400">EASILY</span>
          </h1>
          <p className="text-lg md:text-xl text-slate-400 mb-10 max-w-2xl mx-auto leading-relaxed">
            Experience the future of event booking. From underground raves to tech summits, secure your spot with our lightning-fast booking engine.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Link 
              href="/events" 
              className="group w-full sm:w-auto px-10 py-4 bg-gradient-to-r from-teal-500 to-cyan-500 text-slate-950 rounded-xl font-bold hover:shadow-[0_0_30px_rgba(45,212,191,0.4)] hover:-translate-y-0.5 transition-all flex items-center justify-center gap-2"
            >
              Get Started
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </Link>
            <Link 
              href="/events" 
              className="w-full sm:w-auto px-10 py-4 border border-slate-800 bg-slate-900/40 text-slate-200 rounded-xl font-bold hover:bg-slate-800/80 hover:-translate-y-0.5 transition-all flex items-center justify-center"
            >
              View Events
            </Link>
          </div>
          
          {/* Floating Stats */}
          <div className="mt-20 flex flex-wrap justify-center gap-8 md:gap-16 px-8 py-8 bg-slate-950/40 border border-slate-800/80 backdrop-blur-md rounded-2xl shadow-[0_0_50px_rgba(0,0,0,0.5)]">
            <div className="text-center">
              <div className="text-teal-400 font-black text-3xl md:text-4xl">500+</div>
              <div className="text-slate-500 text-xs font-bold uppercase tracking-widest mt-1.5">Active Events</div>
            </div>
            <div className="hidden md:block w-px h-12 bg-slate-800/60"></div>
            <div className="text-center">
              <div className="text-teal-400 font-black text-3xl md:text-4xl">24/7</div>
              <div className="text-slate-500 text-xs font-bold uppercase tracking-widest mt-1.5">Instant Support</div>
            </div>
            <div className="hidden md:block w-px h-12 bg-slate-800/60"></div>
            <div className="text-center">
              <div className="text-teal-400 font-black text-3xl md:text-4xl">12M</div>
              <div className="text-slate-500 text-xs font-bold uppercase tracking-widest mt-1.5">Tickets Sold</div>
            </div>
          </div>
        </div>
      </section>

      {/* Upcoming Vibes Bento Grid */}
      <section className="py-20 px-8 max-w-[1200px] mx-auto w-full relative">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-12 gap-4">
          <div>
            <span className="text-teal-400 font-bold text-xs uppercase tracking-widest mb-2 block">Handpicked Selections</span>
            <h2 className="text-4xl font-extrabold text-white tracking-tight">Upcoming Vibes</h2>
            <p className="text-slate-400 mt-1">Experiences for the modern pioneer.</p>
          </div>
          <div className="flex gap-2">
            <button className="p-3 border border-slate-800 bg-slate-950/40 text-slate-400 rounded-full hover:bg-slate-800 hover:text-white transition-all">
              <ChevronLeft className="w-5 h-5" />
            </button>
            <button className="p-3 border border-slate-800 bg-slate-950/40 text-slate-400 rounded-full hover:bg-slate-800 hover:text-white transition-all">
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
          {/* Large Featured Event */}
          <div className="md:col-span-8 group">
            <div className="bg-slate-950/40 border border-slate-800 rounded-3xl overflow-hidden shadow-[0_0_40px_rgba(0,0,0,0.3)] hover:border-teal-500/30 transition-all flex flex-col h-full">
              <div className="relative h-[400px] overflow-hidden">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img 
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" 
                  src="https://images.unsplash.com/photo-1540039155733-5bb30b53aa14?auto=format&fit=crop&q=80" 
                  alt="Cyberpunk Summit"
                />
                <div className="absolute top-6 left-6 bg-gradient-to-r from-teal-500 to-cyan-500 text-slate-950 px-4 py-1.5 rounded-full font-extrabold text-xs uppercase tracking-wider">Featured</div>
              </div>
              <div className="p-8 flex-1 flex flex-col">
                <div className="flex items-center gap-2 text-teal-400 font-bold text-xs uppercase tracking-widest mb-4">
                  <Calendar className="w-4 h-4" />
                  October 24, 2024
                </div>
                <h3 className="text-3xl font-black text-white mb-3">Cyberpunk Summit 2024</h3>
                <p className="text-slate-400 mb-8 leading-relaxed">Join the world&apos;s leading tech visionaries for a two-day immersion into the future of decentralization and neuro-tech.</p>
                <div className="mt-auto flex items-center justify-between pt-4 border-t border-slate-900">
                  <span className="text-2xl font-black text-teal-400">$199.00</span>
                  <Link 
                    href="/events"
                    className="bg-teal-400/10 text-teal-400 px-6 py-3 rounded-xl font-bold hover:bg-teal-400/20 hover:-translate-y-0.5 transition-all flex items-center gap-2"
                  >
                    Get Tickets
                    <ArrowUpRight className="w-4 h-4" />
                  </Link>
                </div>
              </div>
            </div>
          </div>

          {/* Vertical Event List */}
          <div className="md:col-span-4 flex flex-col gap-6">
            {[1, 2, 3].map((i) => (
              <div key={i} className="bg-slate-950/30 border border-slate-900 rounded-2xl p-4 shadow-[0_0_30px_rgba(0,0,0,0.2)] group cursor-pointer hover:border-teal-500/30 hover:bg-slate-950/60 transition-all">
                <div className="flex gap-4">
                  <div className="w-20 h-20 rounded-xl bg-slate-900 overflow-hidden shrink-0">
                     {/* eslint-disable-next-line @next/next/no-img-element */}
                     <img src={`https://images.unsplash.com/photo-1470225620780-dba8ba36b745?auto=format&fit=crop&q=80&w=100&h=100&sig=${i}`} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" alt="Event" />
                  </div>
                  <div className="flex flex-col justify-center">
                    <span className="text-teal-400 font-bold text-xs uppercase tracking-widest">Nov {12 + i}</span>
                    <h4 className="font-extrabold text-white text-lg leading-snug mt-1">Neon Nights Vol. {i}</h4>
                    <p className="text-slate-500 text-sm mt-1">Underground Techno</p>
                  </div>
                </div>
              </div>
            ))}
            <Link 
              href="/events" 
              className="mt-2 w-full py-4 rounded-xl border-2 border-dashed border-slate-800 text-slate-500 font-semibold hover:border-teal-500 hover:text-teal-400 transition-all text-center flex items-center justify-center gap-2"
            >
              <Ticket className="w-4 h-4" />
              View All Events
            </Link>
          </div>
        </div>
      </section>

      {/* Seat Selection Preview */}
      <section className="py-20 px-8 bg-slate-950/20 border-t border-slate-900 relative">
        <div className="absolute top-[20%] left-[50%] -translate-x-1/2 w-[600px] h-[300px] bg-indigo-500/5 blur-[120px] pointer-events-none"></div>
        <div className="max-w-[1200px] mx-auto grid md:grid-cols-2 gap-16 items-center">
          <div className="order-2 md:order-1">
            <div className="bg-slate-950/60 p-10 rounded-[40px] shadow-[0_0_50px_rgba(0,0,0,0.4)] border border-slate-900/80 backdrop-blur-md relative">
              <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-teal-500/40 via-cyan-500/40 to-indigo-500/40 rounded-t-full"></div>
              {/* Virtual Stage */}
              <div className="text-center mb-8">
                <div className="inline-block px-10 py-1.5 border border-slate-800 bg-slate-900/50 rounded-full text-[10px] font-bold text-slate-500 uppercase tracking-[0.25em]">Stage Screen</div>
              </div>
              <div className="grid grid-cols-6 gap-4 mb-10">
                {[...Array(12)].map((_, i) => (
                  <div 
                    key={i} 
                    className={`w-10 h-10 rounded-xl flex items-center justify-center border transition-all ${
                      i === 4 || i === 7 || i === 8 ? 'bg-teal-500 text-slate-950 shadow-[0_0_20px_rgba(45,212,191,0.5)] border-teal-400 font-bold' : 
                      i === 2 || i === 11 ? 'bg-slate-900 border-slate-800 text-slate-600 cursor-not-allowed' : 'bg-slate-900/40 border-slate-800 text-slate-400 hover:border-slate-700'
                    }`}
                  >
                    {i === 4 || i === 7 || i === 8 ? <Check className="w-4 h-4 stroke-[3]" /> : 
                     i === 2 || i === 11 ? <X className="w-4 h-4 stroke-[2]" /> : null}
                  </div>
                ))}
              </div>
              <div className="flex justify-center gap-6 pt-6 border-t border-slate-900">
                <div className="flex items-center gap-2">
                  <div className="w-3.5 h-3.5 rounded bg-slate-900/40 border border-slate-800"></div>
                  <span className="text-xs font-bold text-slate-500 uppercase tracking-widest">Available</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3.5 h-3.5 rounded bg-slate-900 border border-slate-800 flex items-center justify-center text-slate-600"><X className="w-2.5 h-2.5" /></div>
                  <span className="text-xs font-bold text-slate-500 uppercase tracking-widest">Booked</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3.5 h-3.5 rounded bg-teal-500 flex items-center justify-center text-slate-950"><Check className="w-2.5 h-2.5 stroke-[3]" /></div>
                  <span className="text-xs font-bold text-slate-500 uppercase tracking-widest">Selected</span>
                </div>
              </div>
            </div>
          </div>
          <div className="order-1 md:order-2">
            <span className="inline-flex items-center gap-1.5 text-teal-400 font-bold text-xs uppercase tracking-[0.2em] mb-4">
              <Activity className="w-4 h-4 stroke-[3] animate-pulse" />
              Precision Control
            </span>
            <h2 className="text-4xl font-extrabold text-white mb-6 leading-tight tracking-tight">Choose your perfect vantage point</h2>
            <p className="text-slate-400 text-lg mb-8 leading-relaxed">
              Our interactive seat selection engine gives you a real-time view of the floor. Pick your zone, select your node, and own the night.
            </p>
            <ul className="space-y-5">
              {[
                'Real-time availability tracking',
                'Tiered pricing zones (VIP, Front, Mezzanine)',
                'Mobile-optimized geometric seat maps'
              ].map((item, i) => (
                <li key={i} className="flex items-center gap-4">
                  <div className="w-8 h-8 rounded-full bg-teal-500/10 flex items-center justify-center text-teal-400">
                    <Check className="w-4 h-4 stroke-[3]" />
                  </div>
                  <span className="font-semibold text-slate-200">{item}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>
    </div>
  )
}
