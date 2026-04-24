# 設計書: PBI-REQ-030 動画解析感度調整（スクロールペース連動）

## 1. 目的
動画解析における護石の抽出タイミング（静止判定）を、ユーザーが指定したスクロールペース（秒）に基づいて調整可能にするUIを実装し、バックエンドAPIに適切なパラメータを渡すことで、解析精度をユーザー自身が最適化できるようにする。

## 2. 変更の概要
### 2.1 フロントエンド (mhws-vision-client)
- **Zustand Store (`visionStore.ts`)**:
  - `analysisConfig` 状態の追加。初期値は `scroll_pace_seconds: 0.3`, `stillness_threshold: 0.01`。
  - `updateAnalysisConfig` アクションの追加。
  - `startAnalysis` アクションにおいて、リクエストボディに `analysis_config` を含めるよう修正。
- **UIコンポーネント (`AnalysisMonitor.tsx`)**:
  - プロファイル選択エリアの下部に「スクロールペース（秒）」の数値入力項目を追加（Simple Mode）。
  - 「Advanced Settings」トグルを追加し、展開時に `stillness_threshold` を直接操作可能にする（Advanced Mode）。
  - スクロールペースと静止しきい値の連動ロジックの実装（AC-4）。
    - ※今回は独立したパラメータとして扱うが、UI上で一方の変更が他方の推奨値に影響を与えるか、あるいは単純に両方のフィールドを同期的に管理する。

## 3. API 仕様
### POST `/analyze/start/{job_id}`
- **Request Body**: `AnalysisStartRequest`
  - `analysis_config`:
    - `scroll_pace_seconds` (number): 解析対象とする最小連続静止時間。
    - `stillness_threshold` (number): 静止判定に使用するフレーム差分しきい値。

## 4. 影響範囲
- `src/store/visionStore.ts` (State & Action)
- `src/components/vision/AnalysisMonitor.tsx` (UI & Interaction)

## 5. トレードオフ・ Disclosure
- **UIの複雑化**: 設定項目が増えるため、デフォルト設定（0.3s）で十分なユーザーに対しては「Advanced」として隠蔽する必要がある。
- **バリデーション**: スクロールペースが極端に短い（例: 0.01s）場合、解析負荷が激増しサーバー側でエラーになる可能性があるが、本タスクではUI側の制限（min 0.1s等）に留める。
