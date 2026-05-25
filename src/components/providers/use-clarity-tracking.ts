'use client'

/**
 * useClarityTracking — per-use-case tracking hooks
 *
 * Provides a collection of typed helper functions that map directly to the
 * five UX test use cases described in the Clarity mapping document.
 * 
 * Updated to use the official @microsoft/clarity NPM package.
 */

import { useEffect, useRef, useCallback } from 'react'
import Clarity from '@microsoft/clarity'

// ---------------------------------------------------------------------------
// Shared helpers
// ---------------------------------------------------------------------------

function nowMs() {
  return typeof performance !== 'undefined' ? performance.now() : Date.now()
}

// ---------------------------------------------------------------------------
// Main hook
// ---------------------------------------------------------------------------

export function useClarityTracking() {

  // ── UC1: Event Search ──────────────────────────────────────────────────────

  const searchFocused = useCallback(() => {
    if (typeof window !== 'undefined') Clarity.setTag('search_interaction', 'focused')
  }, [])

  const searchTyping = useCallback(
    (query?: string) => {
      if (typeof window !== 'undefined') {
        Clarity.setTag('search_interaction', 'typing')
        if (query && query.length >= 2) {
          Clarity.setTag('search_query_length', String(query.length))
        }
      }
    },
    [],
  )

  const searchCleared = useCallback(() => {
    if (typeof window !== 'undefined') Clarity.setTag('search_interaction', 'cleared')
  }, [])

  const searchResultsShown = useCallback(
    (resultCount: number) => {
      if (typeof window !== 'undefined') {
        Clarity.setTag('search_result_count', String(resultCount))
        Clarity.setTag('search_has_results', resultCount > 0 ? 'yes' : 'no')
      }
    },
    [],
  )

  // ── UC2: Checkout ──────────────────────────────────────────────────────────

  const checkoutVisible = useCallback(
    (location: 'seat_summary' | 'sticky_header') => {
      if (typeof window !== 'undefined') Clarity.setTag('checkout_button_location', location)
    },
    [],
  )

  const checkoutClicked = useCallback(
    (location: 'seat_summary' | 'sticky_header') => {
      if (typeof window !== 'undefined') {
        Clarity.setTag('checkout', 'success')
        Clarity.setTag('checkout_location', location)
        Clarity.event('checkout_clicked')
      }
    },
    [],
  )

  const checkoutAbandoned = useCallback(() => {
    if (typeof window !== 'undefined') {
      Clarity.setTag('checkout', 'abandoned')
      Clarity.event('checkout_abandoned')
    }
  }, [])

  // ── UC3: Category / Filter ─────────────────────────────────────────────────

  const categorySelected = useCallback(
    (category: string, filterType: 'horizontal' | 'sidebar' = 'horizontal') => {
      if (typeof window !== 'undefined') {
        Clarity.setTag('filter_used', category)
        Clarity.setTag('filter_layout', filterType)
        Clarity.event('category_filter_clicked')
      }
    },
    [],
  )

  const categoryCleared = useCallback(() => {
    if (typeof window !== 'undefined') {
      Clarity.setTag('filter_used', 'All')
      Clarity.event('category_filter_cleared')
    }
  }, [])

  // ── UC4: Seat Booking ──────────────────────────────────────────────────────

  const seatPageLoaded = useCallback(
    (colorVariant: 'clear' | 'plain') => {
      if (typeof window !== 'undefined') {
        Clarity.setTag('seat_color_variant', colorVariant)
        Clarity.setTag('page_section', 'seat_selection')
      }
    },
    [],
  )

  const seatClicked = useCallback(
    (seatId: string, seatType: string, action: 'select' | 'deselect') => {
      if (typeof window !== 'undefined') {
        Clarity.setTag('seat_last_clicked', seatId)
        Clarity.setTag('seat_type_selected', seatType)
        Clarity.setTag('seat_action', action)
        Clarity.event(`seat_${action}`)
      }
    },
    [],
  )

  const legendReferenced = useCallback(() => {
    if (typeof window !== 'undefined') {
      Clarity.setTag('legend_referenced', 'yes')
      Clarity.event('legend_referenced')
    }
  }, [])

  const seatSelectionCompleted = useCallback(
    (count: number) => {
      if (typeof window !== 'undefined') {
        Clarity.setTag('seats_selected_count', String(count))
        Clarity.event('seat_selection_completed')
      }
    },
    [],
  )

  // ── UC5: Profile Update ────────────────────────────────────────────────────

  const avatarHovered = useCallback(() => {
    if (typeof window !== 'undefined') {
      Clarity.setTag('avatar_hover', 'yes')
      Clarity.event('avatar_hovered')
    }
  }, [])

  const photoUploadTriggered = useCallback(
    (method: 'hover_overlay' | 'separate_button') => {
      if (typeof window !== 'undefined') {
        Clarity.setTag('photo_upload_method', method)
        Clarity.event('photo_upload_triggered')
      }
    },
    [],
  )

  const photoUploadSuccess = useCallback(() => {
    if (typeof window !== 'undefined') {
      Clarity.setTag('photo_upload_status', 'success')
      Clarity.event('photo_upload_success')
    }
  }, [])

  const photoUploadFailed = useCallback(
    (reason?: string) => {
      if (typeof window !== 'undefined') {
        Clarity.setTag('photo_upload_status', 'failed')
        if (reason) Clarity.setTag('photo_upload_fail_reason', reason)
        Clarity.event('photo_upload_failed')
      }
    },
    [],
  )

  const profileUpdated = useCallback(
    (fieldsChanged: string[]) => {
      if (typeof window !== 'undefined') {
        Clarity.setTag('profile_fields_updated', fieldsChanged.join(','))
        Clarity.event('profile_updated')
      }
    },
    [],
  )

  // ── Timing utilities ───────────────────────────────────────────────────────

  const setAbVariant = useCallback(
    (testName: string, variant: string) => {
      if (typeof window !== 'undefined') Clarity.setTag(`ab_test_${testName}`, variant)
    },
    [],
  )

  const setPageSection = useCallback(
    (section: string) => {
      if (typeof window !== 'undefined') Clarity.setTag('page_section', section)
    },
    [],
  )

  return {
    // UC1 – Search
    searchFocused,
    searchTyping,
    searchCleared,
    searchResultsShown,

    // UC2 – Checkout
    checkoutVisible,
    checkoutClicked,
    checkoutAbandoned,

    // UC3 – Category
    categorySelected,
    categoryCleared,

    // UC4 – Seat Booking
    seatPageLoaded,
    seatClicked,
    legendReferenced,
    seatSelectionCompleted,

    // UC5 – Profile
    avatarHovered,
    photoUploadTriggered,
    photoUploadSuccess,
    photoUploadFailed,
    profileUpdated,

    // Shared helpers
    setAbVariant,
    setPageSection,
  } as const
}

// ---------------------------------------------------------------------------
// Specialised timing hook: measure time-on-task and send to Clarity
// ---------------------------------------------------------------------------

export function useTaskTimer(taskName: string) {
  const startTimeRef = useRef<number | null>(null)

  const startTimer = useCallback(() => {
    startTimeRef.current = nowMs()
  }, [])

  const stopAndRecord = useCallback(() => {
    if (startTimeRef.current === null) return null
    const elapsed = Math.round(nowMs() - startTimeRef.current)
    startTimeRef.current = null
    
    if (typeof window !== 'undefined') {
      Clarity.setTag(`${taskName}_ms`, String(elapsed))
      const bucket =
        elapsed < 3000 ? '<3s'
        : elapsed < 10000 ? '3-10s'
        : elapsed < 30000 ? '10-30s'
        : '>30s'
      Clarity.setTag(`${taskName}_bucket`, bucket)
    }
    return elapsed
  }, [taskName])

  useEffect(() => {
    return () => {
      if (startTimeRef.current !== null && typeof window !== 'undefined') {
        const elapsed = Math.round(nowMs() - startTimeRef.current)
        Clarity.setTag(`${taskName}_ms_at_exit`, String(elapsed))
      }
    }
  }, [taskName])

  return { startTimer, stopAndRecord }
}
