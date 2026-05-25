// Keeps track of already logged milestones per page path to prevent duplicate event spam
const loggedMilestonesByPath: Record<string, Set<number>> = {}

export function initScrollDepthTracker(onScrollDepthHit: (depth: number) => void): () => void {
  if (typeof window === 'undefined') return () => {}

  let activePath = window.location.pathname

  // Initialize milestone set for current path if it doesn't exist
  if (!loggedMilestonesByPath[activePath]) {
    loggedMilestonesByPath[activePath] = new Set<number>()
  }

  const handleScroll = () => {
    // Check if path has changed (SPA routing)
    const currentPath = window.location.pathname
    if (currentPath !== activePath) {
      activePath = currentPath
      if (!loggedMilestonesByPath[activePath]) {
        loggedMilestonesByPath[activePath] = new Set<number>()
      }
    }

    const scrollTop = window.scrollY || document.documentElement.scrollTop
    const scrollHeight = document.documentElement.scrollHeight
    const clientHeight = window.innerHeight || document.documentElement.clientHeight

    // Avoid divide by zero for pages that fit entirely in viewport
    const totalScrollable = scrollHeight - clientHeight
    if (totalScrollable <= 0) return

    const percentage = Math.round((scrollTop / totalScrollable) * 100)
    const milestones = [25, 50, 75, 100]

    for (const milestone of milestones) {
      if (percentage >= milestone && !loggedMilestonesByPath[activePath].has(milestone)) {
        loggedMilestonesByPath[activePath].add(milestone)
        onScrollDepthHit(milestone)
      }
    }
  }

  // Bind listener
  window.addEventListener('scroll', handleScroll, { passive: true })
  
  // Call once initially in case the page is already scrolled or very short
  handleScroll()

  // Return cleanup function
  return () => {
    window.removeEventListener('scroll', handleScroll)
  }
}

// Reset scroll milestones cache (useful when resetting user session)
export function resetScrollDepthCache() {
  for (const key in loggedMilestonesByPath) {
    loggedMilestonesByPath[key].clear()
  }
}
