# テストガイド

## 概要

Vitest と Testing Library を使用したテスト環境を構築している。
テスト対象は主に以下の 3 領域。

| テストファイル | 対象 |
|---|---|
| `src/lib/storage.test.js` | ストレージアダプターの CRUD 操作 |
| `src/components/DatasetManager.test.jsx` | データセット管理 UI の表示・操作 |
| `src/App.test.jsx` | ヘルパー関数、UI 操作全般 |

---

## テストの実行

```bash
# 全テスト実行
pnpm test

# ウォッチモード（ファイル変更時に自動再実行）
pnpm test -- --watch

# 特定ファイルのみ
pnpm test -- src/lib/storage.test.js

# カバレッジ付き
pnpm test -- --coverage
```

---

## テスト構成の詳細

### storage.test.js

ストレージアダプター（`LocalStorageAdapter`）の単体テスト。

- データセットの作成・一覧取得・ID 指定取得・更新・削除
- 行単位の操作（追加・更新・削除）
- CSV / JSON エクスポート

テスト内では `localStorage` のモックを使用し、実際のブラウザストレージには依存しない。

### DatasetManager.test.jsx

データセット管理コンポーネントの統合テスト。

- 保存ボタンの表示条件（データ読込前後）
- 保存ダイアログの開閉
- データセット一覧の表示

### App.test.jsx

アプリケーション全体のテスト。

- **ヘルパー関数**: `parseCsv`, `flattenJson`, `rowsToCsv`, `isImageUrl` の入出力検証
- **UI 操作**: ワイドモード切替、アコーディオン開閉、AI プロバイダー切替、ファイルアップロード

---

## テスト設定

### Vitest 設定（vite.config.js）

```js
test: {
  environment: 'jsdom',
  setupFiles: ['./src/test/setup.js'],
}
```

### セットアップファイル（src/test/setup.js）

Testing Library の `jest-dom` マッチャーを拡張している。
`toBeInTheDocument()`, `toHaveTextContent()` 等のカスタムマッチャーが全テストで利用可能。

---

## テストを書くときの方針

- ユーザーの操作に近い粒度でテストする（Testing Library の方針に準拠）
- ストレージ操作は `LocalStorageAdapter` のインターフェースを通じてテストする
- DOM のテストでは `screen.getByText()`, `screen.getByRole()` 等のアクセシブルなクエリを優先する
