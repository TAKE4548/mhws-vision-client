# Talisman Vision - Frontend Client

## 概要
モンスターハンターワイルズ（MHWs）の護石認識と管理を行うための高精度なフロントエンドクライアントです。  
既存の Streamlit 実装から React/Vite 構成へ移行し、プレミアムな HUD スタイル UI を提供します。

## 技術スタック
- **Framework**: React 18 (Vite)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **State Management**: Zustand
- **Icons**: Lucide React

## セットアップ

### 依存関係のインストール
```bash
npm install
```

### 開発サーバーの起動
```bash
npm run dev
```

### ビルド
```bash
npm run build
```

## リポジトリ配置要件
本プロジェクトのエージェント（AntiGravity）は、システム設計の正解（SSoT）を隣接する Server リポジトリから参照します。  
以下のディレクトリ構造で配置されていることを確認してください：
```text
parent_dir/
├── mhws-vision-client/ (本リポジトリ)
└── mhws-vision-server/
```
配置が異なる場合、エージェントが API 仕様やシステムシーケンスを正しく認識できない可能性があります。

## 開発ガイドライン
- **Design System**: 全ての UI は `docs/ui/features/DESIGN_SYSTEM.md` に従ってください。
- **Linting**: 提出前に `npm run lint` を実行してください。
- **Workflows**: `/dev`, `/bug`, `/wish` などの Antigravity 標準ワークフローを使用します。

## ライセンス
Proprietary
