'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Clock } from 'lucide-react'

export function RedirectTimer({ target = '/tickets', delay = 8000 }) {
  const [timeLeft, setTimeLeft] = useState(delay / 1000)
  const router = useRouter()

  useEffect(() => {
    if (timeLeft <= 0) {
      router.push(target)
      return
    }

    const timer = setInterval(() => {
      setTimeLeft((prev) => prev - 1)
    }, 1000)

    return () => clearInterval(timer)
  }, [timeLeft, router, target])

  return (
    <div className="mt-6 flex items-center justify-center gap-2 text-slate-400 text-xs font-medium animate-pulse">
      <Clock className="w-3 h-3" />
      <span>Redirecting to your tickets in {timeLeft} seconds...</span>
    </div>
  )
}
