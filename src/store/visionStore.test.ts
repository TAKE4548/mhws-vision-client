import { useVisionStore } from './visionStore';
import { startAnalysis } from '../api/generated/analyze/analyze';
import { vi, describe, it, expect, beforeEach } from 'vitest';

vi.mock('../api/generated/analyze/analyze', () => ({
  startAnalysis: vi.fn(),
  createAnalysisJob: vi.fn(),
  getJobStatus: vi.fn(),
  cancelAnalysis: vi.fn(),
}));

describe('visionStore analysisConfig', () => {
  beforeEach(() => {
    useVisionStore.getState().reset();
    vi.clearAllMocks();
  });

  it('should have default analysisConfig', () => {
    const state = useVisionStore.getState();
    expect(state.analysisConfig).toEqual({
      scroll_pace_seconds: 0.3,
      stillness_threshold: 0.01,
    });
  });

  it('should update analysisConfig', () => {
    const store = useVisionStore.getState();
    store.updateAnalysisConfig({ scroll_pace_seconds: 0.5 });
    
    expect(useVisionStore.getState().analysisConfig.scroll_pace_seconds).toBe(0.5);
    expect(useVisionStore.getState().analysisConfig.stillness_threshold).toBe(0.01);
  });

  it('should pass analysisConfig to startAnalysis', async () => {
    const store = useVisionStore.getState();
    // Set currentJobId
    useVisionStore.setState({ currentJobId: 'test-job-id' });
    
    store.updateAnalysisConfig({ scroll_pace_seconds: 0.8, stillness_threshold: 0.005 });
    
    await store.startAnalysis('test-profile-id');
    
    expect(startAnalysis).toHaveBeenCalledWith('test-job-id', {
      profile_id: 'test-profile-id',
      analysis_config: {
        scroll_pace_seconds: 0.8,
        stillness_threshold: 0.005,
      }
    });
  });
});
