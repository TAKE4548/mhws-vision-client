# PBI-027: ROI同期グループの細分化 (Design)

## 1. 目的と背景
ROIキャリブレーションの「ITEM ROIS」ステップにおいて、現在は「スロット（アイコン＋レベル）」と「スキル（名称＋レベル）」という大きな単位で同期（等間隔配置）が行われています。
しかし、実際には「スロットのアイコン」と「スロットのレベル枠」は独立して微調整が必要な場合があり、これらが常に連動してしまうと精度の高い設定が困難です。

本設計では、同期グループを4つの独立したカテゴリに細分化し、それぞれのカテゴリ内で3つの要素（ID: 0, 1, 2）が連動するように改善します。

## 2. 変更仕様

### 2-1. 同期グループの再定義
以下の4つのグループを完全に独立させます。

1. **Slot Icons**: `slots[0..2].icon`
2. **Slot Level Borders**: `slots[0..2].level`
3. **Skill Names**: `skills[0..2].name`
4. **Skill Level Borders**: `skills[0..2].level`

各グループにおいて、インデックス `0`（プライマリ）の座標（XまたはY）を変更した際、インデックス `1, 2` が設定された `Gap` を維持して追従します。

### 2-2. ストア状態 (`ROIState`) の変更
`gaps` オブジェクトを拡張し、各グループ専用の Gap を保持します。

```typescript
gaps: {
  slotIconGapX: number;    // Slot Icons 用
  slotLevelGapX: number;   // Slot Level Borders 用
  skillNameGapY: number;   // Skill Names 用
  skillLevelGapY: number;  // Skill Level Borders 用
}
```

### 2-3. 同期ロジック (`syncProfile`) の修正
- 各グループを独立してループし、インデックス0を基準に1と2を配置します。
- スロット系（Icon, Level）は X方向の同期、スキル系（Name, Level）は Y方向の同期を基本とします。
- **重要**: カテゴリ間の連動（例: Icon を動かすと Level も動く）を排除します。

### 2-4. UI (`ROICalibrator.tsx`) の改善
- 「Gap Adjustment」パネルにおいて、現在選択されている `activeTarget` に応じた適切な Gap を表示・編集できるようにします。
- `activeTarget` が `slot_icon` なら `slotIconGapX` を編集、といったマッピングを実装します。

## 3. トレードオフとリスク
- **操作の手間**: 全てが連動していた以前に比べ、各項目を個別に調整する手間は増えますが、その分高い精度が確保されます。
- **後方互換性**: 既存のプロファイルデータ（座標値）自体は API 定義通りであるため影響ありませんが、ストア上の Gap 設定のキー名が変わるため、移行時に初期値がリセットされる可能性があります。

## 4. SSoT 影響範囲
- `docs/ui/features/ROI_CALIBRATOR.md`: 同期仕様の記述を更新。
- `src/store/roiStore.ts`: 状態定義と同期ロジックの変更。
- `src/components/ROICalibrator.tsx`: UIマッピングの変更。
