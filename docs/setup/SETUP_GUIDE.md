# Frontend Setup Guide: Vite + React (TypeScript)

本ドキュメントは、フロントエンド環境を初回構築するエージェント向けのセットアップ手順です。

## [Role Requirement]
- **Role**: `role-ux-designer`
- **Scope**: `tmp/frontend/`
- **Forbidden**: `create-react-app` の使用（Vite を使用すること）。

---

## 1. 使用技術スタック
- **Language**: TypeScript
- **Bundler**: Vite
- **Framework**: React 18+
- **Styling**: Tailwind CSS, Lucide-React
- **State Management**: Zustand

---

## 2. セットアップ手順

### Step 1: プロジェクトの初期化
ディレクトリが空の場合は Vite で初期化し、提供されている `package.json` をルートに配置してください。
```bash
# Viteの初期化（既にファイルがある場合はスキップ可）
npm create vite@latest . -- --template react-ts

# 依存関係のインストール
npm install
```

### Step 2: Tailwind CSS の導入
既に `package.json` に含まれているため、初期化コマンドのみ実行してください。
```bash
npx tailwindcss init -p
```
- `tailwind.config.js` を `DESIGN_SYSTEM.md` のトークンに従って編集してください。

### Step 3: フォルダ構成の調整
`src/` 配下に以下のディレクトリを作成してください。
- `components/`
- `store/`
- `lib/`
- `app/`

---

## 3. 動作確認
以下のコマンドで開発サーバーを起動し、ブラウザでアクセスできることを確認してください。
```bash
npm run dev
```

## 4. [Forbidden] 事項
- 型定義 (`.d.ts`) の自動生成を無視せず、必ず型安全なコードを維持すること。
- 画像アセットを `public/` に置く際は、バックエンドからの配信パス（`API_CONTRACT.md` 参照）と混同しないこと。
