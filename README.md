# CSV / JSON Data Visualizer

> [English version (README.en.md)](./README.en.md)

CSV や JSON ファイルをブラウザ上でテーブル表示し、AI による自然言語分析とグラフ描画を行うクライアントサイドアプリケーション。

---

## コンセプト

**「データを見る・触る・聞くを、ブラウザだけで完結させる」**

多くのデータ分析ツールは、環境構築やプログラミング知識を前提とする。このアプリケーションは、CSV や JSON をドロップするだけでデータのプレビュー・編集・分析をブラウザ上で即座に開始できることを目指している。

分析の指示は自然言語で行う。「売上上位 10 件を棒グラフで見せて」と入力すれば、AI が集計コードを生成・実行し、結果をグラフやテーブルで返す。SQL やスプレッドシートの関数を覚える必要はない。

データはブラウザの localStorage に保存され、外部サーバーへの送信は AI 分析リクエスト時のみ。プライバシーに配慮した設計としている。

---

## 主な機能

### データ操作

- CSV / JSON ファイルのドラッグ&ドロップまたはファイル選択によるアップロード
- JSON のネスト構造を自動でフラット化し、テーブルとして表示
- テーブルのソート（昇順・降順・解除の 3 段階切替）
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

## アーキテクチャ

### 技術スタック

| 分類 | 技術 | 選定理由 |
|---|---|---|
| フレームワーク | React 19 | コンポーネント指向で状態管理が容易 |
| ビルドツール | Vite 7 | 高速な HMR とシンプルな設定 |
| グラフ描画 | Recharts | React ネイティブで宣言的に記述可能 |
| アイコン | Lucide React | 軽量・Tree-shakable なアイコンセット |
| テスト | Vitest + Testing Library | Vite と統合されたテスト環境 |
| パッケージ管理 | pnpm | 高速で厳格な依存関係管理 |

### 構成の設計思想

このアプリケーションは **シングルファイル中心の構成** をとっている。

`App.jsx` にテーブル表示・AI 分析・カラム設定・ページネーション・CRUD の主要ロジックを集約し、コンポーネント間のデータ受け渡しを最小限に抑えている。小〜中規模のツール系アプリとして、過度なファイル分割によるナビゲーションコストを避けるための判断である。

独立性の高い以下の 2 モジュールのみを分離している。

```
src/
├── App.jsx                    # アプリケーション本体（UI + ロジック統合）
├── components/
│   └── DatasetManager.jsx     # データセット管理 UI（保存・読込・CRUD）
└── lib/
    └── storage.js             # ストレージ抽象化レイヤー
```

### ストレージ抽象化

データの永続化は `storage.js` の `LocalStorageAdapter` が担当する。統一インターフェースにより、ストレージ実装の差し替えが可能。

```
list()              → データセット一覧取得
getById(id)         → 単一データセット取得
create(data)        → 新規保存
update(id, data)    → 更新
remove(id)          → 削除
addRow(id, row)     → 行追加
updateRow(id, idx, row) → 行更新
removeRow(id, idx)  → 行削除
```

Firebase や Supabase に移行する場合、同じインターフェースを実装したアダプターに差し替えるだけで、`App.jsx` や `DatasetManager.jsx` の変更は不要。

```js
// 現在
export const storage = new LocalStorageAdapter();

// Firebase に移行する場合
import { db } from './firebase';
export const storage = new FirebaseAdapter(db);
```

### AI 分析フロー

```
ユーザー入力（自然言語）
    ↓
データ構造（ヘッダー + サンプル行）と共に AI API へ送信
    ↓
AI が JavaScript 集計コードを生成
    ↓
ブラウザ上でコードを実行し、結果を取得
    ↓
結果の型に応じて描画（棒グラフ / 折れ線 / テーブル / 集計値）
```

### API プロキシ

API キーの漏洩を防ぐため、すべての AI API リクエストは Vite 開発サーバーのプロキシを経由する。キーはサーバーサイドでヘッダーに付与され、ブラウザから直接外部 API に送信されることはない。

| エンドポイント | 転送先 |
|---|---|
| `/api/openai` | `https://api.openai.com/v1/chat/completions` |
| `/api/gemini/<model>` | `https://generativelanguage.googleapis.com/v1beta/models/<model>:generateContent` |

> 本番環境ではバックエンド（Express、Next.js API Routes 等）を経由する構成に変更すること。

### 国際化（i18n）

ブラウザの `navigator.language` に基づき日本語・英語を自動切替する。翻訳定義は各コンポーネント内の `TR` オブジェクトに直接記述し、外部ライブラリには依存しない。

---

## プロジェクト構成

```
CSV-Visual/
├── index.html                    # SPA エントリー
├── vite.config.js                # Vite 設定 + API プロキシ
├── package.json
├── .env                          # API キー（Git 管理外）
├── public/                       # 静的アセット（favicon 等）
├── docs/                         # ドキュメント
│   ├── setup.md                  # セットアップガイド
│   ├── architecture.md           # アーキテクチャ詳細
│   └── testing.md                # テストガイド
└── src/
    ├── main.jsx                  # React エントリーポイント
    ├── index.css                 # グローバルスタイル
    ├── App.jsx                   # メインコンポーネント
    ├── App.test.jsx              # App のテスト
    ├── components/
    │   ├── DatasetManager.jsx    # データセットの保存・読込・CRUD
    │   └── DatasetManager.test.jsx
    ├── lib/
    │   ├── storage.js            # ストレージ抽象化レイヤー
    │   └── storage.test.js
    └── test/
        └── setup.js              # テスト共通セットアップ
```

---

## セットアップ

### 前提条件

- Node.js 18 以上
- pnpm（npm や yarn でも動作するが lockfile は pnpm 形式）

### インストールと起動

```bash
pnpm install
pnpm dev
```

ブラウザで `http://localhost:5173` が自動的に開く。

### 環境変数

プロジェクトルートに `.env` を作成し、使用するプロバイダーの API キーを設定する。

```
VITE_OPENAI_API_KEY=your-openai-api-key
VITE_GEMINI_API_KEY=your-gemini-api-key
```

使用しないプロバイダーのキーは空欄のままで構わない。`.env` は `.gitignore` に含まれているため、リポジトリにはコミットされない。

> 詳細な手順は [docs/setup.md](./docs/setup.md) を参照。

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

## テスト

Vitest と Testing Library によるテスト環境を構築している。

```bash
pnpm test              # 全テスト実行
pnpm test -- --watch   # ウォッチモード
```

| テストファイル | 対象 |
|---|---|
| `storage.test.js` | ストレージアダプターの CRUD、行操作、エクスポート |
| `DatasetManager.test.jsx` | 保存ボタンの表示制御、ダイアログ、一覧表示 |
| `App.test.jsx` | ヘルパー関数、UI 操作全般 |

> 詳細は [docs/testing.md](./docs/testing.md) を参照。

---

## ドキュメント

| ドキュメント | 内容 |
|---|---|
| [docs/setup.md](./docs/setup.md) | セットアップガイド（ゼロからの構築手順を含む） |
| [docs/architecture.md](./docs/architecture.md) | アーキテクチャ詳細 |
| [docs/testing.md](./docs/testing.md) | テストガイド |

---

## ライセンス

MIT
