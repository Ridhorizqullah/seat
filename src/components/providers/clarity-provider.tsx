'use client'

/**
 * ClarityProvider
 *
 * Initializes the Microsoft Clarity tracking script using the official NPM package.
 */

import React, { useEffect, type ReactNode } from 'react'
import Clarity from '@microsoft/clarity'

interface ClarityProviderProps {
  /** Your Clarity project ID (e.g. "wwmn4i2yo8"). Falls back to the env var
   *  NEXT_PUBLIC_CLARITY_PROJECT_ID if the prop is omitted. */
  projectId?: string
  children: ReactNode
}

export function ClarityProvider({ projectId, children }: ClarityProviderProps) {
  const resolvedId =
    projectId ?? process.env.NEXT_PUBLIC_CLARITY_PROJECT_ID ?? ''

  useEffect(() => {
    if (typeof window === 'undefined' || !resolvedId) return
    
    // The NPM package handles avoiding double-initialization internally,
    // but we wrap it in useEffect to ensure it only runs on the client.
    Clarity.init(resolvedId)

    // Global hotkey listener for Catatan (Ctrl+Shift+T)
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.ctrlKey && e.shiftKey && e.key.toLowerCase() === 't') {
        e.preventDefault()
        const note = prompt('Masukkan Catatan (Ctrl+Shift+T):')
        if (note && note.trim()) {
          Clarity.setTag('last_think_aloud_note', note.trim())
          Clarity.event('think_aloud_marked')
        }
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => {
      window.removeEventListener('keydown', handleKeyDown)
    }
  }, [resolvedId])

  return <>{children}</>
}
