import { UsabilitySessionMetadata } from './types'

// Helper to generate a random participant ID (e.g., P-A7E9)
export function generateParticipantId(): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'
  let result = 'P-'
  for (let i = 0; i < 4; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  return result
}

// Helper to generate a unique session ID
export function generateSessionId(): string {
  return 'S-' + Math.random().toString(36).substring(2, 11).toUpperCase()
}

// Detect operating system from user agent
export function getOS(userAgent: string): string {
  if (userAgent.indexOf('Win') !== -1) return 'Windows'
  if (userAgent.indexOf('Mac') !== -1) return 'MacOS'
  if (userAgent.indexOf('X11') !== -1) return 'UNIX'
  if (userAgent.indexOf('Linux') !== -1) return 'Linux'
  if (/Android/.test(userAgent)) return 'Android'
  if (/iPhone|iPad|iPod/.test(userAgent)) return 'iOS'
  return 'Unknown OS'
}

// Detect browser from user agent
export function getBrowser(userAgent: string): string {
  if (userAgent.indexOf('Chrome') !== -1 && userAgent.indexOf('Chromium') === -1) {
    if (userAgent.indexOf('Edg') !== -1) return 'Microsoft Edge'
    if (userAgent.indexOf('OPR') !== -1 || userAgent.indexOf('Opera') !== -1) return 'Opera'
    return 'Google Chrome'
  }
  if (userAgent.indexOf('Safari') !== -1 && userAgent.indexOf('Chrome') === -1) return 'Safari'
  if (userAgent.indexOf('Firefox') !== -1) return 'Mozilla Firefox'
  if (userAgent.indexOf('Trident') !== -1 || userAgent.indexOf('MSIE') !== -1) return 'Internet Explorer'
  return 'Unknown Browser'
}

// Detect device type based on width
export function getDeviceType(width: number): 'Desktop' | 'Tablet' | 'Mobile' {
  if (width < 768) return 'Mobile'
  if (width >= 768 && width < 1024) return 'Tablet'
  return 'Desktop'
}

// Check URL query parameters or sessionStorage for A/B testing variant override
export function resolveABVariant(): 'A' | 'B' {
  if (typeof window === 'undefined') return 'A'
  
  // 1. Check URL parameters first (e.g. ?variant=B)
  const urlParams = new URLSearchParams(window.location.search)
  const queryVariant = urlParams.get('variant')?.toUpperCase()
  if (queryVariant === 'A' || queryVariant === 'B') {
    sessionStorage.setItem('usability_ab_variant', queryVariant)
    return queryVariant
  }

  // 2. Check sessionStorage
  const storedVariant = sessionStorage.getItem('usability_ab_variant')
  if (storedVariant === 'A' || storedVariant === 'B') {
    return storedVariant as 'A' | 'B'
  }

  // 3. Fallback: Assign randomly (50/50 split)
  const randomVariant = Math.random() < 0.5 ? 'A' : 'B'
  sessionStorage.setItem('usability_ab_variant', randomVariant)
  return randomVariant
}

// Retrieve or initialize the full session metadata
export function getSessionMetadata(): UsabilitySessionMetadata {
  if (typeof window === 'undefined') {
    return {
      participantId: 'SYSTEM',
      sessionId: 'SYSTEM',
      variantId: 'A',
      deviceType: 'Desktop',
      browserName: 'Server',
      operatingSystem: 'Server',
      screenResolution: 'N/A',
      viewportSize: 'N/A',
      startTime: Date.now()
    }
  }

  // Retrieve or generate participant ID (persists across refreshes in localStorage for consistent logs)
  let pId = localStorage.getItem('usability_participant_id')
  if (!pId) {
    pId = generateParticipantId()
    localStorage.setItem('usability_participant_id', pId)
  }

  // Retrieve or generate session ID (lives per-tab/session in sessionStorage)
  let sId = sessionStorage.getItem('usability_session_id')
  let startTimeStr = sessionStorage.getItem('usability_session_start_time')
  let startTime = Date.now()

  if (!sId || !startTimeStr) {
    sId = generateSessionId()
    startTimeStr = String(Date.now())
    sessionStorage.setItem('usability_session_id', sId)
    sessionStorage.setItem('usability_session_start_time', startTimeStr)
  } else {
    startTime = Number(startTimeStr)
  }

  const userAgent = navigator.userAgent
  const width = window.innerWidth
  const height = window.innerHeight

  return {
    participantId: pId,
    sessionId: sId,
    variantId: resolveABVariant(),
    deviceType: getDeviceType(width),
    browserName: getBrowser(userAgent),
    operatingSystem: getOS(userAgent),
    screenResolution: `${window.screen.width}x${window.screen.height}`,
    viewportSize: `${width}x${height}`,
    startTime
  }
}
