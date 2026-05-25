'use client'

/**
 * useClarityTracking — per-use-case tracking hooks
 *
 * Provides a collection of typed helper functions that map directly to the
 * five UX test use cases described in the Clarity mapping document:
 *
 *   UC1: Event Search   (scroll / search bar visibility)
 *   UC2: Checkout       (rage clicks, dead clicks, discovery time)
 *   UC3: Category       (filter CTR, horizontal vs sidebar)
 *   UC4: Seat Booking   (click patterns, legend references, decision time)
 *   UC5: Profile Update (hover/click on avatar, upload flow)
 *
 * All functions are no-ops when Clarity hasn't loaded yet – the ClarityProvider
 * queues calls and Clarity drains them once the script is ready.
 *
 * Usage:
 *   const tracking = useClarityTracking()
 *   tracking.searchInteraction('typing')
 *   tracking.categorySelected('Music')
 */

import { useEffect, useRef, useCallback } from 'react'
import { useClarity } from './clarity-provider'

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
  const { trackClarity } = useClarity()

  // ── UC1: Event Search ──────────────────────────────────────────────────────

  /**
   * Call when the user focuses on the search input.
   * Clarity will mark the session with 'search_interaction = focused'.
   */
  const searchFocused = useCallback(() => {
    trackClarity('set', 'search_interaction', 'focused')
  }, [trackClarity])

  /**
   * Call on every input change inside the search field.
   * Marks the session with the current query so Clarity segments can filter
   * "sessions where user searched for X".
   */
  const searchTyping = useCallback(
    (query?: string) => {
      trackClarity('set', 'search_interaction', 'typing')
      if (query && query.length >= 2) {
        // Only send once query is meaningful to avoid noise.
        trackClarity('set', 'search_query_length', String(query.length))
      }
    },
    [trackClarity],
  )

  /**
   * Call when the user clears / resets the search field.
   */
  const searchCleared = useCallback(() => {
    trackClarity('set', 'search_interaction', 'cleared')
  }, [trackClarity])

  /**
   * Call when search results are shown (after debounce / submit).
   * Attach the result count so we can segment "zero-result sessions".
   */
  const searchResultsShown = useCallback(
    (resultCount: number) => {
      trackClarity('set', 'search_result_count', String(resultCount))
      trackClarity('set', 'search_has_results', resultCount > 0 ? 'yes' : 'no')
    },
    [trackClarity],
  )

  // ── UC2: Checkout ──────────────────────────────────────────────────────────

  /**
   * Call when the checkout button becomes visible in the seat-summary panel.
   * Marks the AB variant so Clarity can segment replays.
   *
   * @param location 'seat_summary' (Variant B) | 'sticky_header' (Variant A)
   */
  const checkoutVisible = useCallback(
    (location: 'seat_summary' | 'sticky_header') => {
      trackClarity('set', 'checkout_button_location', location)
    },
    [trackClarity],
  )

  /**
   * Call when the user clicks the checkout button.
   * Records both the variant and approximate discovery time.
   */
  const checkoutClicked = useCallback(
    (location: 'seat_summary' | 'sticky_header') => {
      trackClarity('set', 'checkout', 'success')
      trackClarity('set', 'checkout_location', location)
      trackClarity('event', 'checkout_clicked')
    },
    [trackClarity],
  )

  /**
   * Call when the user abandons the checkout page without completing payment.
   */
  const checkoutAbandoned = useCallback(() => {
    trackClarity('set', 'checkout', 'abandoned')
    trackClarity('event', 'checkout_abandoned')
  }, [trackClarity])

  // ── UC3: Category / Filter ─────────────────────────────────────────────────

  /**
   * Call when the user clicks a category filter button.
   * Tracks WHICH category was selected and WHERE the filter was placed.
   *
   * @param category   e.g. 'Music', 'Drama', 'Comedy'
   * @param filterType 'horizontal' (Variant B) | 'sidebar' (Variant A)
   */
  const categorySelected = useCallback(
    (category: string, filterType: 'horizontal' | 'sidebar' = 'horizontal') => {
      trackClarity('set', 'filter_used', category)
      trackClarity('set', 'filter_layout', filterType)
      trackClarity('event', 'category_filter_clicked')
    },
    [trackClarity],
  )

  /**
   * Call when the category filter is cleared / reset to 'All'.
   */
  const categoryCleared = useCallback(() => {
    trackClarity('set', 'filter_used', 'All')
    trackClarity('event', 'category_filter_cleared')
  }, [trackClarity],
  )

  // ── UC4: Seat Booking ──────────────────────────────────────────────────────

  /**
   * Call when the seat-selection page mounts.
   * Sets the AB variant so all subsequent seat interactions are segmented.
   *
   * @param colorVariant 'clear' (Variant B - border/glow) | 'plain' (Variant A)
   */
  const seatPageLoaded = useCallback(
    (colorVariant: 'clear' | 'plain') => {
      trackClarity('set', 'seat_color_variant', colorVariant)
      trackClarity('set', 'page_section', 'seat_selection')
    },
    [trackClarity],
  )

  /**
   * Call every time the user clicks a seat.
   *
   * @param seatId     e.g. 'A5'
   * @param seatType   e.g. 'adult' | 'child' | 'concession'
   * @param action     'select' | 'deselect'
   */
  const seatClicked = useCallback(
    (seatId: string, seatType: string, action: 'select' | 'deselect') => {
      trackClarity('set', 'seat_last_clicked', seatId)
      trackClarity('set', 'seat_type_selected', seatType)
      trackClarity('set', 'seat_action', action)
      trackClarity('event', `seat_${action}`)
    },
    [trackClarity],
  )

  /**
   * Call when the user hovers or clicks the seat-type legend.
   * High frequency here = poor color clarity (Variant A signal).
   */
  const legendReferenced = useCallback(() => {
    trackClarity('set', 'legend_referenced', 'yes')
    trackClarity('event', 'legend_referenced')
  }, [trackClarity])

  /**
   * Call when the seat summary shows the final selection before checkout.
   *
   * @param count Total seats selected
   */
  const seatSelectionCompleted = useCallback(
    (count: number) => {
      trackClarity('set', 'seats_selected_count', String(count))
      trackClarity('event', 'seat_selection_completed')
    },
    [trackClarity],
  )

  // ── UC5: Profile Update ────────────────────────────────────────────────────

  /**
   * Call when the user's cursor enters the avatar / profile photo area.
   * Clarity's mouse-movement map will record hover patterns.
   */
  const avatarHovered = useCallback(() => {
    trackClarity('set', 'avatar_hover', 'yes')
    trackClarity('event', 'avatar_hovered')
  }, [trackClarity])

  /**
   * Call when the user clicks the avatar / upload trigger.
   *
   * @param method 'hover_overlay' (Variant B) | 'separate_button' (Variant A)
   */
  const photoUploadTriggered = useCallback(
    (method: 'hover_overlay' | 'separate_button') => {
      trackClarity('set', 'photo_upload_method', method)
      trackClarity('event', 'photo_upload_triggered')
    },
    [trackClarity],
  )

  /**
   * Call after a successful photo upload completes.
   */
  const photoUploadSuccess = useCallback(() => {
    trackClarity('set', 'photo_upload_status', 'success')
    trackClarity('event', 'photo_upload_success')
  }, [trackClarity])

  /**
   * Call if the photo upload fails (network, size limit, etc.).
   */
  const photoUploadFailed = useCallback(
    (reason?: string) => {
      trackClarity('set', 'photo_upload_status', 'failed')
      if (reason) trackClarity('set', 'photo_upload_fail_reason', reason)
      trackClarity('event', 'photo_upload_failed')
    },
    [trackClarity],
  )

  /**
   * Call when the user updates profile fields (name, email, etc.)
   * and submits the profile form.
   */
  const profileUpdated = useCallback(
    (fieldsChanged: string[]) => {
      trackClarity('set', 'profile_fields_updated', fieldsChanged.join(','))
      trackClarity('event', 'profile_updated')
    },
    [trackClarity],
  )

  // ── Timing utilities ───────────────────────────────────────────────────────

  /**
   * Tags the current session with the variant identifier for any A/B test.
   * Call this once on component mount.
   *
   * @param testName  Short key, e.g. 'checkout_position', 'filter_layout'
   * @param variant   'A' | 'B' (or any short label)
   */
  const setAbVariant = useCallback(
    (testName: string, variant: string) => {
      trackClarity('set', `ab_test_${testName}`, variant)
    },
    [trackClarity],
  )

  /**
   * Tags the current page section for easy session filtering.
   * E.g. 'events_list', 'seat_selection', 'checkout', 'profile'
   */
  const setPageSection = useCallback(
    (section: string) => {
      trackClarity('set', 'page_section', section)
    },
    [trackClarity],
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

/**
 * useTaskTimer — measure how long a user spends on a task.
 *
 * @example
 * const { startTimer, stopAndRecord } = useTaskTimer('checkout_discovery')
 * // On component mount:
 * startTimer()
 * // When user clicks the checkout button:
 * stopAndRecord() // → sends clarity('set', 'checkout_discovery_ms', '4200')
 */
export function useTaskTimer(taskName: string) {
  const { trackClarity } = useClarity()
  const startTimeRef = useRef<number | null>(null)

  const startTimer = useCallback(() => {
    startTimeRef.current = nowMs()
  }, [])

  const stopAndRecord = useCallback(() => {
    if (startTimeRef.current === null) return null
    const elapsed = Math.round(nowMs() - startTimeRef.current)
    startTimeRef.current = null
    trackClarity('set', `${taskName}_ms`, String(elapsed))
    // Bucket into human-readable ranges for heatmap filtering
    const bucket =
      elapsed < 3000 ? '<3s'
      : elapsed < 10000 ? '3-10s'
      : elapsed < 30000 ? '10-30s'
      : '>30s'
    trackClarity('set', `${taskName}_bucket`, bucket)
    return elapsed
  }, [taskName, trackClarity])

  /** Auto-stop and record when component unmounts (e.g. user navigates away). */
  useEffect(() => {
    return () => {
      if (startTimeRef.current !== null) {
        const elapsed = Math.round(nowMs() - startTimeRef.current)
        trackClarity('set', `${taskName}_ms_at_exit`, String(elapsed))
      }
    }
  }, [taskName, trackClarity])

  return { startTimer, stopAndRecord }
}
