---
id: REQ-032-FE
title: "クライアント・サーバ間接続不備の解消 (FE)"
status: ready
tags: ["bug", "network"]
---

### REQ-032-FE: クライアント・サーバ間接続不備の解消 (FE)

- **Status**: ready
- **Priority**: HIGH
- **Description**: Frontend (Vite) から Backend (FastAPI) への接続先を `127.0.0.1:8000` に固定し、IPv6 名前解決による接続失敗を回避する。

- **Acceptance Criteria (AC)**:
    - [ ] `mhws-vision-client/src/lib/api-client.ts` の `API_HOST` が `http://127.0.0.1:8000` に変更されていること。
    - [ ] 開発環境において、ブラウザのコンソールに CORS エラーや接続エラーが表示されないこと。
    - [ ] サーバーとの通信（health check 等）が正常に完了すること。

- **Related Documents**:
    - [PBI-SYS-REQ-032](../../../../docs/design/PBI-SYS-REQ-032.md)
