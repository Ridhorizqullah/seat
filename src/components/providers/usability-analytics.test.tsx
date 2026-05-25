import { renderHook, act } from '@testing-library/react'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { useUsabilityTracking } from '../../lib/usability-analytics/react-hooks'
import { getSessionMetadata, generateParticipantId } from '../../lib/usability-analytics/session'
import Clarity from '@microsoft/clarity'

// Mock the @microsoft/clarity module
vi.mock('@microsoft/clarity', () => ({
  default: {
    init: vi.fn(),
    setTag: vi.fn(),
    event: vi.fn(),
  },
}))

describe('Usability Analytics Core Tests (Clarity Routing)', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    if (typeof window !== 'undefined') {
      localStorage.clear()
      sessionStorage.clear()
    }
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
    it('successfully routes events for Use Case 1: Search Event to Clarity', () => {
      const { result } = renderHook(() => useUsabilityTracking())

      act(() => {
        result.current.trackSearchVisible()
      })
      expect(Clarity.event).toHaveBeenCalledWith('search_visible')

      act(() => {
        result.current.trackSearchFocus()
      })
      expect(Clarity.event).toHaveBeenCalledWith('search_focus')

      act(() => {
        result.current.trackSearchInputStarted('T')
      })
      expect(Clarity.setTag).toHaveBeenCalledWith('search_input_started_char', 'T')
      expect(Clarity.event).toHaveBeenCalledWith('search_input_started')

      act(() => {
        result.current.trackSearchCompleted('The Weeknd', 3)
      })
      expect(Clarity.setTag).toHaveBeenCalledWith('search_completed_query_length', '10')
      expect(Clarity.setTag).toHaveBeenCalledWith('search_completed_result_count', '3')
      expect(Clarity.setTag).toHaveBeenCalledWith('search_completed_has_results', 'yes')
      expect(Clarity.event).toHaveBeenCalledWith('search_completed')

      act(() => {
        result.current.trackSearchScrollDepth(50)
      })
      expect(Clarity.setTag).toHaveBeenCalledWith('search_scroll_depth_milestone', '50')
      expect(Clarity.event).toHaveBeenCalledWith('search_scroll_depth')
    })

    it('successfully routes events for Use Case 2: Checkout Flow to Clarity', () => {
      const { result } = renderHook(() => useUsabilityTracking())

      act(() => {
        result.current.trackCheckoutButtonVisible('sticky_header')
      })
      expect(Clarity.setTag).toHaveBeenCalledWith('checkout_button_visible_location', 'sticky_header')
      expect(Clarity.event).toHaveBeenCalledWith('checkout_button_visible')

      act(() => {
        result.current.trackCheckoutClicked(4500)
      })
      expect(Clarity.setTag).toHaveBeenCalledWith('checkout_clicked_discovery_time_ms', '4500')
      expect(Clarity.event).toHaveBeenCalledWith('checkout_clicked')

      act(() => {
        result.current.trackCheckoutCompleted(150000, 2)
      })
      expect(Clarity.setTag).toHaveBeenCalledWith('checkout_completed_amount', '150000')
      expect(Clarity.event).toHaveBeenCalledWith('checkout_completed')
    })

    it('successfully routes events for Use Case 3: Filtering & Categories to Clarity', () => {
      const { result } = renderHook(() => useUsabilityTracking())

      act(() => {
        result.current.trackCategoryFilterVisible()
      })
      expect(Clarity.event).toHaveBeenCalledWith('category_filter_visible')

      act(() => {
        result.current.trackCategorySelected('Drama', 2500)
      })
      expect(Clarity.setTag).toHaveBeenCalledWith('category_selected_category', 'Drama')
      expect(Clarity.setTag).toHaveBeenCalledWith('category_selected_selection_time_ms', '2500')
      expect(Clarity.event).toHaveBeenCalledWith('category_selected')
    })

    it('successfully routes events for Use Case 4: Seat Selection to Clarity', () => {
      const { result } = renderHook(() => useUsabilityTracking())

      act(() => {
        result.current.trackSeatLegendView('teal')
      })
      expect(Clarity.setTag).toHaveBeenCalledWith('seat_legend_view_color', 'teal')
      expect(Clarity.event).toHaveBeenCalledWith('seat_legend_view')

      act(() => {
        result.current.trackSeatSelected('B-10', 'Adult')
      })
      expect(Clarity.setTag).toHaveBeenCalledWith('seat_selected_seat_id', 'B-10')
      expect(Clarity.setTag).toHaveBeenCalledWith('seat_selected_seat_type', 'Adult')
      expect(Clarity.event).toHaveBeenCalledWith('seat_selected')
    })

    it('successfully routes events for Use Case 5: Profile Updates to Clarity', () => {
      const { result } = renderHook(() => useUsabilityTracking())

      act(() => {
        result.current.trackProfileAvatarHover(1800)
      })
      expect(Clarity.setTag).toHaveBeenCalledWith('profile_avatar_hover_hover_duration_ms', '1800')
      expect(Clarity.event).toHaveBeenCalledWith('profile_avatar_hover')

      act(() => {
        result.current.trackProfileUploadFailed('File size exceeds 2MB')
      })
      expect(Clarity.setTag).toHaveBeenCalledWith('profile_upload_failed_error_reason', 'File size exceeds 2MB')
      expect(Clarity.event).toHaveBeenCalledWith('profile_upload_failed')
    })
  })
})
