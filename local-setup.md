#!/bin/bash
# ============================================
# CSV/JSON Data Visualizer - ローカル環境構築
# ============================================

# 1. プロジェクト作成
npm create vite@latest csv-visualizer -- --template react
cd csv-visualizer

# 2. 依存パッケージ
npm install
npm install recharts lucide-react

# 3. ディレクトリ作成
mkdir -p src/lib src/components

# 4. ファイル配置 (各アーティファクトの内容をコピー)
#    src/App.jsx                    ← メインコンポーネント
#    src/index.css                  ← リセットCSS
#    src/lib/storage.js             ← ストレージ抽象化レイヤー
#    src/components/DatasetManager.jsx ← CRUD管理UI
#    vite.config.js                 ← APIプロキシ設定

# 5. .env ファイル作成
cat > .env << 'EOF'
VITE_ANTHROPIC_API_KEY=your-api-key-here
EOF

# 6. 起動
npm run dev
# → http://localhost:5173

# ============================================
# ディレクトリ構成
# ============================================
# csv-visualizer/
# ├── .env                          ← APIキー (gitignore推奨)
# ├── vite.config.js                ← Anthropic API proxy
# ├── package.json
# └── src/
#     ├── main.jsx                  ← Vite生成のまま
#     ├── index.css                 ← リセット + spinner
#     ├── App.jsx                   ← メイン (テーブル・分析・CRUD統合)
#     ├── lib/
#     │   └── storage.js            ← データ永続化 (現: localStorage)
#     └── components/
#         └── DatasetManager.jsx    ← 保存・読込・編集・削除UI
#
# ============================================
# CRUD 機能
# ============================================
# ■ Create : ファイルアップロード後「ライブラリに保存」
# ■ Read   : 「保存済みデータセット」から読み込み
# ■ Update : テーブル行の✏️ボタンで編集、「行を追加」で新規行
# ■ Delete : テーブル行の🗑ボタンで行削除、ライブラリから全削除
# ■ Export : CSV / JSON でダウンロード
#
# ============================================
# Firebase 移行ガイド
# ============================================
# 1. npm install firebase
#
# 2. src/lib/firebase.js を作成:
#    import { initializeApp } from 'firebase/app';
#    import { getFirestore } from 'firebase/firestore';
#    const app = initializeApp({ /* config */ });
#    export const db = getFirestore(app);
#
# 3. src/lib/storage.js の末尾を差し替え:
#    - export const storage = new LocalStorageAdapter();
#    + import { db } from './firebase';
#    + export const storage = new FirebaseAdapter(db);
#
# 4. FirebaseAdapter クラスのスケルトンが
#    storage.js 内にコメントで用意済み。
#    Firestore の addDoc/updateDoc/deleteDoc で実装。
#
# ============================================
# 注意事項
# ============================================
# ・localStorage の容量上限は約 5MB
#   大きなデータセットは Firebase/Supabase 推奨
# ・本番では API キーをフロントに置かず
#   バックエンド (Express, Next.js API Routes 等) 経由に
# ・storage.js のインターフェースが共通なので
#   Supabase, PocketBase 等への移行も同じパターンで可能