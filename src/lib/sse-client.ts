import { API_BASE_URL } from './api-client';
import { useUIStore } from '../store/uiStore';
import * as mockData from './mock-data';

/**
 * SSE Event Types (from openapi.yaml)
 */
export type SSEEventType = 
  | 'queued' 
  | 'progress' 
  | 'capture_extracted' 
  | 'talisman_analyzed' 
  | 'analysis_error' 
  | 'job_failed' 
  | 'job_cancelled' 
  | 'job_completed';

export interface SSEEvent {
  type: SSEEventType;
  data: any;
}

type SSECallback = (event: SSEEvent) => void;

/**
 * SSEClient
 * Handles both real SSE connections and mock simulations for Stub mode.
 */
class SSEClient {
  private eventSource: EventSource | null = null;
  private listeners: Set<SSECallback> = new Set();
  private stubInterval: number | null = null;

  /**
   * Connect to the SSE stream or start simulation.
   */
  connect(jobId: string) {
    this.disconnect(); // Ensure previous connections are closed

    const { apiMode } = useUIStore.getState();

    if (apiMode === 'stub') {
      this.startStubSimulation(jobId);
      return;
    }

    // Live mode connection
    const url = `${API_BASE_URL}/analyze/events/${jobId}`;
    this.eventSource = new EventSource(url);

    // Subscribe to all known event types
    const eventTypes: SSEEventType[] = [
      'queued', 'progress', 'capture_extracted', 'talisman_analyzed', 
      'analysis_error', 'job_failed', 'job_cancelled', 'job_completed'
    ];

    eventTypes.forEach(type => {
      this.eventSource?.addEventListener(type, (e: any) => {
        try {
          const data = JSON.parse(e.data);
          console.log(`[SSEClient] Event: ${type}`, data);
          this.notify({ type, data });
        } catch (err) {
          console.error(`[SSEClient] Error parsing ${type} event:`, err);
        }
      });
    });

    this.eventSource.onerror = (err) => {
      console.error('[SSEClient] Connection error:', err);
      // We could add automatic reconnection logic here if needed
    };
  }

  /**
   * Simulate SSE events for development without a backend.
   */
  private startStubSimulation(jobId: string) {
    console.log(`[SSEClient Stub] Starting simulation for Job: ${jobId}`);
    let progress = 0;
    let extractedCount = 0;
    const maxItems = 8;

    this.notify({ type: 'queued', data: { message: 'Job queued in stub mode' } });

    this.stubInterval = window.setInterval(() => {
      progress += 5; // 5% every 3 seconds
      
      // Simulate talisman extraction ogni certain interval
      if (progress % 15 === 0 && extractedCount < maxItems) {
        extractedCount++;
        const captureId = `stub-cap-${extractedCount}`;
        
        // Step 1: Notify that a frame was extracted (added to list as "processing")
        this.notify({ 
          type: 'capture_extracted', 
          data: { capture_id: captureId, timestamp_ms: extractedCount * 1200 } 
        });

        // Step 2: Simulate OCR and analysis delay
        setTimeout(() => {
          if (!this.stubInterval) return; // Don't notify if disconnected

          // Alternate between success and occasional error
          if (extractedCount === 4) {
             this.notify({
              type: 'analysis_error',
              data: { capture_id: captureId, message: 'Image too blurry for OCR verification.' }
            });
          } else {
            const mockTalisman = mockData.MOCK_TALISMANS[extractedCount % mockData.MOCK_TALISMANS.length];
            this.notify({
              type: 'talisman_analyzed',
              data: { ...mockTalisman, capture_id: captureId }
            });
          }
        }, 2000);
      }

      this.notify({ type: 'progress', data: { progress: progress / 100 } });

      if (progress >= 100) {
        this.notify({ type: 'job_completed', data: { job_id: jobId } });
        this.disconnect();
      }
    }, 3000);
  }

  /**
   * Subscribe to event stream. Returns an unsubscribe function.
   */
  subscribe(callback: SSECallback) {
    this.listeners.add(callback);
    return () => this.listeners.delete(callback);
  }

  private notify(event: SSEEvent) {
    this.listeners.forEach(l => l(event));
  }

  /**
   * Close connection and stop simulations.
   */
  disconnect() {
    if (this.eventSource) {
      console.log('[SSEClient] Closing EventSource connection.');
      this.eventSource.close();
      this.eventSource = null;
    }
    if (this.stubInterval) {
      console.log('[SSEClient Stub] Stopping simulation.');
      window.clearInterval(this.stubInterval);
      this.stubInterval = null;
    }
  }
}

export const sseClient = new SSEClient();
