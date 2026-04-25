# APP-STRUCTURE.md (アプリの全体構造)

---

## **Architecture**  
**使用フレームワーク**  
- **フロントエンド**: Vite + React  
- **状態管理**: Zustand（UI状態管理、APIモード設定など）  
- **通信**:  
  - **API Client**: サーバーとの通信（`useServerStore`で管理）  
  - **SSE Client**: サーバーのリアルタイム更新を処理（`useEffect`でポーリングを開始）  

**技術スタックの特徴**  
- Tailwind CSSでスタイリング（カスタムカラーパレット、フォント、ラウンドボタンのスタイルを定義）  
- レスポンシブデザインはTailwindのデフォルトブレイクポイントを基に実装  

---

## **Routing**  
**擬似ルーティングの実装**  
- **URLパス**: リアルタイムでのURL変更は実装されていない（擬似ルーティング）  
- **activeTabによる表示制御**:  
  - `dashboard`: メインダッシュボード表示  
  - `roi-calibrator`: ROI調整ツール表示  
  - `settings`: 設定画面（現在はプレースホルダー）  

**実装例**  
```tsx
{activeTab === 'dashboard' && <Dashboard />}
{activeTab === 'roi-calibrator' && <ROICalibrator />}
{activeTab === 'settings' && <Settings />}
```

---

## **Layouts**  
**共通レイアウトコンポーネントの構造**  
1. **Sidebar**  
   - 左サイドバー（`Sidebar`コンポーネント）  
   - メニュー選択で`activeTab`を更新（`useUIStore`経由）  
   - サイドバーの折りたたみ状態を`isSidebarCollapsed`で管理  

2. **Header**  
   - ヘッダー部（`header`タグ）  
   - アプリ名「Talisman Vision」の表示  
   - サーバー接続状態のステータスアイコン（オンライン/オフライン）  
   - `z-10`で上位レイヤーに固定  

3. **Main**  
   - メインコンテンツ領域（`main`タグ）  
   - `bg-surface-base`で背景色を統一  
   - ダイナミックなコンポーネント（`Dashboard`, `ROICalibrator`）を表示  

**レイアウトの特徴**  
- `flex`レイアウトで全体を構成（`h-screen`でフルスクリーン）  
- `overflow-hidden`でスクロールを制御  

---

## **Global Rules**  
**アプリ全体の共通ルール**  
1. **デザインシステム: Kinetic Observatory**  
   - **No-Line Rule**: 境界線の代わりに面の色で区切り（例: `bg-mhw-panel/50`の半透明背景）  
   - **Liquid Neon**: ネオン演出を流体的なアニメーションで表現（例: `animate-pulse`の使用）  
   - **Glassmorphism**: ガラスモーフィズムの効果（`backdrop-blur-sm`の適用）  

2. **カラーパレット**  
   - **Surface Architecture**:  
     - `surface-lowest`（背景）→ `#0c0e12`  
     - `surface-high`（コンポーネント）→ `#282a2e`  
   - **Kinetic Colors**:  
     - プライマリ: `kinetic-amber`（`#ffc174`）  
     - セカンダリ: `kinetic-blue`（`#adc6ff`）  
   - **ステータスカラー**:  
     - `status-success`（`#10b981`）、`status-error`（`#ef4444`）  

3. **フォント**  
   - **Primary**: `Noto Sans JP`（`font-hud`）  
   - **Technical**: `Space Grotesk`（`font-space`）  
   - **Manrope**: デザインシステムの一部として使用  

4. **アニメーションとZ-index**  
   - `animate-pulse`でステータスアイコンのアニメーションを実装  
   - `z-10`でヘッダーを上位レイヤーに固定  

5. **レスポンシブ設計**  
   - Tailwind CSSのデフォルトブレイクポイントを基に実装（`sm`, `md`, `lg`, `xl`）  
   - サイドバーの折りたたみ（`isSidebarCollapsed`）でモバイル対応  

6. **共通アニメーション**  
   - `animate-pulse`（ステータスアイコン）  
   - `backdrop-blur-sm`（ガラスモーフィズム効果）  

--- 

**参考設計規約**  
- **REQ-006**: Kinetic Observatoryデザインシステムの採用  
- **REQ-014**: セマンティックステータスカラーの使用（`status-error`, `status-success`など）