interface HoverState {
  element: HTMLElement
  label: string
  startTime: number
}

export function initHoverTracker(onHoverComplete: (label: string, durationMs: number) => void): () => void {
  if (typeof window === 'undefined') return () => {}

  let activeHover: HoverState | null = null

  const handleMouseOver = (e: MouseEvent) => {
    const target = e.target as HTMLElement
    const hoverEl = target.closest('[data-track-hover]') as HTMLElement
    
    if (!hoverEl) return

    const label = hoverEl.getAttribute('data-track-hover') || 'unlabelled'
    
    // If we're already hovering this element, do nothing
    if (activeHover && activeHover.element === hoverEl) return

    // If hovering a different element, trigger completion on the previous one first
    if (activeHover && activeHover.element !== hoverEl) {
      triggerHoverComplete()
    }

    activeHover = {
      element: hoverEl,
      label,
      startTime: performance.now(),
    }
  }

  const handleMouseOut = (e: MouseEvent) => {
    if (!activeHover) return

    const relatedTarget = e.relatedTarget as HTMLElement
    
    // Check if we are still hovering within the same element (child nodes)
    if (relatedTarget && activeHover.element.contains(relatedTarget)) {
      return
    }

    triggerHoverComplete()
  }

  const triggerHoverComplete = () => {
    if (!activeHover) return
    
    const durationMs = Math.round(performance.now() - activeHover.startTime)
    const label = activeHover.label
    
    // Filter out micro-hovers (less than 200ms) to reduce noise
    if (durationMs >= 200) {
      onHoverComplete(label, durationMs)
    }

    activeHover = null
  }

  // Bind listeners
  document.addEventListener('mouseover', handleMouseOver, { passive: true })
  document.addEventListener('mouseout', handleMouseOut, { passive: true })

  // Return cleanup function
  return () => {
    document.removeEventListener('mouseover', handleMouseOver)
    document.removeEventListener('mouseout', handleMouseOut)
    triggerHoverComplete() // finalize any active hover on unmount
  }
}
