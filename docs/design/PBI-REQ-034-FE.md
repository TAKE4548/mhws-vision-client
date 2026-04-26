---
id: REQ-034-FE
tags: ["UI", "Visualization"]
related_paths: ["src/components/vision/TalismanDetailsModal.tsx", "src/api/generated/model/talismanOut.ts"]
---
# PBI-REQ-034-FE: 判定根拠（波形・クロップ）の可視化 (Frontend)


## 1. アーキテクチャ設計

### 1.1 API モデルの更新
OpenAPI SSoT (docs/system/openapi.yaml) に基づき、生成されたモデルを手動で更新する。Orval による自動生成が古い可能性があるため、以下のフィールドを追加する。

- `TalismanOut`: `slots_debug_data` を追加。
- `SkillInfo`: `crop_b64`, `lv_crop_b64` を追加。

### 1.2 コンポーネント構成
- `WaveformGraph`: 波形データと閾値を SVG で描画する汎用コンポーネント。
- `TalismanDetailsModal`: 
    - デバッグ情報の表示/非表示を管理するローカルステートを追加。
    - アコーディオン形式でクロップ画像と波形グラフを表示するセクションを追加。

## 2. 実装詳細

### 2.1 WaveformGraph 仕様
- **Props**:
    - `waveform: number[]`: 0.0〜1.0 の正規化された波形データ。
    - `threshold: number`: 0.0〜1.0 の判定閾値。
- **Visual**:
    - 波形: `kinetic-blue` のポリライン。
    - 閾値: `status-error/40` の水平点線。
    - 背景: 透明、または `surface-lowest`。

### 2.2 TalismanDetailsModal 変更点
- 各判定項目（Rarity, Slot, Skill）の下部に「Debug Info」トグルボタンを設置。
- トグル展開時に以下の要素を表示:
    - Skill: 抽出に使用されたクロップ画像 (Base64) を表示。
    - Slot: `WaveformGraph` を表示し、判定の根拠を可視化。

## 3. SSoT 同期
- 本実装完了後、`docs/ui/specs/SPEC.md` に `TalismanDetailsModal` のデバッグ表示仕様を追記する。

## 4. トレードオフ・制限事項
- **Base64 画像**: 通信量増大の懸念はあるが、詳細画面のみの表示であるため許容する。
- **データ破棄**: バックエンド側で古いジョブのデバッグデータは破棄されるため、古い護石を選択した際にデータが取得できない場合がある（その場合は「No debug data available」を表示）。
