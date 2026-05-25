export interface UsabilityEvent {
  id: string;
  timestamp: string;
  relativeTimeMs: number;
  participantId: string;
  sessionId: string;
  variantId: 'A' | 'B';
  deviceType: 'Desktop' | 'Tablet' | 'Mobile';
  browserName: string;
  operatingSystem: string;
  screenResolution: string;
  viewportSize: string;
  eventName: string;
  eventData?: Record<string, any>;
  path: string;
}

export interface ThinkAloudMarker {
  id: string;
  timestamp: string;
  relativeTimeMs: number;
  note: string;
}

export interface UsabilitySessionMetadata {
  participantId: string;
  sessionId: string;
  variantId: 'A' | 'B';
  deviceType: 'Desktop' | 'Tablet' | 'Mobile';
  browserName: string;
  operatingSystem: string;
  screenResolution: string;
  viewportSize: string;
  startTime: number; // Date.now() timestamp when session started
}
