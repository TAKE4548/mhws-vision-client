# 設計書: REQ-029 解析済み護石のキャプチャ画像表示機能の復旧

## 1. 目的
解析後の護石カードおよび詳細モーダルにおいて、キャプチャ画像（クロップ画像）が正しく表示されるようにし、ユーザーが解析精度を確認できるようにする。

## 2. 変更の概要

### 2.1 バックエンド (mhws-vision-server)
- **保存先パスの修正**: `src/services/vision_adapter.py` における `save_path` をプロジェクトルートの `assets/crops/` に変更。
- **DBモデルの拡張**: `TalismanModel` に `image_url` カラムを追加。
- **タスク実行時の保存**: `run_analysis_task` 内で、解析結果の `image_url` をDBに保存するように修正。

### 2.2 フロントエンド (mhws-vision-client)
- **画像URL解決ロジックの統一**: `AnalysisMonitor.tsx` および `TalismanDetailsModal.tsx` において、`image_url` が相対パスでも絶対パスでも正しく `API_HOST` と結合されるようにユーティリティ化。
- **リトライ処理の強化**: 画像が生成されるまでわずかに時間がかかるケースを考慮し、既存の `onError` によるリトライロジックを維持・洗練。

## 3. API 仕様 (更新なし)
既存の `/talismans` および SSE イベント `talisman_analyzed` に含まれる `image_url` フィールドをそのまま利用する。

## 4. 影響範囲
- バックエンド: `VisionService`, `TalismanModel`, `run_analysis_task`
- フロントエンド: `AnalysisMonitor`, `TalismanDetailsModal`, `visionStore`
