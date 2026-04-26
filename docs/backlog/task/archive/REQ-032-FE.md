# TASK-REQ-032-FE-01: API_HOST を IPv4 固定アドレスに変更

## 1. ターゲット識別
- **対象ファイル**: `src/lib/api-client.ts`
- **対象シンボル**: `API_HOST`
- **行番号目安**: 6行目付近

## 2. 密閉コンテキスト (Hermetic Context)
※エンジニアは、以下のスニペットのみを情報源として実装すること。

### 2.1 関連コードスニペット
```typescript
/**
 * Backend API Configuration
 */
export const API_HOST = 'http://localhost:8000';
export const API_VERSION = '/api/v1';
export const API_BASE_URL = `${API_HOST}${API_VERSION}`;
```

## 3. 実装要件 (Implementation Logic)
- [x] `API_HOST` の値を `'http://localhost:8000'` から `'http://127.0.0.1:8000'` に変更する。
- [x] `API_VERSION` や `API_BASE_URL` への波及がないことを確認する（文字列結合が維持されていること）。

## 4. 検証手順 (AC)
- [x] ファイルを保存し、以下のコマンドで変更が反映されていることを確認する。
  ```powershell
  Select-String -Pattern "API_HOST = 'http://127.0.0.1:8000'" src/lib/api-client.ts
  ```
- [x] `npm run dev` 起動後、ブラウザでバックエンドへの通信（例：`/api/v1/health`）が成功することを確認する。
