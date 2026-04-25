# FLOW-TRANSITION.md (動線とロジック)

---

## **User Flow (Mermaid)**

```mermaid
graph TD
    A[Dashboard] -->|ROI調整| B[ROICalibrator]
    B -->|設定| C[Settings]
    C -->|戻る| A
    A -->|解析開始| D[Upload]
    D --> E[Start]
    E --> F[Monitor]
    F --> G[Results]
    G -->|再解析| E
    D -->|キャンセル| H[Cancel]
    H -->|再アップロード| D
    F -->|完了| I[Job Completed]
    I -->|結果表示| G

    subgraph Analysis_Flow
        D[Upload Video] --> E[Start Analysis]
        E --> F[Monitor Progress]
        F --> G[Extract Results]
    end

    subgraph ROI_Adjustment_Flow
        B --> J[Step 0: Setup]
        J -->|既存プロファイル選択| L[Step 2: Window Area]
        J -->|新規作成| K[Step 1: Source Frame]
        K --> L
        L --> M[Step 3: Items]
        M --> N[Step 4: Normalization]
        N --> O[Step 5: Save]
        O -->|完了| Dashboard
    end
```

---

## **Interaction Logic**

### **ROI調整のステップ遷移ロジック**
- **ステップナビゲーション (Any-to-Any)**
  - ユーザーはステップバーの番号を直接クリックすることで、現在の進捗に関わらず任意のステップへ遷移可能。
  - **Seamless Transition**: 遷移時に `previewImage` や `actualRatio` を即座にクリアせず、新しい画像のロード完了まで旧画像を維持します。これにより、遷移時のチラつきやレイアウトのガタつき（16:9への一時復帰等）を防止します。

- **背景プレビューの更新ポリシー (REQ-026)**
  - **更新タイミング**: `step` の変更、ジョブIDの変更、タイムスタンプの変更時のみフェッチを実行します。
  - **抑制対象**: ROI枠のドラッグや `NumericalAdjuster` による数値操作中には、UIのレスポンスを優先するため API フェッチを行いません。
  - **アスペクト比同期**: 画像読込完了時（`onLoad`）に実際の解像度を検知し、`actualRatio` を更新します。

- **Item ROIs ステップ (Step 3)**
  - ROIアイテムを4つの独立した同期グループに分類し、各グループ内で連動（等間隔同期）を実現。
    - **独立グループ**: `Slot Icons`, `Slot Level Borders`, `Skill Names`, `Skill Level Borders`。
    - **連動ロジック**: 各グループの1つ目の要素（Primary）を操作すると、同一グループ内の他の要素が現在の Gap を維持して追従する。
    - **Gap 調整**: カテゴリごとに独立した Gap 値を保持し、`NumericalAdjuster` を通じて動的に間隔を変更可能。
  - `parent_window` のアスペクト比に基づきキャンバスが形状変化。

- **保存ステップ (Step 4)**
  - 設定にプロファイル名を付けて保存。
  - キャンバスは Step 2 (`parent_window`) のアスペクト比を維持して最終プレビューを表示。

### **APIモードの切り替え挙動**
- **Liveモード**  
  - `apiMode: "live"` → 実際のAPIサーバーにリクエストを送信（`visionStore`の`uploadVideo`は実際のアップロード処理を実行）。
  - サーバーの応答が遅延がある場合、UIにローディングスピナーを表示。

- **Stubモード**  
  - `apiMode: "stub"` → モックデータを即時返却（`visionStore`の`uploadVideo`は擬似的な成功ステータスを返す）。
  - ユーザーがモードを切り替えると、`uiStore`の`apiMode`が更新 → 全コンポーネントに再レンダリングをトリガー。

### **SSEによるリアルタイム更新ロジック**
- **イベントタイプとUIへの影響**  
  - `progress`  
    - `visionStore.status`を`processing`に更新 → プログレスバーの進捗値を更新。
  - `capture_extracted`  
    - `visionStore`にキャプチャ画像を追加 → モニタ画面にリアルタイムで表示。
  - `talisman_analyzed`  
    - `visionStore`に解析結果を追加 → HUDに警告アイコンを表示（REQ-015）。
  - `job_completed`  
    - `visionStore.status`を`completed`に更新 → 「解析完了」メッセージを表示し、結果画面へ遷移。

- **SSE接続のライフサイクル**  
  - `startAnalysis`が呼び出されると、`listenToEvents`がSSE接続を確立。
  - エラーや切断が発生した場合、`visionStore.status`を`failed`に更新 → エラーメッセージを表示。

---

## **State Matrix**

| **イベントタイプ**       | **コンポーネント**       | **状態変化前**         | **状態変化後**         | **説明**                                                                 |
|-------------------------|--------------------------|------------------------|------------------------|--------------------------------------------------------------------------|
| ボタンクリック: Upload  | `visionStore`            | `idle`                | `pending`             | ビデオアップロード処理を開始 → プログレスバー表示                      |
| API受信: job_completed  | `visionStore`            | `processing`          | `completed`           | 解析が完了 → 結果画面へ遷移                                            |
| SSE受信: progress       | `visionStore`            | `pending`             | `processing`          | プログレスバーの進捗値を更新                                           |
| ボタンクリック: Next    | `roiStore`               | `parent`              | `items`               | ROI調整ステップを進める                                                |
| SSE受信: capture_extracted | `visionStore`         | `processing`          | `processing`          | キャプチャ画像をHUDにリアルタイム表示                                  |
| ボタンクリック: APIモード切り替え | `uiStore` | `live`                | `stub`                | モックデータモードに切り替える → 実際のAPI呼び出しを無効化             |
| SSE受信: talisman_analyzed | `visionStore`        | `processing`          | `processing`          | 解析結果の警告情報をHUDに表示（REQ-015）                               |
| サーバー接続監視: Polling | `App.tsx`              | `connected: false`    | `connected: true`     | サーバー接続状態をUIに反映                                             |
| ボタンクリック: サイドバー開閉 | `uiStore`           | `isSidebarCollapsed: true` | `isSidebarCollapsed: false` | サイドバーの表示/非表示を切り替える                                   |

---

## **補足**