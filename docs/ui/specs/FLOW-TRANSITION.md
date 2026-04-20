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
  - 遷移時、`setPreviewImage(null)` を実行し、古いステップの残像が表示されるのを防止。

- **Parent選択ステップ (Step 1)**  
  - ユーザーがROI調整対象のParentを選択。
  - **Context Reset**: このステップに遷移（または復帰）した際、`actualRatio` と `previewImage` がリセットされ、全画面解像度での再描画が保証される。
  - 画像読込完了時に実際の解像度を検知し、`setResolution` を通じて `profile.resolution` を同期。

- **Items選択ステップ (Step 2)**  
  - ROIアイテムのドラッグ＆ドロップで領域を設定 → `activeTarget`の座標が更新。
  - `parent_window` のアスペクト比に基づきキャンバスが形状変化。

- **正規化ステップ (Step 3)**  
  - ROI領域のスケーリング/回転調整 → `activeTarget`の変換パラメータが更新。
  - 特定のROIスロットにズームし、そのアスペクト比にキャンバスが追従。

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

## **補足