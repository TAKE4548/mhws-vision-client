---
id: REQ-034-FE
status: ready
tags: ["UI", "Visualization"]
title: 判定根拠（波形・クロップ）の可視化 (Frontend)
---

### REQ-034-FE: 判定根拠（波形・クロップ）の可視化 (Frontend)
- **Type**: enhancement
- **Status**: ready
- **Current step**: none
- **Priority**: P2
- **Requirement**: 詳細画面において各判定項目の「元画像（クロップ）」および「判定根拠（波形グラフ等）」をオンデマンドで閲覧可能にする。
- **Acceptance criteria**:
  - [ ] AC-1: 詳細画面の各判定項目（スキル名、スロット）の近傍に、判定に使用されたクロップ画像を表示できるアコーディオンUIが実装されていること。
  - [ ] AC-2: アコーディオンを展開した際、API(`slots_debug_data`)から取得した波形データをグラフ形式で表示されること。
  - [ ] AC-3: 波形グラフには判定の閾値（threshold）が基準ラインとして表示されること。
  - [ ] AC-4: デバッグ情報はデフォルトで非表示であり、通常の利用体験を妨げないこと。
- **Design doc**: docs/design/PBI-SYS-REQ-034.md (System Repo)
