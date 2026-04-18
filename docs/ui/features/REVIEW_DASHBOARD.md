# Feature Spec: Review Dashboard

## [Role Requirement]
- **Role**: `role-ux-designer`
- **Scope**: `tmp/frontend/src/app/dashboard/`
- **Forbidden**: 護石一件ごとの詳細データをコンポーネント内にローカルステートとして閉じ込めること（Zustandへの同期を必須とする）。

---

## 1. 概要
抽出された護石データを一覧表示し、確信度の低い項目を人間が修正・確定するための中心的なインターフェースです。

## 2. 実装要件
1. **Grid Layout**: 3カラムの安定したグリッド表示（スマホ・デスクトップ対応）。
2. **Filtering/Sorting**: レア度、スキル名、自信度（低い順）によるソート機能。
3. **Modal/Drawer**: カードクリック時に詳細（クロップ画像、推論ログ等）を表示。
4. **Instant Edit**: スキルレベルや数値のドロップダウン変更を即座にステートへ反映。

## 3. ステート構成 (Zustand)
```typescript
interface TalismanStore {
  talismans: Talisman[];
  isScanning: boolean;
  progress: number;
  updateTalisman: (id: string, updates: Partial<Talisman>) => void;
  // ...
}
```

---

## 4. [Forbidden] 事項
- ブラウザの戻る/進むボタン等で解析途中のデータが消失しないよう、`LocalStorage` への永続化バックアップを考慮すること。
