export interface ClickCoordinates {
  x: number;
  y: number;
  viewportX: number;
  viewportY: number;
  targetTagName: string;
  targetClassName: string;
  targetId: string;
}

interface ClickRecord {
  timestamp: number;
  x: number;
  y: number;
}

export function initClickDetectors(options: {
  onRageClick: (coords: ClickCoordinates & { clicksCount: number }) => void
  onDeadClick: (coords: ClickCoordinates) => void
}): () => void {
  if (typeof window === 'undefined') return () => {}

  // 1. Rage Click State
  let clickHistory: ClickRecord[] = []
  const RAGE_CLICK_MAX_DELTA_MS = 1500
  const RAGE_CLICK_MIN_COUNT = 5
  const RAGE_CLICK_RADIUS_PX = 100

  // 2. Dead Click State
  let didMutationOccur = false
  let urlAtLastClick = ''
  let activeElementAtLastClick: Element | null = null
  let deadClickTimeout: any = null

  // Mutation observer to detect DOM changes
  const observer = new MutationObserver((mutations) => {
    // Filter out mutations related to our own floating analytics widget or dev overlays
    const isUsabilityWidgetMutation = mutations.every((m) => {
      const target = m.target as HTMLElement
      return target && (
        target.id === 'usability-analytics-widget' || 
        target.closest('#usability-analytics-widget') !== null ||
        target.classList.contains('usability-ignore')
      )
    })

    if (!isUsabilityWidgetMutation) {
      didMutationOccur = true
    }
  })

  // Start observing body mutations
  observer.observe(document.body, {
    childList: true,
    subtree: true,
    attributes: true,
    characterData: true,
  })

  const getInteractiveSelector = (element: HTMLElement | null): boolean => {
    if (!element) return false
    
    // Check elements up to 4 levels of ancestors
    let current: HTMLElement | null = element
    for (let i = 0; i < 4; i++) {
      if (!current) break
      
      const tag = current.tagName.toLowerCase()
      if (tag === 'button' || tag === 'a' || tag === 'input' || tag === 'select' || tag === 'textarea') {
        return true
      }
      if (current.getAttribute('role') === 'button') {
        return true
      }
      if (current.onclick || current.getAttribute('onclick')) {
        return true
      }
      
      // Check for cursor:pointer from computed styles
      try {
        const style = window.getComputedStyle(current)
        if (style.cursor === 'pointer') {
          return true
        }
      } catch (_e) {
        // Safe fallback
      }

      current = current.parentElement
    }
    return false
  }

  const handleGlobalClick = (e: MouseEvent) => {
    const target = e.target as HTMLElement
    if (!target) return

    // Ignore clicks inside our own widget to prevent self-logging
    if (target.id === 'usability-analytics-widget' || target.closest('#usability-analytics-widget')) {
      return
    }

    const timestamp = Date.now()
    const x = e.pageX
    const y = e.pageY
    const viewportX = e.clientX
    const viewportY = e.clientY

    const coords: ClickCoordinates = {
      x,
      y,
      viewportX,
      viewportY,
      targetTagName: target.tagName,
      targetClassName: target.className || '',
      targetId: target.id || '',
    }

    // ─── A. Rage Click Detection ───
    // Filter click history to keep only clicks within the last 1.5s
    clickHistory = clickHistory.filter((c) => timestamp - c.timestamp <= RAGE_CLICK_MAX_DELTA_MS)
    clickHistory.push({ timestamp, x, y })

    if (clickHistory.length >= RAGE_CLICK_MIN_COUNT) {
      // Check if all clicks are within RAGE_CLICK_RADIUS_PX from the first click in our window
      const firstClick = clickHistory[0]
      const isCloseTogether = clickHistory.every((c) => {
        const dx = c.x - firstClick.x
        const dy = c.y - firstClick.y
        return Math.sqrt(dx * dx + dy * dy) <= RAGE_CLICK_RADIUS_PX
      })

      if (isCloseTogether) {
        options.onRageClick({
          ...coords,
          clicksCount: clickHistory.length,
        })
        clickHistory = [] // reset click history to prevent double triggering
      }
    }

    // ─── B. Dead Click Detection Setup ───
    if (deadClickTimeout) {
      clearTimeout(deadClickTimeout)
    }

    // Reset dead click tracking flags
    didMutationOccur = false
    urlAtLastClick = window.location.href
    activeElementAtLastClick = document.activeElement

    // Check if the click occurred on something that *looks* interactive
    const isInteractive = getInteractiveSelector(target)

    deadClickTimeout = setTimeout(() => {
      // Check if there was no mutation, no URL change, and no input focus shift
      const urlChanged = window.location.href !== urlAtLastClick
      const activeElementChanged = document.activeElement !== activeElementAtLastClick
      const focusOnInput = document.activeElement?.tagName.toLowerCase() === 'input' || 
                           document.activeElement?.tagName.toLowerCase() === 'textarea'

      // A dead click is:
      // - No DOM changes occurred (didMutationOccur is false)
      // - No page redirection or URL change happened
      // - No input focus changes happened
      // - Or it's an element that has `cursor: pointer` but did absolutely nothing.
      if (!didMutationOccur && !urlChanged && !activeElementChanged && !focusOnInput) {
        // Trigger dead click if clicked element looked interactive
        if (isInteractive) {
          options.onDeadClick(coords)
        }
      }
    }, 500) // 500ms window to observe responses
  }

  // Bind listener to document
  document.addEventListener('click', handleGlobalClick, { capture: true })

  // Return cleanup function
  return () => {
    document.removeEventListener('click', handleGlobalClick, { capture: true })
    observer.disconnect()
    if (deadClickTimeout) {
      clearTimeout(deadClickTimeout)
    }
  }
}
