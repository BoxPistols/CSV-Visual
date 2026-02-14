/**
 * Folder Sync - File System Access API ラッパー
 *
 * ローカルフォルダの CSV/JSON ファイルを読み取り専用で同期
 * 非対応ブラウザ向けに <input webkitdirectory> フォールバックを想定
 */

const SUPPORTED_EXTENSIONS = ['.csv', '.json'];

export function isSupported() {
  return typeof window !== 'undefined' && 'showDirectoryPicker' in window;
}

export class FolderSync {
  constructor() {
    this._dirHandle = null;
    this._intervalId = null;
  }

  get connected() {
    return this._dirHandle !== null;
  }

  get directoryName() {
    return this._dirHandle?.name || '';
  }

  async pickDirectory() {
    if (!isSupported()) {
      throw new Error('File System Access API is not supported in this browser');
    }
    this._dirHandle = await window.showDirectoryPicker({ mode: 'read' });
    return this._dirHandle.name;
  }

  async listFiles() {
    if (!this._dirHandle) return [];
    const files = [];
    for await (const entry of this._dirHandle.values()) {
      if (entry.kind !== 'file') continue;
      const name = entry.name.toLowerCase();
      if (SUPPORTED_EXTENSIONS.some((ext) => name.endsWith(ext))) {
        files.push({
          name: entry.name,
          type: name.endsWith('.json') ? 'JSON' : 'CSV',
          handle: entry,
        });
      }
    }
    return files.sort((a, b) => a.name.localeCompare(b.name));
  }

  async readFile(fileHandle) {
    const file = await fileHandle.getFile();
    const text = await file.text();
    return { name: file.name, text, size: file.size, lastModified: file.lastModified };
  }

  startAutoSync(callback, intervalMs = 5000) {
    this.stopAutoSync();
    this._intervalId = setInterval(async () => {
      if (!this._dirHandle) return;
      try {
        const files = await this.listFiles();
        callback(files);
      } catch {
        // permission revoked or folder deleted
        this.stopAutoSync();
      }
    }, intervalMs);
  }

  stopAutoSync() {
    if (this._intervalId) {
      clearInterval(this._intervalId);
      this._intervalId = null;
    }
  }

  disconnect() {
    this.stopAutoSync();
    this._dirHandle = null;
  }
}
