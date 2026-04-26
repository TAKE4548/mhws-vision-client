# REQ-034-FE Test Plan: 判定根拠の可視化検証

## 1. 静的検証 (Type Check)
API モデルの更新が正しく行われ、コンパイルエラーが発生しないことを確認する。

```bash
npm run type-check
```
**期待値**: `src/api/generated/model/talismanOut.ts` 等の型定義エラーがないこと。

## 2. 単体検証 (Component Structure)
`WaveformGraph` が正しい SVG 構造を持っているかを `grep` で確認する。

```bash
# ファイルが存在することを確認
ls src/components/vision/WaveformGraph.tsx
# SVG タグと polyline が含まれていることを確認
grep -E "<svg|<polyline" src/components/vision/WaveformGraph.tsx
```
**期待値**: ファイルが存在し、SVG 構成要素が含まれていること。

## 3. 結合検証 (UI DOM Selection)
ブラウザ上でデバッグトグルの動作を確認する（手動または browser subagent）。

- **検証対象**: `src/components/vision/TalismanDetailsModal.tsx`
- **操作手順**:
    1. モーダルを開く。
    2. `[data-testid="debug-toggle"]` ボタンをクリックする。
    3. `[data-testid="debug-crop-image"]` および `[data-testid="waveform-graph"]` が DOM 内に出現することを確認する。
```javascript
// Browser Console Assertion
document.querySelectorAll('[data-testid="debug-crop-image"]').length > 0
```

## 4. E2E 検証 (API Response Mapping)
開発用ツールまたはブラウザコンソールで API レスポンスの紐付けを確認する。

- **検証対象**: `GET /talismans/{capture_id}`
- **確認コマンド**:
```javascript
// Browser Console
const talisman = useVisionStore.getState().talismans.find(t => t.capture_id === "target_id");
console.assert(talisman.slots_debug_data !== undefined, "Debug data should be present");
console.assert(talisman.skills[0].crop_b64 !== undefined, "Skill crop should be present");
```

