import { useROIStore } from './roiStore';

describe('roiStore sync logic', () => {
  beforeEach(() => {
    useROIStore.getState().resetProfile();
  });

  it('should have sync enabled by default', () => {
    const state = useROIStore.getState();
    expect(state.isSyncEnabled).toBe(true);
  });

  it('should sync other slot icons when primary slot icon moves', () => {
    const store = useROIStore.getState();
    const newIconPos = { x_rel: 30, y_rel: 100 };
    
    store.updateRelativeRect('slot_icon', 0, newIconPos);
    
    const updatedProfile = useROIStore.getState().profile;
    const gaps = useROIStore.getState().gaps;
    
    // Slot 0 icon updated
    expect(updatedProfile.slots![0].icon.x_rel).toBe(30);
    expect(updatedProfile.slots![0].icon.y_rel).toBe(100);
    
    // Slot 0 level should NOT follow icon (Decoupled)
    // We check against the original DEFAULT_PROFILE value (70 in DEFAULT_PROFILE)
    expect(updatedProfile.slots![0].level.x_rel).toBe(70);
    
    // Slot 1 icon should follow Slot 0 icon + gap
    expect(updatedProfile.slots![1].icon.x_rel).toBe(30 + gaps.slotIconGapX);
    expect(updatedProfile.slots![1].icon.y_rel).toBe(100);
  });

  it('should sync other slot levels when primary slot level moves', () => {
    const store = useROIStore.getState();
    const newLevelPos = { x_rel: 80, y_rel: 110 };
    
    store.updateRelativeRect('slot_level', 0, newLevelPos);
    
    const updatedProfile = useROIStore.getState().profile;
    const gaps = useROIStore.getState().gaps;
    
    // Slot 0 level updated
    expect(updatedProfile.slots![0].level.x_rel).toBe(80);
    expect(updatedProfile.slots![0].level.y_rel).toBe(110);
    
    // Slot 1 level should follow Slot 0 level + gap
    expect(updatedProfile.slots![1].level.x_rel).toBe(80 + gaps.slotLevelGapX);
    expect(updatedProfile.slots![1].level.y_rel).toBe(110);
  });

  it('should sync other skill names when primary skill name moves', () => {
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
    expect(updatedProfile.skills![1].name.y_rel).toBe(200 + gaps.skillNameGapY);

    // Skill 0 level should NOT follow name y_rel (Decoupled in y, although x remains same as primary level)
    expect(updatedProfile.skills![0].level.y_rel).toBe(250); // Default was 250
  });

  it('should sync other skill levels when primary skill level moves', () => {
    const store = useROIStore.getState();
    const newLevelPos = { x_rel: 240, y_rel: 260 };
    
    store.updateRelativeRect('skill_level', 0, newLevelPos);
    
    const updatedProfile = useROIStore.getState().profile;
    const gaps = useROIStore.getState().gaps;
    
    // Skill 0 level updated
    expect(updatedProfile.skills![0].level.x_rel).toBe(240);
    expect(updatedProfile.skills![0].level.y_rel).toBe(260);
    
    // Skill 1 level should follow Skill 0 level (x remains same, y follows gap)
    expect(updatedProfile.skills![1].level.x_rel).toBe(240);
    expect(updatedProfile.skills![1].level.y_rel).toBe(260 + gaps.skillLevelGapY);
  });

  it('should update positions when different gaps are changed while sync is enabled', () => {
    const store = useROIStore.getState();
    const initialProfile = store.profile;
    
    // Test Slot Icons Gap
    store.updateGaps({ slotIconGapX: 80 });
    expect(useROIStore.getState().profile.slots![1].icon.x_rel).toBe(initialProfile.slots![0].icon.x_rel + 80);
    
    // Test Slot Levels Gap
    store.updateGaps({ slotLevelGapX: 60 });
    expect(useROIStore.getState().profile.slots![1].level.x_rel).toBe(initialProfile.slots![0].level.x_rel + 60);
    
    // Test Skill Names Gap
    store.updateGaps({ skillNameGapY: 70 });
    expect(useROIStore.getState().profile.skills![1].name.y_rel).toBe(initialProfile.skills![0].name.y_rel + 70);
    
    // Test Skill Levels Gap
    store.updateGaps({ skillLevelGapY: 45 });
    expect(useROIStore.getState().profile.skills![1].level.y_rel).toBe(initialProfile.skills![0].level.y_rel + 45);
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
    expect(profile.slots![1].icon.x_rel).toBe(primaryX + gaps.slotIconGapX);
  });
});
