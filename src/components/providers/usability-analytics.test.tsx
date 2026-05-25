import { renderHook, act } from '@testing-library/react'
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { useUsabilityTracking } from '../../lib/usability-analytics/react-hooks'
import { getSessionMetadata, generateParticipantId } from '../../lib/usability-analytics/session'
import { getLocalEvents, clearLocalAnalytics } from '../../lib/usability-analytics/local-exporter'

// Mock the @microsoft/clarity module
vi.mock('@microsoft/clarity', () => ({
  default: {
    init: vi.fn(),
    setTag: vi.fn(),
    event: vi.fn(),
  },
}))

describe('Usability Analytics Core Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    if (typeof window !== 'undefined') {
      localStorage.clear()
      sessionStorage.clear()
    }
  })

  afterEach(() => {
    clearLocalAnalytics()
  })

  describe('Session Metadata', () => {
    it('generates a valid participant ID matching the pattern P-XXXX', () => {
      const id = generateParticipantId()
      expect(id).toMatch(/^P-[A-Z0-9]{4}$/)
    })

    it('initializes and caches session metadata consistently', () => {
      const meta1 = getSessionMetadata()
      const meta2 = getSessionMetadata()
      
      expect(meta1.participantId).toBe(meta2.participantId)
      expect(meta1.sessionId).toBe(meta2.sessionId)
      expect(meta1.variantId).toBe(meta2.variantId)
    })
  })

  describe('useUsabilityTracking Hook', () => {
    it('successfully logs events for Use Case 1: Search Event', () => {
      const { result } = renderHook(() => useUsabilityTracking())

      act(() => {
        result.current.trackSearchVisible()
      })
      let events = getLocalEvents()
      expect(events[events.length - 1].eventName).toBe('search_visible')

      act(() => {
        result.current.trackSearchFocus()
      })
      events = getLocalEvents()
      expect(events[events.length - 1].eventName).toBe('search_focus')

      act(() => {
        result.current.trackSearchInputStarted('T')
      })
      events = getLocalEvents()
      expect(events[events.length - 1].eventName).toBe('search_input_started')
      expect(events[events.length - 1].eventData?.char).toBe('T')

      act(() => {
        result.current.trackSearchCompleted('The Weeknd', 3)
      })
      events = getLocalEvents()
      expect(events[events.length - 1].eventName).toBe('search_completed')
      expect(events[events.length - 1].eventData?.query_length).toBe(10)
      expect(events[events.length - 1].eventData?.result_count).toBe(3)
      expect(events[events.length - 1].eventData?.has_results).toBe('yes')

      act(() => {
        result.current.trackSearchScrollDepth(50)
      })
      events = getLocalEvents()
      expect(events[events.length - 1].eventName).toBe('search_scroll_depth')
      expect(events[events.length - 1].eventData?.milestone).toBe(50)
    })

    it('successfully logs events for Use Case 2: Checkout Flow', () => {
      const { result } = renderHook(() => useUsabilityTracking())

      act(() => {
        result.current.trackCheckoutButtonVisible('sticky_header')
      })
      let events = getLocalEvents()
      expect(events[events.length - 1].eventName).toBe('checkout_button_visible')
      expect(events[events.length - 1].eventData?.location).toBe('sticky_header')

      act(() => {
        result.current.trackCheckoutClicked(4500)
      })
      events = getLocalEvents()
      expect(events[events.length - 1].eventName).toBe('checkout_clicked')
      expect(events[events.length - 1].eventData?.discovery_time_ms).toBe(4500)

      act(() => {
        result.current.trackCheckoutCompleted(150000, 2)
      })
      events = getLocalEvents()
      expect(events[events.length - 1].eventName).toBe('checkout_completed')
      expect(events[events.length - 1].eventData?.amount).toBe(150000)

      act(() => {
        result.current.trackCheckoutMisclickNavbar('home_link')
      })
      events = getLocalEvents()
      expect(events[events.length - 1].eventName).toBe('checkout_misclick_navbar')
      expect(events[events.length - 1].eventData?.element).toBe('home_link')

      act(() => {
        result.current.trackCheckoutMisclickScroll(4)
      })
      events = getLocalEvents()
      expect(events[events.length - 1].eventName).toBe('checkout_misclick_scroll')
      expect(events[events.length - 1].eventData?.excess_scrolls).toBe(4)

      act(() => {
        result.current.trackCheckoutReselectSeat('A-3')
      })
      events = getLocalEvents()
      expect(events[events.length - 1].eventName).toBe('checkout_reselect_seat')
      expect(events[events.length - 1].eventData?.seat_id).toBe('A-3')
    })

    it('successfully logs events for Use Case 3: Filtering & Categories', () => {
      const { result } = renderHook(() => useUsabilityTracking())

      act(() => {
        result.current.trackCategoryFilterVisible()
      })
      let events = getLocalEvents()
      expect(events[events.length - 1].eventName).toBe('category_filter_visible')

      act(() => {
        result.current.trackCategorySelected('Drama', 2500)
      })
      events = getLocalEvents()
      expect(events[events.length - 1].eventName).toBe('category_selected')
      expect(events[events.length - 1].eventData?.category).toBe('Drama')
      expect(events[events.length - 1].eventData?.selection_time_ms).toBe(2500)
    })

    it('successfully logs events for Use Case 4: Seat Selection', () => {
      const { result } = renderHook(() => useUsabilityTracking())

      act(() => {
        result.current.trackSeatLegendView('teal')
      })
      let events = getLocalEvents()
      expect(events[events.length - 1].eventName).toBe('seat_legend_view')
      expect(events[events.length - 1].eventData?.color).toBe('teal')

      act(() => {
        result.current.trackSeatSelected('B-10', 'Adult')
      })
      events = getLocalEvents()
      expect(events[events.length - 1].eventName).toBe('seat_selected')
      expect(events[events.length - 1].eventData?.seat_id).toBe('B-10')
      expect(events[events.length - 1].eventData?.seat_type).toBe('Adult')

      act(() => {
        result.current.trackSeatWrongSelected('C-4', 'Child', 'Adult')
      })
      events = getLocalEvents()
      expect(events[events.length - 1].eventName).toBe('seat_wrong_selected')
      expect(events[events.length - 1].eventData?.seat_id).toBe('C-4')
      expect(events[events.length - 1].eventData?.selected_type).toBe('Child')
      expect(events[events.length - 1].eventData?.expected_type).toBe('Adult')
    })

    it('successfully logs events for Use Case 5: Profile Updates', () => {
      const { result } = renderHook(() => useUsabilityTracking())

      act(() => {
        result.current.trackProfileAvatarHover(1800)
      })
      let events = getLocalEvents()
      expect(events[events.length - 1].eventName).toBe('profile_avatar_hover')
      expect(events[events.length - 1].eventData?.hover_duration_ms).toBe(1800)

      act(() => {
        result.current.trackProfileUploadFailed('File size exceeds 2MB')
      })
      events = getLocalEvents()
      expect(events[events.length - 1].eventName).toBe('profile_upload_failed')
      expect(events[events.length - 1].eventData?.error_reason).toBe('File size exceeds 2MB')
    })
  })
})
