import { UsabilityEvent, ThinkAloudMarker } from './types'

const EVENTS_STORAGE_KEY = 'usability_analytics_events'
const THINK_ALOUD_STORAGE_KEY = 'usability_analytics_think_aloud'

// Push event to local storage
export function logEventLocally(event: Omit<UsabilityEvent, 'id' | 'timestamp' | 'relativeTimeMs'>, startTime: number): UsabilityEvent {
  const timestamp = new Date().toISOString()
  const relativeTimeMs = Date.now() - startTime
  const id = 'EV-' + Math.random().toString(36).substring(2, 9).toUpperCase()

  const fullEvent: UsabilityEvent = {
    ...event,
    id,
    timestamp,
    relativeTimeMs,
  }

  if (typeof window !== 'undefined') {
    try {
      const stored = localStorage.getItem(EVENTS_STORAGE_KEY)
      const events: UsabilityEvent[] = stored ? JSON.parse(stored) : []
      events.push(fullEvent)
      localStorage.setItem(EVENTS_STORAGE_KEY, JSON.stringify(events))
    } catch (_e) {
      console.error('Failed to log usability event locally:', _e)
    }
  }

  return fullEvent
}

// Log a Think-Aloud marker locally
export function logThinkAloudLocally(note: string, startTime: number): ThinkAloudMarker {
  const timestamp = new Date().toISOString()
  const relativeTimeMs = Date.now() - startTime
  const id = 'TA-' + Math.random().toString(36).substring(2, 9).toUpperCase()

  const marker: ThinkAloudMarker = {
    id,
    timestamp,
    relativeTimeMs,
    note
  }

  if (typeof window !== 'undefined') {
    try {
      const stored = localStorage.getItem(THINK_ALOUD_STORAGE_KEY)
      const markers: ThinkAloudMarker[] = stored ? JSON.parse(stored) : []
      markers.push(marker)
      localStorage.setItem(THINK_ALOUD_STORAGE_KEY, JSON.stringify(markers))
    } catch (_e) {
      console.error('Failed to log think aloud marker locally:', _e)
    }
  }

  return marker
}

// Retrieve all local events
export function getLocalEvents(): UsabilityEvent[] {
  if (typeof window === 'undefined') return []
  try {
    const stored = localStorage.getItem(EVENTS_STORAGE_KEY)
    return stored ? JSON.parse(stored) : []
  } catch (_e) {
    return []
  }
}

// Retrieve all think-aloud markers
export function getLocalThinkAloudMarkers(): ThinkAloudMarker[] {
  if (typeof window === 'undefined') return []
  try {
    const stored = localStorage.getItem(THINK_ALOUD_STORAGE_KEY)
    return stored ? JSON.parse(stored) : []
  } catch (_e) {
    return []
  }
}

// Clear all local records
export function clearLocalAnalytics() {
  if (typeof window === 'undefined') return
  localStorage.removeItem(EVENTS_STORAGE_KEY)
  localStorage.removeItem(THINK_ALOUD_STORAGE_KEY)
}

// Export logs to JSON and trigger browser download
export function downloadJSONExport() {
  if (typeof window === 'undefined') return

  const events = getLocalEvents()
  const thinkAloud = getLocalThinkAloudMarkers()
  const exportObj = {
    exportDate: new Date().toISOString(),
    totalEvents: events.length,
    totalThinkAloudMarkers: thinkAloud.length,
    events,
    thinkAloudMarkers: thinkAloud,
  }

  const jsonStr = JSON.stringify(exportObj, null, 2)
  const blob = new Blob([jsonStr], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  
  const a = document.createElement('a')
  a.href = url
  a.download = `usability_analytics_export_${Date.now()}.json`
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)
}

// Helper to escape CSV values
function escapeCSV(val: any): string {
  if (val === undefined || val === null) return ''
  let str = typeof val === 'object' ? JSON.stringify(val) : String(val)
  // Escape double quotes by doubling them
  str = str.replace(/"/g, '""')
  return `"${str}"`
}

// Export logs to CSV and trigger browser download
export function downloadCSVExport() {
  if (typeof window === 'undefined') return

  const events = getLocalEvents()
  if (events.length === 0) {
    alert('No usability testing logs found in local storage to export.')
    return
  }

  const headers = [
    'Event ID',
    'Timestamp',
    'Relative Time (ms)',
    'Participant ID',
    'Session ID',
    'A/B Variant',
    'Device Type',
    'Browser Name',
    'Operating System',
    'Screen Resolution',
    'Viewport Size',
    'Event Name',
    'Page Path',
    'Event Data'
  ]

  const csvRows = [headers.join(',')]

  for (const ev of events) {
    const row = [
      escapeCSV(ev.id),
      escapeCSV(ev.timestamp),
      escapeCSV(ev.relativeTimeMs),
      escapeCSV(ev.participantId),
      escapeCSV(ev.sessionId),
      escapeCSV(ev.variantId),
      escapeCSV(ev.deviceType),
      escapeCSV(ev.browserName),
      escapeCSV(ev.operatingSystem),
      escapeCSV(ev.screenResolution),
      escapeCSV(ev.viewportSize),
      escapeCSV(ev.eventName),
      escapeCSV(ev.path),
      escapeCSV(ev.eventData)
    ]
    csvRows.push(row.join(','))
  }

  const csvContent = csvRows.join('\n')
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  
  const a = document.createElement('a')
  a.href = url
  a.download = `usability_analytics_export_${Date.now()}.csv`
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)
}
