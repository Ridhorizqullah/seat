import React from 'react'
import { render, renderHook, act } from '@testing-library/react'
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { ClarityProvider } from './clarity-provider'
import { useClarityTracking, useTaskTimer } from './use-clarity-tracking'

// Create spy functions for Clarity methods
const mockInit = vi.fn()
const mockSetTag = vi.fn()
const mockEvent = vi.fn()

// Mock the @microsoft/clarity module
vi.mock('@microsoft/clarity', () => ({
  default: {
    init: (...args: any[]) => mockInit(...args),
    setTag: (...args: any[]) => mockSetTag(...args),
    event: (...args: any[]) => mockEvent(...args),
  },
}))

describe('Clarity Integration tests', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.stubEnv('NEXT_PUBLIC_CLARITY_PROJECT_ID', 'env-project-id')
    // Mock performance.now to return deterministic values
    vi.stubGlobal('performance', {
      now: vi.fn().mockReturnValue(0),
    })
  })

  afterEach(() => {
    vi.unstubAllEnvs()
    vi.unstubAllGlobals()
  })

  describe('ClarityProvider', () => {
    it('initializes Clarity with prop project ID', () => {
      render(
        <ClarityProvider projectId="custom-id">
          <div>Test Children</div>
        </ClarityProvider>
      )

      expect(mockInit).toHaveBeenCalledWith('custom-id')
    })

    it('initializes Clarity with environment variable if prop is omitted', () => {
      render(
        <ClarityProvider>
          <div>Test Children</div>
        </ClarityProvider>
      )

      expect(mockInit).toHaveBeenCalledWith('env-project-id')
    })

    it('does not initialize Clarity if no project ID is provided', () => {
      vi.stubEnv('NEXT_PUBLIC_CLARITY_PROJECT_ID', '')
      render(
        <ClarityProvider>
          <div>Test Children</div>
        </ClarityProvider>
      )

      expect(mockInit).not.toHaveBeenCalled()
    })
  })

  describe('useClarityTracking', () => {
    // ── UC1: Event Search ────────────────────────────────────────────────────
    it('tracks event search actions', () => {
      const { result } = renderHook(() => useClarityTracking())

      act(() => {
        result.current.searchFocused()
      })
      expect(mockSetTag).toHaveBeenCalledWith('search_interaction', 'focused')
      expect(mockEvent).toHaveBeenCalledWith('search_focused')

      act(() => {
        result.current.searchTyping('react')
      })
      expect(mockSetTag).toHaveBeenCalledWith('search_interaction', 'typing')
      expect(mockSetTag).toHaveBeenCalledWith('search_query_length', '5')
      expect(mockEvent).toHaveBeenCalledWith('search_typing')

      // Second typing call should not trigger another event (ref debouncing)
      act(() => {
        result.current.searchTyping('react native')
      })
      expect(mockSetTag).toHaveBeenCalledWith('search_query_length', '12')
      expect(mockEvent).toHaveBeenCalledTimes(2) // 1 search_focused + 1 search_typing

      act(() => {
        result.current.searchCleared()
      })
      expect(mockSetTag).toHaveBeenCalledWith('search_interaction', 'cleared')
      expect(mockEvent).toHaveBeenCalledWith('search_cleared')

      act(() => {
        result.current.searchResultsShown(10)
      })
      expect(mockSetTag).toHaveBeenCalledWith('search_result_count', '10')
      expect(mockSetTag).toHaveBeenCalledWith('search_has_results', 'yes')
      expect(mockEvent).toHaveBeenCalledWith('search_results_shown')
    })

    // ── UC2: Checkout ────────────────────────────────────────────────────────
    it('tracks checkout actions', () => {
      const { result } = renderHook(() => useClarityTracking())

      act(() => {
        result.current.checkoutVisible('seat_summary')
      })
      expect(mockSetTag).toHaveBeenCalledWith('checkout_button_location', 'seat_summary')

      act(() => {
        result.current.checkoutClicked('sticky_header')
      })
      expect(mockSetTag).toHaveBeenCalledWith('checkout', 'success')
      expect(mockSetTag).toHaveBeenCalledWith('checkout_location', 'sticky_header')
      expect(mockEvent).toHaveBeenCalledWith('checkout_clicked')

      act(() => {
        result.current.checkoutAbandoned()
      })
      expect(mockSetTag).toHaveBeenCalledWith('checkout', 'abandoned')
      expect(mockEvent).toHaveBeenCalledWith('checkout_abandoned')
    })

    // ── UC3: Category / Filter ───────────────────────────────────────────────
    it('tracks category/filter actions', () => {
      const { result } = renderHook(() => useClarityTracking())

      act(() => {
        result.current.categorySelected('Music', 'sidebar')
      })
      expect(mockSetTag).toHaveBeenCalledWith('filter_used', 'Music')
      expect(mockSetTag).toHaveBeenCalledWith('filter_layout', 'sidebar')
      expect(mockEvent).toHaveBeenCalledWith('category_filter_clicked')

      act(() => {
        result.current.categoryCleared()
      })
      expect(mockSetTag).toHaveBeenCalledWith('filter_used', 'All')
      expect(mockEvent).toHaveBeenCalledWith('category_filter_cleared')
    })

    // ── UC4: Seat Booking ────────────────────────────────────────────────────
    it('tracks seat booking actions', () => {
      const { result } = renderHook(() => useClarityTracking())

      act(() => {
        result.current.seatPageLoaded('clear')
      })
      expect(mockSetTag).toHaveBeenCalledWith('seat_color_variant', 'clear')
      expect(mockSetTag).toHaveBeenCalledWith('page_section', 'seat_selection')

      act(() => {
        result.current.seatClicked('A5', 'VIP', 'select')
      })
      expect(mockSetTag).toHaveBeenCalledWith('seat_last_clicked', 'A5')
      expect(mockSetTag).toHaveBeenCalledWith('seat_type_selected', 'VIP')
      expect(mockSetTag).toHaveBeenCalledWith('seat_action', 'select')
      expect(mockEvent).toHaveBeenCalledWith('seat_select')

      act(() => {
        result.current.legendReferenced()
      })
      expect(mockSetTag).toHaveBeenCalledWith('legend_referenced', 'yes')
      expect(mockEvent).toHaveBeenCalledWith('legend_referenced')

      act(() => {
        result.current.seatSelectionCompleted(3)
      })
      expect(mockSetTag).toHaveBeenCalledWith('seats_selected_count', '3')
      expect(mockEvent).toHaveBeenCalledWith('seat_selection_completed')
    })

    // ── UC5: Profile Update ──────────────────────────────────────────────────
    it('tracks profile update actions', () => {
      const { result } = renderHook(() => useClarityTracking())

      act(() => {
        result.current.avatarHovered()
      })
      expect(mockSetTag).toHaveBeenCalledWith('avatar_hover', 'yes')
      expect(mockEvent).toHaveBeenCalledWith('avatar_hovered')

      act(() => {
        result.current.photoUploadTriggered('hover_overlay')
      })
      expect(mockSetTag).toHaveBeenCalledWith('photo_upload_method', 'hover_overlay')
      expect(mockEvent).toHaveBeenCalledWith('photo_upload_triggered')

      act(() => {
        result.current.photoUploadSuccess()
      })
      expect(mockSetTag).toHaveBeenCalledWith('photo_upload_status', 'success')
      expect(mockEvent).toHaveBeenCalledWith('photo_upload_success')

      act(() => {
        result.current.photoUploadFailed('Network Error')
      })
      expect(mockSetTag).toHaveBeenCalledWith('photo_upload_status', 'failed')
      expect(mockSetTag).toHaveBeenCalledWith('photo_upload_fail_reason', 'Network Error')
      expect(mockEvent).toHaveBeenCalledWith('photo_upload_failed')

      act(() => {
        result.current.profileUpdated(['firstName', 'phone'])
      })
      expect(mockSetTag).toHaveBeenCalledWith('profile_fields_updated', 'firstName,phone')
      expect(mockEvent).toHaveBeenCalledWith('profile_updated')
    })

    // ── Shared Helpers ───────────────────────────────────────────────────────
    it('sets A/B test variant and page section', () => {
      const { result } = renderHook(() => useClarityTracking())

      act(() => {
        result.current.setAbVariant('seat_color', 'clear')
      })
      expect(mockSetTag).toHaveBeenCalledWith('ab_test_seat_color', 'clear')

      act(() => {
        result.current.setPageSection('billing')
      })
      expect(mockSetTag).toHaveBeenCalledWith('page_section', 'billing')
    })
  })

  describe('useTaskTimer', () => {
    it('measures time-on-task and records to Clarity', () => {
      let nowTime = 1000
      vi.stubGlobal('performance', {
        now: () => nowTime,
      })

      const { result } = renderHook(() => useTaskTimer('checkout_flow'))

      act(() => {
        result.current.startTimer()
      })

      // Simulate elapsed time (e.g. 5 seconds)
      nowTime = 6000

      let elapsed: number | null = null
      act(() => {
        elapsed = result.current.stopAndRecord()
      })

      expect(elapsed).toBe(5000)
      expect(mockSetTag).toHaveBeenCalledWith('checkout_flow_ms', '5000')
      expect(mockSetTag).toHaveBeenCalledWith('checkout_flow_bucket', '3-10s')
    })

    it('handles different duration buckets correctly', () => {
      let nowTime = 0
      vi.stubGlobal('performance', {
        now: () => nowTime,
      })

      const { result } = renderHook(() => useTaskTimer('some_task'))

      // Bucket <3s
      act(() => {
        result.current.startTimer()
      })
      nowTime = 2000
      act(() => {
        result.current.stopAndRecord()
      })
      expect(mockSetTag).toHaveBeenCalledWith('some_task_bucket', '<3s')

      // Bucket 10-30s
      act(() => {
        result.current.startTimer()
      })
      nowTime = 22000
      act(() => {
        result.current.stopAndRecord()
      })
      expect(mockSetTag).toHaveBeenCalledWith('some_task_bucket', '10-30s')

      // Bucket >30s
      act(() => {
        result.current.startTimer()
      })
      nowTime = 60000
      act(() => {
        result.current.stopAndRecord()
      })
      expect(mockSetTag).toHaveBeenCalledWith('some_task_bucket', '>30s')
    })

    it('records at component unmount if timer was running', () => {
      let nowTime = 1000
      vi.stubGlobal('performance', {
        now: () => nowTime,
      })

      const { result, unmount } = renderHook(() => useTaskTimer('unmounted_task'))

      act(() => {
        result.current.startTimer()
      })

      nowTime = 15000

      unmount()

      expect(mockSetTag).toHaveBeenCalledWith('unmounted_task_ms_at_exit', '14000')
    })
  })
})
