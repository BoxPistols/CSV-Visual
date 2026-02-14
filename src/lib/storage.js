/**
 * Storage Adapter - データ永続化の抽象化レイヤー
 *
 * 現在: localStorage
 * 将来: Firebase Firestore, Supabase, etc. に差し替え可能
 */

const STORAGE_KEY = 'csv_visualizer_datasets';

const genId = () => `ds_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
const now = () => new Date().toISOString();

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

  async list() {
    return this._readAll().map(({ rows, ...meta }) => ({
      ...meta,
      rowCount: rows?.length ?? 0,
    }));
  }

  async getById(id) {
    const all = this._readAll();
    return all.find((d) => d.id === id) || null;
  }

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

  async update(id, partial) {
    const all = this._readAll();
    const idx = all.findIndex((d) => d.id === id);
    if (idx === -1) throw new Error(`Dataset not found: ${id}`);
    all[idx] = { ...all[idx], ...partial, updatedAt: now() };
    this._writeAll(all);
    return all[idx];
  }

  async remove(id) {
    const all = this._readAll().filter((d) => d.id !== id);
    this._writeAll(all);
  }

  async updateRows(id, rows) {
    return this.update(id, { rows });
  }

  async addRow(id, row) {
    const ds = await this.getById(id);
    if (!ds) throw new Error(`Dataset not found: ${id}`);
    ds.rows.push(row);
    return this.update(id, { rows: ds.rows });
  }

  async removeRow(id, rowIndex) {
    const ds = await this.getById(id);
    if (!ds) throw new Error(`Dataset not found: ${id}`);
    ds.rows.splice(rowIndex, 1);
    return this.update(id, { rows: ds.rows });
  }

  async updateRow(id, rowIndex, row) {
    const ds = await this.getById(id);
    if (!ds) throw new Error(`Dataset not found: ${id}`);
    ds.rows[rowIndex] = row;
    return this.update(id, { rows: ds.rows });
  }

  async exportCsv(id) {
    const ds = await this.getById(id);
    if (!ds) throw new Error(`Dataset not found: ${id}`);
    const escape = (v) => {
      const s = String(v ?? '');
      return s.includes(',') || s.includes('"') || s.includes('\n') ? `"${s.replace(/"/g, '""')}"` : s;
    };
    return [ds.headers.join(','), ...ds.rows.map((r) => ds.headers.map((h) => escape(r[h])).join(','))].join('\n');
  }

  async exportJson(id) {
    const ds = await this.getById(id);
    if (!ds) throw new Error(`Dataset not found: ${id}`);
    return JSON.stringify(ds.rows, null, 2);
  }
}

export const storage = new LocalStorageAdapter();
