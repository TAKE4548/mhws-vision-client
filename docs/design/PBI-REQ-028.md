# REQ-028: 実機サーバ接続時の動画アップロードおよび解析開始プロセスの修正 - 詳細設計

## 1. 目的と背景
Live Mode（実機サーバ接続時）において、フロントエンドからの動画アップロードが失敗する問題を修正する。また、Orvalによる生成コードが一部不完全（タグ不足や重複キーによるエラー）である状況を解消し、SSE接続を含む一連の解析フローを安定化させる。

## 2. 現状の課題
1.  **Multipart Boundaryの欠落**:
    - `analyze.ts` および `vision.ts` で生成された `multipart/form-data` リクエストにおいて、`Content-Type` ヘッダーが明示的に設定されているため、Axios/ブラウザによる `boundary` の自動付与が阻害されている。
2.  **OpenAPI仕様の不備 (YAMLException)**:
    - `openapi.yaml` 内で `/talismans/{capture_id}` が重複している、または構文エラーがある可能性があり、Orvalの生成が停止または不安定になる。
3.  **タグ不足による生成不備**:
    - 一部のエンドポイントにタグが設定されていないため、Orvalがファイルを正しく分割生成できない、または一部のメソッドが欠落する。

## 3. 解決策

### 3.1. OpenAPI 仕様の修正 (`openapi.yaml`)
- `YAMLException` (duplicated mapping key) の原因を特定し、削除または統合する。
- 全てのエンドポイントに対し、適切な `tags` を付与する（特に `analyze`, `vision`）。

### 3.2. APIクライアントの修正 (`api-client.ts`)
- `customInstance` (Axios mutator) を修正し、`data` が `FormData` である場合に `Content-Type` ヘッダーを削除するように変更する。これにより、Axiosが自動的に正確な `boundary` を含む `Content-Type` を設定できるようになる。

### 3.3. Orval 生成の再実行
- 仕様修正後、`npx orval` を実行し、クリーンな生成コードを得る。

## 4. 影響範囲
- `src/api/generated/`: 生成コード全体。
- `src/lib/api-client.ts`: 共通APIクライアント。
- `src/store/visionStore.ts`: アップロードおよび解析フロー。

## 5. トレードオフ・ Disclosure
- `api-client.ts` でのヘッダー削除は、Orvalが生成する `Content-Type` 設定をランタイムで上書きするアプローチである。Orvalの設定（`override`）でヘッダー出力を抑制する方が美しいが、`multipart/form-data` 全体に適用する設定が複雑なため、mutatorでの一括処理を採用する。

## 6. SSoT 影響分析
- `docs/system/openapi.yaml`: 修正必須。
- `docs/backlog/pbi/active/REQ-028.md`: 完了後にステータス更新。
