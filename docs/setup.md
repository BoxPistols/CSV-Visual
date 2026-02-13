# セットアップガイド

## 前提条件

- **Node.js** 18 以上（`node -v` で確認）
- **pnpm**（推奨。npm や yarn でも動作するが lockfile は pnpm 形式）
- **Git**
- **API キー**（使用するプロバイダーに応じて取得）
  - OpenAI: [platform.openai.com](https://platform.openai.com)
  - Gemini: [aistudio.google.com](https://aistudio.google.com)

---

## クイックスタート

```bash
git clone https://github.com/BoxPistols/CSV-Visual.git
cd CSV-Visual
pnpm install
```

### 環境変数の設定

プロジェクトルートに `.env` ファイルを作成する。

```bash
cp .env.example .env
```

`.env` を編集し、使用するプロバイダーの API キーを設定する。

```
VITE_OPENAI_API_KEY=your-openai-api-key
VITE_GEMINI_API_KEY=your-gemini-api-key
```

使用しないプロバイダーのキーは空欄のままで構わない。
`.env` は `.gitignore` に含まれているため、リポジトリにはコミットされない。

### 開発サーバーの起動

```bash
pnpm dev
```

ブラウザで `http://localhost:5173` が自動的に開く。

---

## ゼロから構築する場合

既存リポジトリを clone せず、新規にプロジェクトを作成する手順。

### 1. プロジェクト作成

```bash
npm create vite@latest csv-visualizer -- --template react
cd csv-visualizer
pnpm install
pnpm add recharts lucide-react
mkdir -p src/lib src/components
```

### 2. ファイル配置

以下のファイルをリポジトリから取得し配置する。

```
csv-visualizer/
├── vite.config.js                 # API プロキシ設定
└── src/
    ├── index.css                  # グローバルスタイル
    ├── App.jsx                    # メインコンポーネント
    ├── lib/
    │   └── storage.js             # ストレージ抽象化レイヤー
    └── components/
        └── DatasetManager.jsx     # データセット管理 UI
```

### 3. 不要ファイルの削除

```bash
rm -f src/App.css src/assets/react.svg
```

### 4. 環境変数の設定

前述の「環境変数の設定」を参照。

### 5. Git 初期化

```bash
git init
echo ".env" >> .gitignore
echo ".env.local" >> .gitignore
echo ".env.*.local" >> .gitignore
git add .
git commit -m "初期構築"
```

---

## 開発コマンド一覧

| コマンド | 内容 |
|---|---|
| `pnpm dev` | 開発サーバー起動（HMR 有効） |
| `pnpm build` | 本番ビルド（`dist/` に出力） |
| `pnpm preview` | ビルド結果のプレビュー |
| `pnpm test` | テスト実行（Vitest） |
| `pnpm lint` | ESLint による静的解析 |

---

## 動作確認チェックリスト

- [ ] CSV ファイルをドラッグ&ドロップでテーブル表示されるか
- [ ] JSON ファイルがフラット化されてテーブル表示されるか
- [ ] カラムヘッダークリックでソートが切り替わるか（昇順 → 降順 → 解除）
- [ ] カラム右端のドラッグで幅をリサイズできるか
- [ ] カラム設定で表示/非表示、ドラッグ並替えが動作するか
- [ ] ページネーションで表示件数を切替できるか
- [ ] URL セルがクリック可能なリンクとして表示されるか
- [ ] 行の編集・削除・追加が正常に動作するか
- [ ] 「ライブラリに保存」で localStorage に保存されるか
- [ ] 保存済みデータセットの読込・リネーム・エクスポート・削除が動作するか
- [ ] AI 分析リクエストが Cmd+Enter / Ctrl+Enter で送信されるか
- [ ] IME 変換中の Enter で誤送信されないか
