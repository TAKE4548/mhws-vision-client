# UI Feature: Sidebar (Navigation & System Mode)

## 1. 概要
アプリケーションの主要なナビゲーションとシステム状態の管理を集約したコンポーネントです。
MHWスタイルのHUDを意識した縦型のゴールドラインと、状況に応じたステータス表示が特徴です。

## 2. 構成要素

### Navigation (Top)
- **Dashboard**: 解析済みデータの一覧と詳細表示。
- **ROI Calibrator**: 解析範囲の設定。
- **Settings**: アプリケーションの基本設定。

### System Mode (Bottom - REQ-014)
開発およびデバッグ用に、API通信の挙動を制御するセクションです。
- **API Mode Toggle**: 
    - `LIVE_SERVER`: 実際のバックエンド (`127.0.0.1:8000`) と通信します。
    - `API_STUB_MODE`: `src/lib/mock-data.ts` のダミーデータを返し、ネットワーク通信を模倣します。
- **Error Simulation**:
    - Stubモード時のみ有効。ONにすると API が 500 エラーを返すようになり、UIのエラーハンドリングを検証可能です。

### Status Box (Footer)
- 現在のアプリケーション全体の稼働状態（STABLE_SCAN / SYNCING 等）を表示します。
- `kinetic-amber` のパルスアニメーションにより「稼働中」を表現します。

## 3. インタラクション
- **Collapsible**: サイドバー右端のトグルボタン、またはグループホバーで表示される矢印で開閉可能です。
- **Visual Feedback**:
    - アクティブなタブはゴールドの左ボーダーと内光（Inner Glow）で強調されます。
    - Stubモード時は `status-error` カラーが適用され、開発環境であることを明示します。
