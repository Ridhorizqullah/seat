import Link from 'next/link'

export default function UserFooter() {
  return (
    <footer className="bg-white dark:bg-slate-950 border-t border-slate-100 dark:border-slate-900 mt-16">
      <div className="w-full py-16 px-8 max-w-[1200px] mx-auto flex flex-col md:flex-row justify-between items-center gap-8 font-['Inter'] text-sm tracking-wide text-slate-500 dark:text-slate-400">
        <div className="flex flex-col items-center md:items-start gap-4">
          <span className="text-lg font-semibold text-teal-600 dark:text-teal-500">EventEase</span>
          <p>© 2024 EventEase. Designed for breezy booking.</p>
        </div>
        <nav className="flex gap-8">
          <Link className="text-slate-400 hover:text-teal-500 transition-colors hover:underline decoration-teal-500 underline-offset-4" href="#">About Us</Link>
          <Link className="text-slate-400 hover:text-teal-500 transition-colors hover:underline decoration-teal-500 underline-offset-4" href="#">Privacy Policy</Link>
          <Link className="text-slate-400 hover:text-teal-500 transition-colors hover:underline decoration-teal-500 underline-offset-4" href="#">Terms of Service</Link>
          <Link className="text-slate-400 hover:text-teal-500 transition-colors hover:underline decoration-teal-500 underline-offset-4" href="#">Contact</Link>
        </nav>
        <div className="flex gap-4">
          <button className="p-2 bg-slate-50 dark:bg-slate-900 rounded-full hover:text-teal-500 transition-all">
            <span className="material-symbols-outlined text-lg">share</span>
          </button>
          <button className="p-2 bg-slate-50 dark:bg-slate-900 rounded-full hover:text-teal-500 transition-all">
            <span className="material-symbols-outlined text-lg">language</span>
          </button>
        </div>
      </div>
    </footer>
  )
}
