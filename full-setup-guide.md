# CSV/JSON Data Visualizer — 完全セットアップガイド

## 前提条件

- **Node.js** 18+ (`node -v` で確認)
- **Git** (`git --version` で確認)
- **GitHub アカウント**
- **Anthropic API キー** → [console.anthropic.com](https://console.anthropic.com)

---

## Step 1: プロジェクト作成

```bash
# Vite + React でスキャフォールド
npm create vite@latest csv-visualizer -- --template react
cd csv-visualizer

# 依存パッケージ
npm install
npm install recharts lucide-react

# ディレクトリ構造を作成
mkdir -p src/lib src/components
```

---

## Step 2: ファイル配置

以下の **6ファイル** を作成・上書きします。

```
csv-visualizer/
├── .env                           ← Step 3 で作成
├── .gitignore                     ← Step 4 で編集
├── vite.config.js                 ← 上書き
├── package.json
└── src/
    ├── main.jsx                   ← Vite生成のまま (変更不要)
    ├── index.css                  ← 上書き
    ├── App.jsx                    ← 上書き
    ├── lib/
    │   └── storage.js             ← 新規作成
    └── components/
        └── DatasetManager.jsx     ← 新規作成
```

### 配置手順

会話内のアーティファクトからコピーしてください:

| ファイル | アーティファクト名 |
|---|---|
| `vite.config.js` | **vite.config.js (API Proxy設定)** |
| `src/index.css` | **src/index.css** |
| `src/App.jsx` | **src/App.jsx (CRUD対応版)** |
| `src/lib/storage.js` | **src/lib/storage.js (ストレージ抽象化レイヤー)** |
| `src/components/DatasetManager.jsx` | **src/components/DatasetManager.jsx** |

> **Tip**: 各アーティファクト右上の「コピー」ボタンで全文コピーできます。

### Vite 生成ファイルの削除 (任意)

```bash
# 不要なデフォルトファイルを削除
rm src/App.css src/assets/react.svg
```

---

## Step 3: 環境変数の設定

```bash
# プロジェクトルートに .env を作成
cat > .env << 'EOF'
VITE_ANTHROPIC_API_KEY=sk-ant-api03-xxxxxxxxxx
EOF
```

> **⚠️ 重要**: `sk-ant-...` を実際のAPIキーに置き換えてください

---

## Step 4: Git 初期化 & .gitignore

```bash
# .gitignore に追記（APIキーを絶対にコミットしない）
cat >> .gitignore << 'EOF'

# Environment variables
.env
.env.local
.env.*.local
EOF
```

```bash
# Git 初期化
git init
git add .
git commit -m "feat: CSV/JSON Data Visualizer 初期構築

- CSV/JSON ファイルのアップロード・プレビュー
- Claude API による自然言語データ分析
- テーブル: ソート・カラムリサイズ・表示切替・ページネーション
- CRUD: 行の追加・編集・削除
- データセットライブラリ (localStorage)
- 日本語/英語 自動切替
- IME対応 (Cmd+Enter / Ctrl+Enter 送信)"
```

---

## Step 5: GitHub リポジトリ作成 & プッシュ

### 方法A: GitHub CLI (推奨)

```bash
# GitHub CLI 未インストールの場合
# macOS: brew install gh
# Windows: winget install GitHub.cli

gh auth login
gh repo create csv-visualizer --private --source=. --push
```

### 方法B: 手動

1. [github.com/new](https://github.com/new) で空のリポジトリを作成
   - リポジトリ名: `csv-visualizer`
   - Private 推奨
   - README/gitignore/License は **追加しない**

2. リモート追加 & プッシュ:

```bash
git remote add origin https://github.com/<YOUR_USERNAME>/csv-visualizer.git
git branch -M main
git push -u origin main
```

---

## Step 6: 開発サーバー起動

```bash
npm run dev
```

ブラウザで **http://localhost:5173** を開く。

---

## Step 7: 動作確認チェックリスト

- [ ] CSV ファイルをドラッグ&ドロップ → テーブル表示
- [ ] JSON ファイルをアップロード → フラット化されてテーブル表示
- [ ] カラムヘッダークリック → ソート (昇順→降順→解除)
- [ ] カラム右端ドラッグ → 幅リサイズ
- [ ] ⚙️ カラム設定 → 表示/非表示、ドラッグ並替え
- [ ] ページネーション → 表示件数切替 (10/25/50/100/すべて)
- [ ] URL セル → クリック可能なリンク
- [ ] 行の ✏️ → 編集モーダル → 保存
- [ ] 行の 🗑 → 行削除
- [ ] 「行を追加」 → 新規行モーダル
- [ ] 「ライブラリに保存」 → localStorage に永続化
- [ ] 保存済みデータセット → 読込 / リネーム / CSV・JSON出力 / 削除
- [ ] 分析テキストエリア → Cmd+Enter (Mac) / Ctrl+Enter (Win) で送信
- [ ] IME 変換中の Enter → 送信されない ✓

---

## 補足: 別のマシンで clone して開発する場合

```bash
git clone https://github.com/<YOUR_USERNAME>/csv-visualizer.git
cd csv-visualizer
npm install

# .env は git に含まれないので手動作成
echo "VITE_ANTHROPIC_API_KEY=sk-ant-api03-xxxxxxxxxx" > .env

npm run dev
```

---

## 補足: 将来の Firebase 移行パス

```bash
npm install firebase
```

```
src/lib/
├── storage.js        ← export を差し替えるだけ
└── firebase.js       ← 新規: Firebase 初期化
```

`storage.js` の最終行:
```js
// Before
export const storage = new LocalStorageAdapter();

// After
import { db } from './firebase';
export const storage = new FirebaseAdapter(db);
```

`FirebaseAdapter` のスケルトンは `storage.js` 内にコメントで用意済み。
インターフェース (`list`, `getById`, `create`, `update`, `remove`, `addRow`, `updateRow`, `removeRow`) が共通なので、App.jsx 側の変更は不要です。
