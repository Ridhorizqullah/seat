'use client'

import React, { createContext, useContext, useEffect, useState, type ReactNode } from 'react'
import Clarity from '@microsoft/clarity'
import {
  getSessionMetadata,
  initScrollDepthTracker,
  initClickDetectors,
  initHoverTracker,
  logEventLocally,
  logThinkAloudLocally,
  downloadCSVExport,
  downloadJSONExport,
  clearLocalAnalytics,
  getLocalEvents,
  getLocalThinkAloudMarkers
} from '../../lib/usability-analytics'

interface UsabilityContextType {
  participantId: string
  sessionId: string
  variantId: 'A' | 'B'
  isOpen: boolean
  setIsOpen: (open: boolean) => void
}

const UsabilityContext = createContext<UsabilityContextType | null>(null)

export function useUsabilityAnalyticsContext() {
  const context = useContext(UsabilityContext)
  if (!context) {
    throw new Error('useUsabilityAnalyticsContext must be used within a UsabilityAnalyticsProvider')
  }
  return context
}

interface UsabilityAnalyticsProviderProps {
  children: ReactNode
  projectId?: string
}

export function UsabilityAnalyticsProvider({ children, projectId }: UsabilityAnalyticsProviderProps) {
  const [metadata, setMetadata] = useState<any>(null)
  const [isOpen, setIsOpen] = useState(false) // Floating dashboard open state
  const [eventsCount, setEventsCount] = useState(0)
  const [thinkAloudCount, setThinkAloudCount] = useState(0)
  const [rageClickCount, setRageClickCount] = useState(0)
  const [deadClickCount, setDeadClickCount] = useState(0)
  const [thinkAloudInput, setThinkAloudInput] = useState('')

  const resolvedProjectId = projectId ?? process.env.NEXT_PUBLIC_CLARITY_PROJECT_ID ?? ''

  // Load stats from localStorage
  const refreshStats = () => {
    const events = getLocalEvents()
    const markers = getLocalThinkAloudMarkers()
    setEventsCount(events.length)
    setThinkAloudCount(markers.length)
    setRageClickCount(events.filter((e) => e.eventName === 'rage_click').length)
    setDeadClickCount(events.filter((e) => e.eventName === 'dead_click').length)
  }

  useEffect(() => {
    // Client-side initialization
    const meta = getSessionMetadata()
    setMetadata(meta)

    // 1. Initialize Clarity
    if (resolvedProjectId) {
      Clarity.init(resolvedProjectId)
      // Set session tags for A/B testing dashboard segmenting
      Clarity.setTag('participant_id', meta.participantId)
      Clarity.setTag('session_id', meta.sessionId)
      Clarity.setTag('variant_id', meta.variantId)
      Clarity.setTag('device_type', meta.deviceType)
    }

    // Refresh initial counts
    refreshStats()

    // 2. Setup Scroll Depth Tracker
    const cleanupScroll = initScrollDepthTracker((depth) => {
      // Log scroll milestone
      const currentPath = window.location.pathname
      logEventLocally({
        participantId: meta.participantId,
        sessionId: meta.sessionId,
        variantId: meta.variantId,
        deviceType: meta.deviceType,
        browserName: meta.browserName,
        operatingSystem: meta.operatingSystem,
        screenResolution: meta.screenResolution,
        viewportSize: meta.viewportSize,
        path: currentPath,
        eventName: currentPath === '/events' ? 'search_scroll_depth' : 'scroll_depth_milestone',
        eventData: { milestone: depth }
      }, meta.startTime)

      // Send to Clarity
      Clarity.setTag('max_scroll_depth', `${depth}%`)
      Clarity.event('scroll_depth_hit')
      refreshStats()
    })

    // 3. Setup Click Detectors (Rage / Dead clicks)
    const cleanupClicks = initClickDetectors({
      onRageClick: (coords) => {
        logEventLocally({
          participantId: meta.participantId,
          sessionId: meta.sessionId,
          variantId: meta.variantId,
          deviceType: meta.deviceType,
          browserName: meta.browserName,
          operatingSystem: meta.operatingSystem,
          screenResolution: meta.screenResolution,
          viewportSize: meta.viewportSize,
          path: window.location.pathname,
          eventName: 'rage_click',
          eventData: { ...coords }
        }, meta.startTime)

        Clarity.event('rage_click')
        refreshStats()
      },
      onDeadClick: (coords) => {
        logEventLocally({
          participantId: meta.participantId,
          sessionId: meta.sessionId,
          variantId: meta.variantId,
          deviceType: meta.deviceType,
          browserName: meta.browserName,
          operatingSystem: meta.operatingSystem,
          screenResolution: meta.screenResolution,
          viewportSize: meta.viewportSize,
          path: window.location.pathname,
          eventName: 'dead_click',
          eventData: { ...coords }
        }, meta.startTime)

        Clarity.event('dead_click')
        refreshStats()
      }
    })

    // 4. Setup Hover Tracker
    const cleanupHover = initHoverTracker((label, durationMs) => {
      // Translate elements specifically for target Use Cases
      let eventName = 'element_hover'
      if (label === 'avatar') eventName = 'profile_avatar_hover'
      else if (label === 'search') eventName = 'search_hover'
      else if (label === 'legend') eventName = 'seat_legend_view'

      logEventLocally({
        participantId: meta.participantId,
        sessionId: meta.sessionId,
        variantId: meta.variantId,
        deviceType: meta.deviceType,
        browserName: meta.browserName,
        operatingSystem: meta.operatingSystem,
        screenResolution: meta.screenResolution,
        viewportSize: meta.viewportSize,
        path: window.location.pathname,
        eventName,
        eventData: { element: label, hover_duration_ms: durationMs }
      }, meta.startTime)

      Clarity.setTag(`hover_${label}_ms`, String(durationMs))
      Clarity.event(eventName)
      refreshStats()
    })

    // 5. Hotkey listeners (Ctrl + Shift + U / Ctrl + Shift + T)
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.ctrlKey && e.shiftKey && e.key.toLowerCase() === 'u') {
        e.preventDefault()
        setIsOpen((prev) => !prev)
      }
      if (e.ctrlKey && e.shiftKey && e.key.toLowerCase() === 't') {
        e.preventDefault()
        const note = prompt('Enter think-aloud observation marker:')
        if (note && note.trim()) {
          logThinkAloudLocally(note.trim(), meta.startTime)
          Clarity.setTag('last_think_aloud_note', note)
          Clarity.event('think_aloud_marked')
          refreshStats()
        }
      }
    }

    window.addEventListener('keydown', handleKeyDown)

    return () => {
      cleanupScroll()
      cleanupClicks()
      cleanupHover()
      window.removeEventListener('keydown', handleKeyDown)
    }
  }, [resolvedProjectId])

  const handleAddThinkAloud = (e: React.FormEvent) => {
    e.preventDefault()
    if (!thinkAloudInput.trim() || !metadata) return
    logThinkAloudLocally(thinkAloudInput.trim(), metadata.startTime)
    Clarity.setTag('last_think_aloud_note', thinkAloudInput.trim())
    Clarity.event('think_aloud_marked')
    setThinkAloudInput('')
    refreshStats()
  }

  const handleToggleVariant = () => {
    if (!metadata) return
    const nextVariant = metadata.variantId === 'A' ? 'B' : 'A'
    sessionStorage.setItem('usability_ab_variant', nextVariant)
    window.location.reload()
  }

  const handleClearSession = () => {
    if (confirm('Are you sure you want to clear all local usability logs?')) {
      clearLocalAnalytics()
      refreshStats()
    }
  }

  const contextValue: UsabilityContextType = {
    participantId: metadata?.participantId || 'N/A',
    sessionId: metadata?.sessionId || 'N/A',
    variantId: metadata?.variantId || 'A',
    isOpen,
    setIsOpen
  }

  return (
    <UsabilityContext.Provider value={contextValue}>
      {children}

      {/* Floating Toggle Button */}
      <button
        onClick={() => setIsOpen((prev) => !prev)}
        style={{
          position: 'fixed',
          bottom: '24px',
          right: '24px',
          zIndex: 9999,
          background: 'linear-gradient(135deg, #0f172a 0%, #1e1b4b 100%)',
          color: '#2dd4bf',
          border: '1px solid rgba(45, 212, 191, 0.2)',
          padding: '10px 16px',
          borderRadius: '9999px',
          fontSize: '12px',
          fontWeight: 800,
          letterSpacing: '0.1em',
          textTransform: 'uppercase',
          boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.4), 0 0 15px rgba(45, 212, 191, 0.1)',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
        }}
        className="hover:scale-105 hover:border-teal-400 hover:shadow-teal-500/20 active:scale-95"
      >
        <span style={{ display: 'inline-block', width: '8px', height: '8px', borderRadius: '50%', background: '#2dd4bf', animation: 'pulse 2s infinite' }}></span>
        UX Research Tools
      </button>

      {/* Glassmorphic Side Drawer */}
      {isOpen && metadata && (
        <div
          id="usability-analytics-widget"
          style={{
            position: 'fixed',
            top: '24px',
            right: '24px',
            bottom: '84px',
            width: '380px',
            zIndex: 99999,
            background: 'rgba(15, 23, 42, 0.85)',
            backdropFilter: 'blur(16px)',
            border: '1px solid rgba(255, 255, 255, 0.08)',
            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)',
            borderRadius: '24px',
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden',
            fontFamily: 'system-ui, -apple-system, sans-serif',
            color: '#e2e8f0',
            animation: 'slideIn 0.3s ease-out',
          }}
        >
          {/* Header */}
          <div
            style={{
              padding: '20px 24px',
              borderBottom: '1px solid rgba(255, 255, 255, 0.05)',
              background: 'linear-gradient(to bottom, rgba(30, 27, 75, 0.4), transparent)',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
            }}
          >
            <div>
              <h3 style={{ margin: 0, fontSize: '16px', fontWeight: 800, color: '#f8fafc', letterSpacing: '0.05em' }}>Usability Researcher Panel</h3>
              <p style={{ margin: '2px 0 0 0', fontSize: '11px', color: '#64748b' }}>Academic A/B Testing Analytics Suite</p>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              style={{
                background: 'transparent',
                border: 'none',
                color: '#94a3b8',
                fontSize: '20px',
                cursor: 'pointer',
                padding: '4px',
                lineHeight: 1,
              }}
              className="hover:text-white"
            >
              &times;
            </button>
          </div>

          {/* Body */}
          <div style={{ padding: '24px', flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '20px' }}>
            {/* Metadata Info Cards */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
              <div style={{ background: 'rgba(255, 255, 255, 0.03)', padding: '12px', borderRadius: '16px', border: '1px solid rgba(255, 255, 255, 0.03)' }}>
                <span style={{ display: 'block', fontSize: '10px', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Participant</span>
                <span style={{ fontSize: '14px', fontWeight: 700, color: '#2dd4bf' }}>{metadata.participantId}</span>
              </div>
              <div style={{ background: 'rgba(255, 255, 255, 0.03)', padding: '12px', borderRadius: '16px', border: '1px solid rgba(255, 255, 255, 0.03)' }}>
                <span style={{ display: 'block', fontSize: '10px', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Active Variant</span>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <span style={{ fontSize: '14px', fontWeight: 700, color: '#f43f5e' }}>Variant {metadata.variantId}</span>
                  <button
                    onClick={handleToggleVariant}
                    style={{
                      background: 'rgba(244, 63, 94, 0.1)',
                      border: '1px solid rgba(244, 63, 94, 0.2)',
                      borderRadius: '6px',
                      color: '#f43f5e',
                      fontSize: '9px',
                      padding: '2px 6px',
                      cursor: 'pointer',
                    }}
                    className="hover:bg-rose-500/20"
                  >
                    Swap
                  </button>
                </div>
              </div>
            </div>

            {/* Quick Session Stats */}
            <div style={{ background: 'rgba(255, 255, 255, 0.02)', border: '1px solid rgba(255, 255, 255, 0.04)', borderRadius: '16px', padding: '16px' }}>
              <h4 style={{ margin: '0 0 12px 0', fontSize: '12px', fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Session Analytics Logs</h4>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div style={{ fontSize: '12px' }}>
                  <span style={{ color: '#64748b' }}>Total Logs:</span> <strong style={{ color: '#f8fafc' }}>{eventsCount}</strong>
                </div>
                <div style={{ fontSize: '12px' }}>
                  <span style={{ color: '#64748b' }}>Think-Alouds:</span> <strong style={{ color: '#f8fafc' }}>{thinkAloudCount}</strong>
                </div>
                <div style={{ fontSize: '12px' }}>
                  <span style={{ color: '#e11d48' }}>Rage Clicks:</span> <strong style={{ color: '#f43f5e' }}>{rageClickCount}</strong>
                </div>
                <div style={{ fontSize: '12px' }}>
                  <span style={{ color: '#d97706' }}>Dead Clicks:</span> <strong style={{ color: '#fbbf24' }}>{deadClickCount}</strong>
                </div>
              </div>
            </div>

            {/* Think-Aloud Annotation Form */}
            <form onSubmit={handleAddThinkAloud} style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <label style={{ fontSize: '11px', fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Catatan (Ctrl+Shift+T)</label>
              <div style={{ display: 'flex', gap: '8px' }}>
                <input
                  type="text"
                  placeholder="Record user verbalized issue..."
                  value={thinkAloudInput}
                  onChange={(e) => setThinkAloudInput(e.target.value)}
                  style={{
                    flex: 1,
                    background: 'rgba(0, 0, 0, 0.2)',
                    border: '1px solid rgba(255, 255, 255, 0.08)',
                    borderRadius: '12px',
                    padding: '8px 12px',
                    fontSize: '13px',
                    color: '#f8fafc',
                    outline: 'none',
                  }}
                  className="focus:border-teal-500/50"
                />
                <button
                  type="submit"
                  style={{
                    background: '#2dd4bf',
                    border: 'none',
                    borderRadius: '12px',
                    color: '#0f172a',
                    fontWeight: 700,
                    fontSize: '12px',
                    padding: '0 16px',
                    cursor: 'pointer',
                  }}
                  className="hover:bg-teal-400 active:scale-95"
                >
                  Log
                </button>
              </div>
            </form>

            {/* Data Export / Actions */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginTop: 'auto' }}>
              <span style={{ fontSize: '11px', fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Export & Data Management</span>
              <button
                onClick={downloadCSVExport}
                style={{
                  background: 'linear-gradient(135deg, #10b981 0%, #047857 100%)',
                  border: 'none',
                  borderRadius: '12px',
                  color: '#fff',
                  fontWeight: 700,
                  fontSize: '13px',
                  padding: '12px',
                  cursor: 'pointer',
                  display: 'flex',
                  justifyContent: 'center',
                  alignItems: 'center',
                  gap: '8px',
                }}
                className="hover:brightness-110 active:scale-98"
              >
                📥 Export Usability Logs (CSV)
              </button>
              <button
                onClick={downloadJSONExport}
                style={{
                  background: 'rgba(255, 255, 255, 0.05)',
                  border: '1px solid rgba(255, 255, 255, 0.08)',
                  borderRadius: '12px',
                  color: '#f8fafc',
                  fontWeight: 700,
                  fontSize: '13px',
                  padding: '12px',
                  cursor: 'pointer',
                  display: 'flex',
                  justifyContent: 'center',
                  alignItems: 'center',
                  gap: '8px',
                }}
                className="hover:bg-white/10 active:scale-98"
              >
                📥 Export Usability Logs (JSON)
              </button>
              <button
                onClick={handleClearSession}
                style={{
                  background: 'transparent',
                  border: '1px dashed rgba(244, 63, 94, 0.3)',
                  borderRadius: '12px',
                  color: '#f43f5e',
                  fontWeight: 600,
                  fontSize: '12px',
                  padding: '10px',
                  cursor: 'pointer',
                  marginTop: '6px',
                }}
                className="hover:bg-rose-500/10"
              >
                🗑️ Reset Local Logs Cache
              </button>
            </div>
          </div>
        </div>
      )}
    </UsabilityContext.Provider>
  )
}
