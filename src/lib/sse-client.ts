import { API_BASE_URL } from './api-client';

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
 * Handles both real SSE connections and mock simulations for Dev mode.
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

    // 開発環境かつ、サーバーが未起動などでエラーになる場合にシミュレーションを行う
    // 本来は MSW でキャッチしたいが、SSE は MSW での扱いに一工夫いるため、
    // 引き続き SSEClient 内部でのシミュレーション機能を温存する。
    if (import.meta.env.DEV && jobId.startsWith('stub-')) {
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
      // 自動的にシミュレーションへフォールバック（プロトタイプ向け）
      if (import.meta.env.DEV) {
        console.warn('[SSEClient] Falling back to stub simulation.');
        this.startStubSimulation(jobId);
      }
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
      if (!this.stubInterval) return;
      
      progress += 5; // 5% every 3 seconds
      
      // Simulate talisman extraction
      if (progress % 15 === 0 && extractedCount < maxItems) {
        extractedCount++;
        const captureId = `stub-cap-${extractedCount}`;
        
        this.notify({ 
          type: 'capture_extracted', 
          data: { capture_id: captureId, timestamp_ms: extractedCount * 1200 } 
        });

        setTimeout(() => {
          if (!this.stubInterval) return;

          // 簡易的なモックデータ（本来は faker 等使うのが良いが、既存ロジックを尊重）
          this.notify({
            type: 'talisman_analyzed',
            data: { 
              capture_id: captureId,
              rarity: { value: 6, confidence: 0.98 },
              slots: { value: [3, 2, 1], confidence: 0.95 },
              skills: [
                { name: 'Attack Boost', level: 3, confidence: 0.99 },
                { name: 'Critical Eye', level: 2, confidence: 0.97 }
              ],
              confidence: 0.96,
              validation_status: 'valid'
            }
          });
        }, 2000);
      }

      this.notify({ type: 'progress', data: { progress: progress / 100 } });

      if (progress >= 100) {
        this.notify({ type: 'job_completed', data: { job_id: jobId } });
        this.disconnect();
      }
    }, 3000);
  }

  subscribe(callback: SSECallback) {
    this.listeners.add(callback);
    return () => this.listeners.delete(callback);
  }

  private notify(event: SSEEvent) {
    this.listeners.forEach(l => l(event));
  }

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
