import Link from 'next/link'
import Image from 'next/image'

const historyItems = [
  {
    id: '1',
    title: 'Horizon Jazz Festival',
    date: 'October 15, 2024 • 7:00 PM',
    status: 'Confirmed',
    icon: 'stadium',
    type: 'active'
  },
  {
    id: '2',
    title: 'Modern Canvas Expo',
    date: 'August 22, 2024 • 10:00 AM',
    status: 'Past Event',
    icon: 'palette',
    type: 'past'
  },
  {
    id: '3',
    title: 'Startup Summit 2024',
    date: 'July 05, 2024 • 09:00 AM',
    status: 'Cancelled',
    icon: 'cancel',
    type: 'cancelled'
  }
]

export default function ProfilePage() {
  return (
    <main className="max-w-[1200px] mx-auto px-8 py-10 w-full">
      <div className="grid grid-cols-1 md:grid-cols-12 gap-10">
        {/* Profile Sidebar */}
        <aside className="md:col-span-4 lg:col-span-3">
          <div className="bg-white border border-slate-100 rounded-2xl p-8 flex flex-col items-center text-center space-y-6 sticky top-28 shadow-sm">
            <div className="relative">
              <div className="w-32 h-32 rounded-full overflow-hidden border-4 border-teal-50">
                <Image 
                  alt="User Profile" 
                  className="w-full h-full object-cover" 
                  src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&q=80&w=300&h=300"
                  width={128}
                  height={128}
                />
              </div>
              <button className="absolute bottom-1 right-1 bg-teal-600 text-white p-2 rounded-full shadow-lg hover:bg-teal-700 transition-all">
                <span className="material-symbols-outlined text-[18px]">edit</span>
              </button>
            </div>
            <div className="space-y-1">
              <h1 className="text-xl font-bold text-slate-900">Alex Rivers</h1>
              <p className="text-sm text-slate-500 font-medium">alex.rivers@aura.io</p>
            </div>
            <div className="w-full pt-6 border-t border-slate-50 flex flex-col gap-2">
              <div className="flex items-center justify-between px-3 py-2.5 rounded-xl bg-teal-50 text-teal-700 font-bold text-xs uppercase tracking-widest">
                <div className="flex items-center gap-3">
                  <span className="material-symbols-outlined">person</span>
                  <span>Profile Details</span>
                </div>
                <span className="material-symbols-outlined text-[16px]">chevron_right</span>
              </div>
              <div className="flex items-center justify-between px-3 py-2.5 rounded-xl hover:bg-slate-50 transition-all text-slate-500 font-bold text-xs uppercase tracking-widest">
                <div className="flex items-center gap-3">
                  <span className="material-symbols-outlined">security</span>
                  <span>Security</span>
                </div>
                <span className="material-symbols-outlined text-[16px]">chevron_right</span>
              </div>
              <div className="flex items-center justify-between px-3 py-2.5 rounded-xl hover:bg-slate-50 transition-all text-slate-500 font-bold text-xs uppercase tracking-widest">
                <div className="flex items-center gap-3">
                  <span className="material-symbols-outlined">payments</span>
                  <span>Payment Methods</span>
                </div>
                <span className="material-symbols-outlined text-[16px]">chevron_right</span>
              </div>
            </div>
          </div>
        </aside>

        {/* Profile Content */}
        <section className="md:col-span-8 lg:col-span-9 space-y-10">
          <div className="flex items-end justify-between">
            <div>
              <h2 className="text-3xl font-bold text-slate-900">Booking History</h2>
              <p className="text-slate-500 text-sm font-medium mt-1">Manage your past and upcoming event reservations.</p>
            </div>
            <div className="flex bg-white border border-slate-200 rounded-xl p-1">
              <button className="px-4 py-1.5 rounded-lg bg-teal-500 text-white font-bold text-xs uppercase tracking-widest">All</button>
              <button className="px-4 py-1.5 rounded-lg hover:bg-slate-50 text-slate-500 font-bold text-xs uppercase tracking-widest">Upcoming</button>
            </div>
          </div>

          <div className="space-y-4">
            {historyItems.map((item) => (
              <div key={item.id} className={`bg-white border border-slate-100 rounded-2xl p-6 hover:shadow-lg transition-all flex flex-col md:flex-row md:items-center justify-between gap-6 group ${item.type === 'cancelled' ? 'opacity-60 grayscale' : ''}`}>
                <div className="flex items-center gap-6">
                  <div className={`w-16 h-16 rounded-xl flex items-center justify-center ${
                    item.type === 'active' ? 'bg-teal-50 text-teal-600' : 
                    item.type === 'past' ? 'bg-slate-50 text-slate-500' : 'bg-red-50 text-red-500'
                  }`}>
                    <span className="material-symbols-outlined text-[32px]">{item.icon}</span>
                  </div>
                  <div className="space-y-1">
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-widest ${
                      item.type === 'active' ? 'bg-teal-100 text-teal-700' : 
                      item.type === 'past' ? 'bg-slate-100 text-slate-600' : 'bg-red-100 text-red-700'
                    }`}>
                      {item.status}
                    </span>
                    <h3 className="text-lg font-bold text-slate-900">{item.title}</h3>
                    <p className="text-xs text-slate-500 font-bold uppercase tracking-wider flex items-center gap-1">
                      <span className="material-symbols-outlined text-[16px]">calendar_month</span>
                      {item.date}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  {item.type === 'active' ? (
                    <>
                      <button className="flex-1 md:flex-none px-6 py-2.5 rounded-xl border border-slate-200 font-bold text-[10px] uppercase tracking-widest text-slate-600 hover:bg-slate-50 transition-all flex items-center justify-center gap-2">
                        <span className="material-symbols-outlined text-[18px]">download</span>
                        Download
                      </button>
                      <Link 
                        href={`/tickets`}
                        className="flex-1 md:flex-none px-6 py-2.5 rounded-xl bg-teal-600 text-white font-bold text-[10px] uppercase tracking-widest hover:bg-teal-700 transition-all flex items-center justify-center gap-2 shadow-md"
                      >
                        <span className="material-symbols-outlined text-[18px]">confirmation_number</span>
                        View Ticket
                      </Link>
                    </>
                  ) : item.type === 'past' ? (
                    <>
                      <button className="flex-1 md:flex-none px-6 py-2.5 rounded-xl border border-slate-200 font-bold text-[10px] uppercase tracking-widest text-slate-600 hover:bg-slate-50 transition-all flex items-center justify-center gap-2">
                        <span className="material-symbols-outlined text-[18px]">receipt_long</span>
                        Invoice
                      </button>
                      <button className="flex-1 md:flex-none px-6 py-2.5 rounded-xl border border-teal-500 text-teal-600 font-bold text-[10px] uppercase tracking-widest hover:bg-teal-50 transition-all flex items-center justify-center gap-2">
                        <span className="material-symbols-outlined text-[18px]">history</span>
                        Rebook
                      </button>
                    </>
                  ) : (
                    <button className="flex-1 md:flex-none px-6 py-2.5 rounded-xl border border-slate-200 font-bold text-[10px] uppercase tracking-widest text-slate-600 hover:bg-slate-50 transition-all">
                      Details
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-teal-50 p-6 rounded-2xl border border-teal-100 space-y-2 shadow-sm">
              <span className="material-symbols-outlined text-teal-600">local_activity</span>
              <h4 className="text-3xl font-bold text-teal-800">12</h4>
              <p className="text-[10px] font-bold text-teal-700 opacity-70 uppercase tracking-widest">Total Tickets</p>
            </div>
            <div className="bg-white p-6 rounded-2xl border border-slate-100 space-y-2 shadow-sm">
              <span className="material-symbols-outlined text-teal-500">star</span>
              <h4 className="text-3xl font-bold text-slate-900">4.8</h4>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Attendee Rating</p>
            </div>
            <div className="bg-white p-6 rounded-2xl border border-slate-100 space-y-2 shadow-sm">
              <span className="material-symbols-outlined text-teal-500">loyalty</span>
              <h4 className="text-3xl font-bold text-slate-900">Gold</h4>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Member Status</p>
            </div>
          </div>
        </section>
      </div>
    </main>
  )
}
