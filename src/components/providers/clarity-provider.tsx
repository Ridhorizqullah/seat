'use client'

/**
 * ClarityProvider
 *
 * Injects the Microsoft Clarity tracking script once (on mount) and exposes a
 * strongly-typed `clarity()` helper via React Context so any child component
 * can call it without importing a separate SDK.
 *
 * Why a provider instead of a plain <Script> tag in layout.tsx?
 * • We need to surface the `clarity()` global safely after hydration.
 * • Context avoids prop-drilling through deeply nested page components.
 */

import React, {
  createContext,
  useContext,
  useEffect,
  useCallback,
  type ReactNode,
} from 'react'

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

type ClarityCommand = 'set' | 'identify' | 'consent' | 'event' | 'upgrade'

interface ClarityContextValue {
  /**
   * Call a Clarity command.
   *
   * @example
   * trackClarity('set', 'search_interaction', 'typing')
   * trackClarity('event', 'checkout_clicked')
   */
  trackClarity: (command: ClarityCommand, ...args: unknown[]) => void
}

// ---------------------------------------------------------------------------
// Context
// ---------------------------------------------------------------------------

const ClarityContext = createContext<ClarityContextValue>({
  // No-op default so components can call it before the provider mounts.
  trackClarity: () => undefined,
})

// ---------------------------------------------------------------------------
// Provider
// ---------------------------------------------------------------------------

interface ClarityProviderProps {
  /** Your Clarity project ID (e.g. "wwmn4i2yo8"). Falls back to the env var
   *  NEXT_PUBLIC_CLARITY_PROJECT_ID if the prop is omitted. */
  projectId?: string
  children: ReactNode
}

export function ClarityProvider({ projectId, children }: ClarityProviderProps) {
  const resolvedId =
    projectId ?? process.env.NEXT_PUBLIC_CLARITY_PROJECT_ID ?? ''

  // Inject the Clarity bootstrap snippet once on client mount.
  useEffect(() => {
    if (typeof window === 'undefined' || !resolvedId) return
    // Guard: skip if already loaded
    if (typeof (window as Window & { clarity?: unknown }).clarity === 'function') return

    // Standard Clarity snippet (minified form preserved for integrity).
    ;(function (c: Window, l: Document, a: string, r: string, i: string) {
      const w = c as Window & Record<string, unknown>
      w[a] =
        w[a] ||
        function (...fnArgs: unknown[]) {
          ;((w[a] as { q?: unknown[] }).q = (w[a] as { q?: unknown[] }).q || []).push(fnArgs)
        }
      const t = l.createElement(r) as HTMLScriptElement
      t.async = true
      t.src = 'https://www.clarity.ms/tag/' + i
      const y = l.getElementsByTagName(r)[0]
      y?.parentNode?.insertBefore(t, y)
    })(window, document, 'clarity', 'script', resolvedId)
  }, [resolvedId])

  // Stable wrapper so children never need to touch the global directly.
  const trackClarity = useCallback(
    (command: ClarityCommand, ...args: unknown[]) => {
      if (typeof window === 'undefined') return
      const clarityFn = (window as Window & { clarity?: (...a: unknown[]) => void }).clarity
      if (typeof clarityFn === 'function') {
        clarityFn(command, ...args)
      } else {
        // Queue the call; Clarity will drain it once loaded.
        const w = window as Window & { clarity?: { q?: unknown[][] } }
        w.clarity = w.clarity ?? {}
        w.clarity.q = w.clarity.q ?? []
        w.clarity.q.push([command, ...args])
      }
    },
    [],
  )

  return (
    <ClarityContext.Provider value={{ trackClarity }}>
      {children}
    </ClarityContext.Provider>
  )
}

// ---------------------------------------------------------------------------
// Hook
// ---------------------------------------------------------------------------

/**
 * Returns a stable `trackClarity` function.
 *
 * @example
 * const { trackClarity } = useClarity()
 * trackClarity('set', 'page_section', 'seat_selection')
 */
export function useClarity() {
  return useContext(ClarityContext)
}
