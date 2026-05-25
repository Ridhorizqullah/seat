'use client'

import { useEffect } from 'react'
import { useUsabilityTracking } from '@/lib/usability-analytics'

interface SuccessTrackerProps {
  totalAmount: number
}

export function SuccessTracker({ totalAmount }: SuccessTrackerProps) {
  const { trackCheckoutCompleted } = useUsabilityTracking()

  useEffect(() => {
    // Log the successful checkout event locally & in Clarity
    trackCheckoutCompleted(totalAmount, 1)
  }, [trackCheckoutCompleted, totalAmount])

  return null
}
