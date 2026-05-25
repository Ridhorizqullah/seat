import React from 'react'

export interface UsabilityAnalyticsProviderProps {
  children: React.ReactNode
}

export function UsabilityAnalyticsProvider({ children }: UsabilityAnalyticsProviderProps) {
  return <>{children}</>
}
