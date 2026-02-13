/**
 * Storage Adapter - データ永続化の抽象化レイヤー
 *
 * 現在: localStorage
 * 将来: Firebase Firestore, Supabase, etc. に差し替え可能
 *
 * アダプターは以下のインターフェースを実装:
 *   list()                → Dataset[]
 *   getById(id)           → Dataset | null
 *   create(dataset)       → Dataset
 *   update(id, partial)   → Dataset
 *   remove(id)            → void
 *   updateRows(id, rows)  → Dataset
 *   addRow(id, row)       → Dataset
 *   removeRow(id, idx)    → Dataset
 *   updateRow(id, idx, row) → Dataset
 *
 * Dataset 型:
 * {
 *   id: string,
 *   name: string,
 *   description: string,
 *   fileType: 'CSV' | 'JSON',
 *   headers: string[],
 *   rows: Record<string, any>[],
 *   createdAt: string (ISO),
 *   updatedAt: string (ISO),
 * }
 */

const STORAGE_KEY = 'csv_visualizer_datasets';

// ── ユーティリティ ──
const genId = () => `ds_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
const now = () => new Date().toISOString();

// ── localStorage アダプター ──
class LocalStorageAdapter {
  _readAll() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  }

  _writeAll(datasets) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(datasets));
  }

  /** 全データセット一覧 (メタデータのみ、rows は含まない) */
  async list() {
    return this._readAll().map(({ rows, ...meta }) => ({
      ...meta,
      rowCount: rows?.length ?? 0,
    }));
  }

  /** ID で取得 (rows 含む) */
  async getById(id) {
    const all = this._readAll();
    return all.find((d) => d.id === id) || null;
  }

  /** 新規作成 */
  async create({ name, description = '', fileType, headers, rows }) {
    const all = this._readAll();
    const dataset = {
      id: genId(),
      name,
      description,
      fileType,
      headers,
      rows,
      createdAt: now(),
      updatedAt: now(),
    };
    all.push(dataset);
    this._writeAll(all);
    return dataset;
  }

  /** メタデータ更新 (name, description) */
  async update(id, partial) {
    const all = this._readAll();
    const idx = all.findIndex((d) => d.id === id);
    if (idx === -1) throw new Error(`Dataset not found: ${id}`);
    all[idx] = { ...all[idx], ...partial, updatedAt: now() };
    this._writeAll(all);
    return all[idx];
  }

  /** 削除 */
  async remove(id) {
    const all = this._readAll().filter((d) => d.id !== id);
    this._writeAll(all);
  }

  /** rows 全置換 */
  async updateRows(id, rows) {
    return this.update(id, { rows });
  }

  /** 行追加 */
  async addRow(id, row) {
    const ds = await this.getById(id);
    if (!ds) throw new Error(`Dataset not found: ${id}`);
    ds.rows.push(row);
    return this.update(id, { rows: ds.rows });
  }

  /** 行削除 */
  async removeRow(id, rowIndex) {
    const ds = await this.getById(id);
    if (!ds) throw new Error(`Dataset not found: ${id}`);
    ds.rows.splice(rowIndex, 1);
    return this.update(id, { rows: ds.rows });
  }

  /** 行更新 */
  async updateRow(id, rowIndex, row) {
    const ds = await this.getById(id);
    if (!ds) throw new Error(`Dataset not found: ${id}`);
    ds.rows[rowIndex] = row;
    return this.update(id, { rows: ds.rows });
  }

  /** エクスポート (CSV 文字列を返す) */
  async exportCsv(id) {
    const ds = await this.getById(id);
    if (!ds) throw new Error(`Dataset not found: ${id}`);
    const escape = (v) => {
      const s = String(v ?? '');
      return s.includes(',') || s.includes('"') || s.includes('\n')
        ? `"${s.replace(/"/g, '""')}"` : s;
    };
    return [
      ds.headers.join(','),
      ...ds.rows.map((r) => ds.headers.map((h) => escape(r[h])).join(',')),
    ].join('\n');
  }

  /** エクスポート (JSON 文字列を返す) */
  async exportJson(id) {
    const ds = await this.getById(id);
    if (!ds) throw new Error(`Dataset not found: ${id}`);
    return JSON.stringify(ds.rows, null, 2);
  }
}

// ── Firebase アダプター (スケルトン) ──
// class FirebaseAdapter {
//   constructor(db) { this.db = db; this.col = collection(db, 'datasets'); }
//   async list() { /* Firestore query */ }
//   async getById(id) { /* doc(this.col, id) */ }
//   async create(data) { /* addDoc */ }
//   async update(id, partial) { /* updateDoc */ }
//   async remove(id) { /* deleteDoc */ }
//   async updateRows(id, rows) { /* sub-collection or update */ }
//   async addRow(id, row) { /* arrayUnion or sub-collection */ }
//   async removeRow(id, idx) { /* read-modify-write */ }
//   async updateRow(id, idx, row) { /* read-modify-write */ }
// }

// ── エクスポート ──
// 将来切り替え時はここを変えるだけ
// export const storage = new FirebaseAdapter(db);
export const storage = new LocalStorageAdapter();