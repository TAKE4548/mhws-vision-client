/**
 * Mock Data for API Stub Mode (REQ-014)
 * Based on openapi.yaml
 */

export const MOCK_TALISMANS = [
  {
    id: 'mock-1',
    rarity: 12,
    skill1_name: '攻撃',
    skill1_level: 3,
    skill2_name: '見切り',
    skill2_level: 2,
    slot1: 4,
    slot2: 1,
    slot3: 1,
    confidence: 0.98,
    image_url: 'https://placehold.jp/24/333333/ffffff/150x150.png?text=Talisman+1',
  },
  {
    id: 'mock-2',
    rarity: 11,
    skill1_name: '弱点特効',
    skill1_level: 2,
    skill2_name: '超会心',
    skill2_level: 1,
    slot1: 3,
    slot2: 0,
    slot3: 0,
    confidence: 0.85,
    image_url: 'https://placehold.jp/24/333333/ffffff/150x150.png?text=Talisman+2',
  },
  {
    id: 'mock-3',
    rarity: 10,
    skill1_name: 'ガード性能',
    skill1_level: 5,
    skill2_name: '',
    skill2_level: 0,
    slot1: 2,
    slot2: 2,
    slot3: 0,
    confidence: 0.92,
    image_url: 'https://placehold.jp/24/333333/ffffff/150x150.png?text=Talisman+3',
  },
];

export const MOCK_ANALYSIS_STATUS = {
  job_id: 'mock-job-id',
  status: 'processing',
  progress: 45.5,
  current_frame: 1200,
  total_frames: 3000,
  extracted_count: 5,
  message: 'Stub: Video analysis in progress...',
};

export const MOCK_ANALYSIS_COMPLETED = {
  job_id: 'mock-job-id',
  status: 'completed',
  progress: 100.0,
  current_frame: 3000,
  total_frames: 3000,
  extracted_count: 12,
  message: 'Stub: Analysis finished successfully.',
};

export const MOCK_ROI_PROFILES = [
  {
    profile_id: 'profile-1',
    name: 'Standard 4K (Full)',
    resolution: { width: 3840, height: 2160 },
    parent_window: { x: 2800, y: 400, w: 800, h: 1400 },
    rarity: { x_rel: 20, y_rel: 20, w: 200, h: 50 },
    slots: [
      { id: 0, icon: { x_rel: 30, y_rel: 100, w: 40, h: 40 }, level: { x_rel: 80, y_rel: 100, w: 30, h: 40 } },
      { id: 1, icon: { x_rel: 30, y_rel: 160, w: 40, h: 40 }, level: { x_rel: 80, y_rel: 160, w: 30, h: 40 } },
      { id: 2, icon: { x_rel: 30, y_rel: 220, w: 40, h: 40 }, level: { x_rel: 80, y_rel: 220, w: 30, h: 40 } },
    ],
    skills: [
      { id: 0, name: { x_rel: 150, y_rel: 100, w: 300, h: 50 }, level: { x_rel: 460, y_rel: 100, w: 100, h: 50 } },
      { id: 1, name: { x_rel: 150, y_rel: 220, w: 300, h: 50 }, level: { x_rel: 460, y_rel: 220, w: 100, h: 50 } },
      { id: 2, name: { x_rel: 150, y_rel: 340, w: 300, h: 50 }, level: { x_rel: 460, y_rel: 340, w: 100, h: 50 } },
    ],
    normalization: {
      bg_point: { x_rel: 90, y_rel: 110 },
      frame_point: { x_rel: 95, y_rel: 115 },
    }
  }
];

// Placeholder 4K-ish frame simulation
export const MOCK_VISION_PREVIEW = {
  image: 'data:image/webp;base64,UklGRkAAAABXRUJQVlA4IDQAAADwAQCdASoBAAEAAUAmJaQAA3AA/u8AAA=', // WebP 1x1 placeholder
  regions: [],
};


/**
 * Helper to wrap mock data in CommonResponse format
 */
export const wrapMock = (data: any, status: 'success' | 'error' = 'success', message: string = '') => ({
  status,
  message,
  data,
});
