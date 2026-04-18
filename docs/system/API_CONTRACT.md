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
- `validation_status`: string ("valid", "needs_selection", "error")

## 3. 主要エンドポイント
- **POST /api/v1/analyze/video**: 動画解析タスクの登録。
- **GET /api/v1/analyze/status/{job_id}**: 進捗取得。
- **GET /api/v1/talismans**: 解析済み護石一覧の取得。
- **PATCH /api/v1/talismans/{id}**: 手動修正の保存。

---

## 4. [Forbidden] 事項
- 型定義の不一致を許容しないこと。バックエンドは必ず `FastAPI` の自動ドキュメント（`/docs`）が本ドキュメントと同期していることを確認すること。
