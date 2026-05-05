import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './user-theme.css'
import UserNavbar from '@/components/user/Navbar'
import UserFooter from '@/components/user/Footer' 

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' })

export const metadata: Metadata = {
  title: 'EventEase | Premium Event Booking',
  description: 'Experience the future of event booking. Seamless, fast, and beautiful.',
}

export default function UserLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className={`${inter.variable} font-sans bg-slate-50 text-slate-900 min-h-screen flex flex-col`}>
      <UserNavbar />
      <div className="flex-grow">
        {children}
      </div>
      <UserFooter />
    </div>
  )
}
