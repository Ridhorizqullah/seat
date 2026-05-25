import { logThinkAloudLocally } from './local-exporter'
import { getSessionMetadata } from './session'
import Clarity from '@microsoft/clarity'

export function markThinkAloud(note: string): { id: string; timestamp: string; relativeTimeMs: number; note: string } {
  const metadata = getSessionMetadata()
  const marker = logThinkAloudLocally(note, metadata.startTime)
  
  // Also tag Clarity with the latest think aloud marker note
  if (typeof window !== 'undefined') {
    Clarity.setTag('last_think_aloud_note', note)
    Clarity.event('think_aloud_marked')
  }

  return marker
}
