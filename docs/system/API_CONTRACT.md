# API Contract (Single Source of Truth)

本ドキュメントは、バックエンドとフロントエンドが共有する唯一の「通信規約」です。

## [Role Requirement]
- **Role**: `role-engineer` (定義), `role-ux-designer` (参照)
- **Scope**: 全てのAPIリクエスト/レスポンス
- **Forbidden**: この仕様に基づかない独自のJSON構造をフロントエンドへ送ること。

---

## 1. 共通レスポンス構造
```json
{
  "status": "success",
  "data": {},
  "message": null
}
```

## 2. 護石データ型 (Talisman Schema)
Pydanticモデル定義のベースとなる共通構造。
- `capture_id`: string (UUID)
- `rarity`: int (1-12)
- `slots`: list[int] (例: [3, 2, 1])
- `skills`: list[object]
    - `name`: string
    - `level`: int
    - `confidence`: float (0.0-1.0)
- `confidence`: float (0.0-1.0)
- `validation_status`: string ("valid", "needs_selection", "error")

## 3. 主要エンドポイント
- **POST /api/v1/analyze/video**: 動画解析タスクの登録（`multipart/form-data` 形式）。
- **GET /api/v1/analyze/status/{job_id}**: 進捗取得。
- **GET /api/v1/vision/preview**: 解析範囲（ROI）のプレビュー画像（WebP）取得。
- **GET /api/v1/talismans**: 解析済み護石一覧の取得。
- **PATCH /api/v1/talismans/{id}**: 手動修正の保存。

---

## 4. エンドポイント詳細

### GET /api/v1/vision/preview
指定されたROI設定に基づき、動画フレームの切り抜き画像を返却します。

- **Parameters (Query)**:
  - `job_id`: string (Required)
  - `x`: int (Required) - ROI X座標
  - `y`: int (Required) - ROI Y座標
  - `w`: int (Required) - ROI 幅
  - `h`: int (Required) - ROI 高さ
  - `timestamp_ms`: int (Optional, Default: 0) - プレビューに使用する時点
- **Response**: `image/webp` (binary)

### POST /api/v1/analyze/video
動画ファイルをアップロードして解析ジョブを開始します。

- **Request Type**: `multipart/form-data`
- **Parameters**:
  - `video`: File (Required) - 解析対象の動画ファイル (`.mp4`, `.mov`, `.avi`, `.mkv`)
- **Response**: `CommonResponse[AnalysisJobResponse]` (202 Accepted)

---

### PATCH /api/v1/talismans/{id}
護石データの手動修正を保存します。

- **URL Parameters**:
  - `id`: string (Required) - 更新対象の `capture_id`
- **Request Body**: `TalismanUpdate` (Partial update supported)
    - `rarity`: int (Optional)
    - `slots`: list[int] (Optional)
    - `skills`: list[SkillInfo] (Optional)
    - `validation_status`: string (Optional)
- **Response**: `CommonResponse[TalismanOut]` (200 OK)

---

## 5. [Forbidden] 事項
- 型定義の不一致を許容しないこと。バックエンドは必ず `FastAPI` の自動ドキュメント（`/docs`）が本ドキュメントと同期していることを確認すること。
