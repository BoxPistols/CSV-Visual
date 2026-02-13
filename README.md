# CSV / JSON Data Visualizer

CSV や JSON ファイルをアップロードし、テーブル表示・AI による自然言語分析・グラフ描画を行うブラウザアプリケーションです。

## 主な機能

### データ操作

- CSV / JSON ファイルのドラッグ&ドロップまたはファイル選択によるアップロード
- JSON のネスト構造を自動でフラット化し、テーブルとして表示
- テーブルのソート（昇順・降順・解除の3段階切替）
- カラム幅のドラッグリサイズ
- カラムの表示/非表示切替、ドラッグによる並び替え
- ページネーション（10 / 25 / 50 / 100 / すべて）
- 行の追加・編集・削除（CRUD）
- データセットの保存・読み込み・リネーム・エクスポート（CSV / JSON）

### AI 分析

- 自然言語で分析内容を入力し、AI がデータに対する集計コードを生成・実行
- 結果は棒グラフ・折れ線グラフ・テーブル・集計値のいずれかで表示
- 対応プロバイダーとモデル:
  - **OpenAI** : GPT-5 Nano（既定）、GPT-5 Mini、GPT-4.1 Mini、GPT-4.1 Nano
  - **Gemini** : Gemini 2.5 Flash、Gemini 2.5 Pro、Gemini 2.0 Flash
- 画面上部のセレクタでプロバイダーとモデルを随時切替可能

### 表示・UI

- URL セルはクリック可能なリンクとして表示し、ホバーでプレビューポップアップを表示
- 画像 URL はサムネイル（40x40）として描画し、ホバーで拡大表示
- ワイドモード（1440px）/ コンパクトモード（960px）の切替
- 日本語・英語の自動切替（ブラウザの言語設定に連動）
- IME 変換中の誤送信防止（Cmd+Enter / Ctrl+Enter で明示的に送信）

---

## 技術スタック

| 分類 | 技術 |
|---|---|
| フレームワーク | React 19 |
| ビルドツール | Vite 7 |
| グラフ描画 | Recharts |
| アイコン | Lucide React |
| テスト | Vitest + Testing Library |
| パッケージ管理 | pnpm |

---

## セットアップ

### 前提条件

- Node.js 18 以上
- pnpm（npm や yarn でも動作しますが、lockfile は pnpm 形式です）

### インストールと起動

```bash
# 依存パッケージのインストール
pnpm install

# 開発サーバーの起動
pnpm dev
```

ブラウザで `http://localhost:5173` が自動的に開きます。

### 環境変数

プロジェクトルートに `.env` ファイルを作成し、使用するプロバイダーの API キーを設定してください。

```
VITE_OPENAI_API_KEY=your-openai-api-key
VITE_GEMINI_API_KEY=your-gemini-api-key
```

使用しないプロバイダーのキーは空欄のままで構いません。
`.env` は `.gitignore` に含まれているため、リポジトリにはコミットされません。

---

## 開発コマンド

```bash
pnpm dev       # 開発サーバー起動（HMR 有効）
pnpm build     # 本番ビルド（dist/ に出力）
pnpm preview   # ビルド結果のプレビュー
pnpm test      # テスト実行（Vitest）
pnpm lint      # ESLint による静的解析
```

---

## プロジェクト構成

```
CSV-Visual/
├── index.html
├── vite.config.js            # Vite 設定 + AI API プロキシ
├── package.json
├── .env                      # API キー（Git 管理外）
├── public/
│   ├── favicon.svg
│   ├── favicon-16x16.png
│   ├── favicon-32x32.png
│   ├── favicon-192x192.png
│   ├── favicon-512x512.png
│   ├── apple-touch-icon.png
│   └── site.webmanifest
└── src/
    ├── main.jsx              # エントリーポイント
    ├── index.css             # グローバルスタイル
    ├── App.jsx               # メインコンポーネント（テーブル・分析・UI 統合）
    ├── App.test.jsx          # App のテスト
    ├── components/
    │   ├── DatasetManager.jsx      # データセットの保存・読込・CRUD
    │   └── DatasetManager.test.jsx
    ├── lib/
    │   ├── storage.js        # ストレージ抽象化レイヤー
    │   └── storage.test.js
    └── test/
        └── setup.js          # テスト共通セットアップ
```

---

## API プロキシ

AI API へのリクエストは、Vite の開発サーバープロキシを経由して送信されます。API キーはサーバーサイドでヘッダーに付与されるため、ブラウザから直接外部 API にキーが送信されることはありません。

| エンドポイント | 転送先 |
|---|---|
| `/api/openai` | `https://api.openai.com/v1/chat/completions` |
| `/api/gemini/<model>` | `https://generativelanguage.googleapis.com/v1beta/models/<model>:generateContent` |

本番環境で運用する場合は、バックエンド（Express、Next.js API Routes など）を経由する構成に変更してください。

---

## テスト

Vitest と Testing Library を使用しています。

```bash
# 全テスト実行
pnpm test

# ウォッチモード
pnpm test -- --watch

# 特定ファイルのみ
pnpm test -- src/lib/storage.test.js
```

### テスト構成

- **storage.test.js** : ストレージアダプターの CRUD 操作、行操作、CSV/JSON エクスポート
- **DatasetManager.test.jsx** : 保存ボタンの表示制御、保存ダイアログの開閉、データセット一覧
- **App.test.jsx** : ヘルパー関数（parseCsv, flattenJson, rowsToCsv, isImageUrl）、UI 操作（ワイドモード切替、アコーディオン開閉、AI プロバイダー切替、ファイルアップロード）

---

## ストレージの設計

データの永続化は `src/lib/storage.js` の `LocalStorageAdapter` クラスが担当しています。
インターフェースが統一されているため、将来的に Firebase や Supabase などに差し替える場合は、同じインターフェースを実装したアダプターに置換するだけで対応できます。

```js
// 現在
export const storage = new LocalStorageAdapter();

// Firebase に移行する場合
import { db } from './firebase';
export const storage = new FirebaseAdapter(db);
```

App.jsx や DatasetManager.jsx 側の変更は不要です。

> 注意: localStorage の容量上限は約 5MB です。大きなデータセットを扱う場合は外部ストレージへの移行を検討してください。

---

## ライセンス

MIT
