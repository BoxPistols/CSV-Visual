# CSV / JSON Data Visualizer

CSV/JSON をブラウザでテーブル表示し、AI 自然言語分析とグラフ描画を行う React SPA。

## 技術スタック

- React 19 + Vite 7 (JSX, ES Modules)
- Recharts（グラフ）、Lucide React（アイコン）
- Vitest + Testing Library
- pnpm

## コマンド

```bash
pnpm dev          # 開発サーバー (localhost:5173)
pnpm build        # 本番ビルド
pnpm test         # テスト実行
pnpm lint         # ESLint
```

## アーキテクチャ

```
src/
├── App.jsx                 # メインコンポーネント（UI + ロジック集約）
├── components/
│   └── DatasetManager.jsx  # データセット管理 UI
└── lib/
    └── storage.js          # ストレージ抽象化（現在: localStorage）
```

- App.jsx に主要ロジックを集約するシングルファイル中心の構成
- storage.js は統一インターフェース。Firebase 等への差し替えはアダプター置換のみ
- i18n はコンポーネント内の TR オブジェクトで管理（外部ライブラリ不使用）
- AI API は Vite プロキシ経由。キーはサーバーサイドでヘッダー付与

## コードスタイル

- 関数コンポーネント + hooks
- セミコロンあり
- シングルクォート
- ESLint 設定に従う（独自ルール: `no-unused-vars` で大文字始まりは許可）

## コミット規約

- 日本語で記述
- Conventional Commits のプレフィックス使用: feat, fix, docs, test, refactor, chore
- 簡潔に要点のみ（冗長な説明・定量値は不要）
- 以下を含めない:
  - Co-Authored-By ヘッダー
  - "Generated with Claude Code" 等の自動生成表記
  - 絵文字

## テスト

- 新機能・バグ修正にはテストを書く
- `pnpm test` で全テスト通過を確認してからコミット
- Testing Library のアクセシブルクエリを優先 (`getByRole`, `getByText`)

## 注意事項

- .env に API キーを格納（Git 管理外）。コミットしないこと
- localStorage の容量上限は約 5MB
- AI 分析は eval でコード実行するため、プロンプトインジェクションに注意
