# PBI-REQ-030 実行可能テスト計画

## 1. 自動テスト (CLI Verification)
- **環境準備**: `npm install` が完了していること。
- **コマンド**: `npm test src/store/visionStore.test.ts`
- **期待値**: 
  - `updateAnalysisConfig({ scroll_pace_seconds: 0.5 })` 実行後、`store.getState().analysisConfig.scroll_pace_seconds === 0.5` であること。
  - `startAnalysis("prof_1")` 呼び出し時、モックされた API クライアントへの引数に `{ profile_id: "prof_1", analysis_config: { scroll_pace_seconds: 0.5, stillness_threshold: 0.01 } }` が含まれていること。
- **判定**: `vitest` の出力結果が `PASS` であること。

## 2. ツール主導監査 (Tool-Driven Audit)
- **API検証**: `python <USER_HOME>\.gemini\antigravity\scripts\openapi_parser.py <PROJECT_ROOT>\mhws-vision-server\docs\system\openapi.yaml get-endpoint "/analyze/start/{job_id}" POST`
- **コード監査**: `python <USER_HOME>\.gemini\antigravity\scripts\ollama_adapter.py engineer-audit docs/backlog/task/active/REQ-030.md`
- **判定**: エラーや不足の指摘がないこと。

## 3. ブラウザ検証 (Browser Agent Verification)
- **対象URL**: `http://localhost:5173/` (Vite dev server)
- **操作手順**: 
  1. 動画をアップロードし、`AnalysisMonitor` を表示。
  2. ID: `scroll-pace-input` に `0.5` を入力。
  3. ID: `advanced-settings-toggle` をクリック。
  4. ID: `stillness-threshold-input` に `0.02` を入力。
  5. ID: `initiate-analysis-button` をクリック。
- **判定基準 (Assertion)**: 
  - ブラウザのコンソールログ（または `Network` タブの記録）に、`/analyze/start` へのリクエストペイロードとして `{"analysis_config": {"scroll_pace_seconds": 0.5, "stillness_threshold": 0.02}, ...}` が出力されること。
- **エビデンス**: `<USER_HOME>\.gemini\antigravity\evidence\REQ-030_api_payload.json` (ブラウザからキャプチャしたリクエストボディ)
