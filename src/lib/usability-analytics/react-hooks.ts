import { useCallback, useMemo } from 'react'
import { getSessionMetadata } from './session'
import { logEventLocally } from './local-exporter'
import { markThinkAloud } from './think-aloud'
import Clarity from '@microsoft/clarity'

export function useUsabilityTracking() {
  const metadata = useMemo(() => getSessionMetadata(), [])

  // Generic tracking helper
  const trackEvent = useCallback((eventName: string, eventData?: Record<string, any>) => {
    if (typeof window === 'undefined') return

    const currentPath = window.location.pathname

    // 1. Log locally for research exports
    logEventLocally({
      participantId: metadata.participantId,
      sessionId: metadata.sessionId,
      variantId: metadata.variantId,
      deviceType: metadata.deviceType,
      browserName: metadata.browserName,
      operatingSystem: metadata.operatingSystem,
      screenResolution: metadata.screenResolution,
      viewportSize: metadata.viewportSize,
      path: currentPath,
      eventName,
      eventData
    }, metadata.startTime)

    // 2. Log to Microsoft Clarity
    // Send event data as custom tags if present
    if (eventData) {
      Object.entries(eventData).forEach(([key, val]) => {
        Clarity.setTag(`${eventName}_${key}`, String(val))
      })
    }
    Clarity.event(eventName)
  }, [metadata])

  // Mark Think-Aloud verbal comment
  const markThinkAloudNote = useCallback((note: string) => {
    markThinkAloud(note)
  }, [])

  // ─── USE CASE 1: SEARCH EVENT ───
  const trackSearchVisible = useCallback(() => {
    trackEvent('search_visible')
  }, [trackEvent])

  const trackSearchFocus = useCallback(() => {
    trackEvent('search_focus')
  }, [trackEvent])

  const trackSearchInputStarted = useCallback((firstChar: string) => {
    trackEvent('search_input_started', { char: firstChar })
  }, [trackEvent])

  const trackSearchCompleted = useCallback((query: string, resultCount: number) => {
    trackEvent('search_completed', { 
      query_length: query.length, 
      result_count: resultCount,
      has_results: resultCount > 0 ? 'yes' : 'no'
    })
  }, [trackEvent])

  const trackSearchScrollDepth = useCallback((depth: number) => {
    trackEvent('search_scroll_depth', { milestone: depth })
  }, [trackEvent])


  // ─── USE CASE 2: CHECKOUT FLOW ───
  const trackCheckoutButtonVisible = useCallback((location: 'seat_summary' | 'sticky_header') => {
    trackEvent('checkout_button_visible', { location })
  }, [trackEvent])

  const trackCheckoutClicked = useCallback((timeFromSelectionMs: number) => {
    trackEvent('checkout_clicked', { discovery_time_ms: timeFromSelectionMs })
  }, [trackEvent])

  const trackCheckoutCompleted = useCallback((totalAmount: number, itemsCount: number) => {
    trackEvent('checkout_completed', { amount: totalAmount, items: itemsCount })
  }, [trackEvent])

  const trackCheckoutMisclickNavbar = useCallback((elementClicked: string) => {
    trackEvent('checkout_misclick_navbar', { element: elementClicked })
  }, [trackEvent])

  const trackCheckoutMisclickScroll = useCallback((scrollCount: number) => {
    trackEvent('checkout_misclick_scroll', { excess_scrolls: scrollCount })
  }, [trackEvent])

  const trackCheckoutReselectSeat = useCallback((seatId: string) => {
    trackEvent('checkout_reselect_seat', { seat_id: seatId })
  }, [trackEvent])


  // ─── USE CASE 3: EVENT CATEGORY FILTERING ───
  const trackCategoryFilterVisible = useCallback(() => {
    trackEvent('category_filter_visible')
  }, [trackEvent])

  const trackCategorySelected = useCallback((category: string, selectionTimeMs: number) => {
    trackEvent('category_selected', { 
      category, 
      selection_time_ms: selectionTimeMs 
    })
  }, [trackEvent])

  const trackCategoryEventClicked = useCallback((eventTitle: string, stepsCount: number) => {
    trackEvent('category_event_clicked', { 
      event_title: eventTitle, 
      steps_before_click: stepsCount 
    })
  }, [trackEvent])

  const trackCategoryNavigationBack = useCallback(() => {
    trackEvent('category_navigation_back')
  }, [trackEvent])

  const trackCategoryTaskCompleted = useCallback(() => {
    trackEvent('category_task_completed')
  }, [trackEvent])


  // ─── USE CASE 4: SEAT BOOKING ───
  const trackSeatLegendView = useCallback((legendColor: string) => {
    trackEvent('seat_legend_view', { color: legendColor })
  }, [trackEvent])

  const trackSeatSelected = useCallback((seatId: string, seatType: 'Adult' | 'Child' | 'Concession') => {
    trackEvent('seat_selected', { seat_id: seatId, seat_type: seatType })
  }, [trackEvent])

  const trackSeatWrongSelected = useCallback((seatId: string, seatType: string, expectedType: string) => {
    trackEvent('seat_wrong_selected', { 
      seat_id: seatId, 
      selected_type: seatType, 
      expected_type: expectedType 
    })
  }, [trackEvent])

  const trackSeatDeselected = useCallback((seatId: string) => {
    trackEvent('seat_deselected', { seat_id: seatId })
  }, [trackEvent])

  const trackSeatConfirmed = useCallback((seatsCount: number, decisionTimeMs: number) => {
    trackEvent('seat_confirmed', { 
      seats_count: seatsCount, 
      decision_time_ms: decisionTimeMs 
    })
  }, [trackEvent])


  // ─── USE CASE 5: PROFILE UPDATE ───
  const trackProfileAvatarHover = useCallback((durationMs?: number) => {
    trackEvent('profile_avatar_hover', durationMs ? { hover_duration_ms: durationMs } : undefined)
  }, [trackEvent])

  const trackProfileOverlayVisible = useCallback(() => {
    trackEvent('profile_overlay_visible')
  }, [trackEvent])

  const trackProfileUploadStarted = useCallback(() => {
    trackEvent('profile_upload_started')
  }, [trackEvent])

  const trackProfileUploadSuccess = useCallback(() => {
    trackEvent('profile_upload_success')
  }, [trackEvent])

  const trackProfileUploadFailed = useCallback((reason: string) => {
    trackEvent('profile_upload_failed', { error_reason: reason })
  }, [trackEvent])

  const trackProfileUpdated = useCallback((fieldsChanged: string[]) => {
    trackEvent('profile_updated', { fields: fieldsChanged.join(',') })
  }, [trackEvent])

  return {
    participantId: metadata.participantId,
    sessionId: metadata.sessionId,
    variantId: metadata.variantId,
    deviceType: metadata.deviceType,
    browserName: metadata.browserName,
    operatingSystem: metadata.operatingSystem,
    screenResolution: metadata.screenResolution,
    viewportSize: metadata.viewportSize,
    trackEvent,
    markThinkAloudNote,
    
    // UC1
    trackSearchVisible,
    trackSearchFocus,
    trackSearchInputStarted,
    trackSearchCompleted,
    trackSearchScrollDepth,

    // UC2
    trackCheckoutButtonVisible,
    trackCheckoutClicked,
    trackCheckoutCompleted,
    trackCheckoutMisclickNavbar,
    trackCheckoutMisclickScroll,
    trackCheckoutReselectSeat,

    // UC3
    trackCategoryFilterVisible,
    trackCategorySelected,
    trackCategoryEventClicked,
    trackCategoryNavigationBack,
    trackCategoryTaskCompleted,

    // UC4
    trackSeatLegendView,
    trackSeatSelected,
    trackSeatWrongSelected,
    trackSeatDeselected,
    trackSeatConfirmed,

    // UC5
    trackProfileAvatarHover,
    trackProfileOverlayVisible,
    trackProfileUploadStarted,
    trackProfileUploadSuccess,
    trackProfileUploadFailed,
    trackProfileUpdated
  } as const
}
