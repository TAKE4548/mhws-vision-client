import { useROIStore } from './roiStore';

describe('roiStore sync logic', () => {
  beforeEach(() => {
    useROIStore.getState().resetProfile();
  });

  it('should have sync enabled by default', () => {
    const state = useROIStore.getState();
    expect(state.isSyncEnabled).toBe(true);
  });

  it('should sync other slots when primary slot icon moves', () => {
    const store = useROIStore.getState();
    const newIconPos = { x_rel: 30, y_rel: 100 };
    
    store.updateRelativeRect('slot_icon', 0, newIconPos);
    
    const updatedProfile = useROIStore.getState().profile;
    const gaps = useROIStore.getState().gaps;
    
    // Slot 0 icon updated
    expect(updatedProfile.slots![0].icon.x_rel).toBe(30);
    expect(updatedProfile.slots![0].icon.y_rel).toBe(100);
    
    // Slot 0 level should follow icon
    expect(updatedProfile.slots![0].level.x_rel).toBe(30 + gaps.levelGapX);
    expect(updatedProfile.slots![0].level.y_rel).toBe(100);
    
    // Slot 1 icon should follow Slot 0 icon + gap (Horizontal)
    expect(updatedProfile.slots![1].icon.x_rel).toBe(30 + gaps.slotGapX);
    expect(updatedProfile.slots![1].icon.y_rel).toBe(100);
    
    // Slot 2 icon should follow Slot 0 icon + 2*gap (Horizontal)
    expect(updatedProfile.slots![2].icon.x_rel).toBe(30 + 2 * gaps.slotGapX);
    expect(updatedProfile.slots![2].icon.y_rel).toBe(100);
  });

  it('should sync other skills when primary skill name moves', () => {
    const store = useROIStore.getState();
    const newNamePos = { x_rel: 40, y_rel: 200 };
    
    store.updateRelativeRect('skill_name', 0, newNamePos);
    
    const updatedProfile = useROIStore.getState().profile;
    const gaps = useROIStore.getState().gaps;
    
    // Skill 0 name updated
    expect(updatedProfile.skills![0].name.x_rel).toBe(40);
    expect(updatedProfile.skills![0].name.y_rel).toBe(200);
    
    // Skill 1 name should follow Skill 0
    expect(updatedProfile.skills![1].name.x_rel).toBe(40);
    expect(updatedProfile.skills![1].name.y_rel).toBe(200 + gaps.skillGapY);
  });

  it('should update positions when gaps are changed while sync is enabled', () => {
    const store = useROIStore.getState();
    const primaryX = store.profile.slots![0].icon.x_rel;
    
    store.updateGaps({ slotGapX: 80 });
    
    const updatedProfile = useROIStore.getState().profile;
    expect(updatedProfile.slots![1].icon.x_rel).toBe(primaryX + 80);
    expect(updatedProfile.slots![2].icon.x_rel).toBe(primaryX + 160);
  });

  it('should not sync when isSyncEnabled is false', () => {
    const store = useROIStore.getState();
    const oldSlot1X = store.profile.slots![1].icon.x_rel;
    store.setSyncEnabled(false);
    
    store.updateRelativeRect('slot_icon', 0, { x_rel: 300 });
    
    const updatedProfile = useROIStore.getState().profile;
    expect(updatedProfile.slots![0].icon.x_rel).toBe(300);
    expect(updatedProfile.slots![1].icon.x_rel).toBe(oldSlot1X); // Should not change
  });

  it('should force sync when syncAllToPrimary is called', () => {
    const store = useROIStore.getState();
    store.setSyncEnabled(false);
    
    // Manually mess up positions
    store.updateRelativeRect('slot_icon', 1, { x_rel: 999 });
    expect(useROIStore.getState().profile.slots![1].icon.x_rel).toBe(999);
    
    // Force sync
    store.syncAllToPrimary();
    
    const profile = useROIStore.getState().profile;
    const primaryX = profile.slots![0].icon.x_rel;
    const gaps = useROIStore.getState().gaps;
    expect(profile.slots![1].icon.x_rel).toBe(primaryX + gaps.slotGapX);
  });
});
