# アーキテクチャ

## 全体構成

```
CSV-Visual/
├── index.html                    # SPA エントリー
├── vite.config.js                # Vite 設定 + API プロキシ
├── package.json
├── .env                          # API キー（Git 管理外）
├── public/                       # 静的アセット（favicon 等）
├── docs/                         # ドキュメント
└── src/
    ├── main.jsx                  # React エントリーポイント
    ├── index.css                 # グローバルスタイル
    ├── App.jsx                   # アプリケーション本体
    ├── components/
    │   └── DatasetManager.jsx    # データセット管理 UI
    ├── lib/
    │   └── storage.js            # ストレージ抽象化レイヤー
    └── test/
        └── setup.js              # テスト共通セットアップ
```

## 設計方針

### シングルファイル中心の構成

このアプリケーションは `App.jsx` に主要なロジックと UI を集約する構成をとっている。
小〜中規模のツール系アプリとして、過度なファイル分割によるナビゲーションコストを避けるための判断である。

分離しているのは以下の 2 つ。

- **DatasetManager.jsx**: データセットの保存・読込・CRUD を担う独立した UI コンポーネント
- **storage.js**: データ永続化のアダプター。ストレージ実装を差し替え可能にする抽象化レイヤー

### ストレージ抽象化

`storage.js` の `LocalStorageAdapter` は統一インターフェースを提供する。

```
list()       → データセット一覧（メタ情報のみ）
getById(id)  → 単一データセットの全データ取得
create(data) → 新規保存
update(id, data) → 更新
remove(id)   → 削除
addRow(id, row)    → 行追加
updateRow(id, idx, row) → 行更新
removeRow(id, idx) → 行削除
```

将来的に Firebase や Supabase に移行する場合、同じインターフェースを実装したアダプターに差し替えるだけで対応できる。

```js
// 現在
export const storage = new LocalStorageAdapter();

// Firebase に移行する場合
import { db } from './firebase';
export const storage = new FirebaseAdapter(db);
```

`App.jsx` や `DatasetManager.jsx` 側の変更は不要。

> 注意: localStorage の容量上限は約 5MB。大きなデータセットを扱う場合は外部ストレージへの移行を検討すること。

---

## AI プロバイダー

### 対応プロバイダーとモデル

| プロバイダー | モデル | 既定 |
|---|---|---|
| OpenAI | GPT-5 Nano, GPT-5 Mini, GPT-4.1 Mini, GPT-4.1 Nano | GPT-5 Nano |
| Gemini | Gemini 2.5 Flash, Gemini 2.5 Pro, Gemini 2.0 Flash | Gemini 2.5 Flash |

画面上部のセレクタでプロバイダーとモデルを随時切替可能。

### AI 分析の仕組み

1. ユーザーが自然言語で分析内容を入力する
2. アプリが現在のデータ構造（ヘッダー・先頭行のサンプル）とともに AI に送信する
3. AI が JavaScript の集計コードを生成する
4. 生成されたコードをブラウザ上で `eval` 実行し、結果を取得する
5. 結果の型に応じて棒グラフ・折れ線グラフ・テーブル・集計値として描画する

### API プロキシ

API キーの漏洩を防ぐため、すべての AI API リクエストは Vite の開発サーバープロキシを経由する。
API キーはサーバーサイドでヘッダーに付与され、ブラウザから直接外部 API にキーが送信されることはない。

| エンドポイント | 転送先 |
|---|---|
| `/api/openai` | `https://api.openai.com/v1/chat/completions` |
| `/api/gemini/<model>` | `https://generativelanguage.googleapis.com/v1beta/models/<model>:generateContent` |

本番環境では、バックエンド（Express、Next.js API Routes 等）を経由する構成に変更すること。

---

## 国際化（i18n）

ブラウザの言語設定（`navigator.language`）に基づいて日本語・英語を自動切替する。
翻訳定義は各コンポーネント内の `TR` オブジェクトに直接記述している。

対応ロケール:
- `ja-JP`: 日本語
- `en-US`: 英語（フォールバック）

---

## データ処理

### CSV パース

独自の軽量パーサーを使用。1 行目をヘッダーとして扱い、以降を行データとして展開する。

### JSON フラット化

ネストされた JSON オブジェクトを再帰的に走査し、ドット区切りのキー名でフラットなオブジェクトに変換する。
配列はカンマ区切り文字列に変換される。

```
{ user: { name: "Taro", address: { city: "Tokyo" } } }
→ { "user.name": "Taro", "user.address.city": "Tokyo" }
```

### 画像 URL 検出

URL が画像拡張子（jpg, png, gif, webp, svg 等）で終わる場合、テーブル内にサムネイル（40x40）を表示する。
ホバーで拡大プレビューが表示される。
