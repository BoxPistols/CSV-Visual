import React, { useState, useEffect } from 'react';
import { storage } from '../lib/storage';
import { Database, Trash2, Download, Edit3, Check, X, FolderOpen, Plus, Save } from 'lucide-react';

/* ── i18n ── */
const TR = {
  'en-US': {
    savedDatasets: 'Saved Datasets',
    noDatasets: 'No saved datasets yet. Upload a file and save it.',
    save: 'Save to Library',
    saved: 'Saved!',
    load: 'Load',
    delete: 'Delete',
    exportCsv: 'CSV',
    exportJson: 'JSON',
    confirmDelete: 'Delete this dataset?',
    name: 'Name',
    description: 'Description',
    rows: 'rows',
    cols: 'cols',
    updated: 'Updated',
    namePlaceholder: 'Dataset name',
    descPlaceholder: 'Description (optional)',
    addRow: 'Add row',
    saveChanges: 'Save changes',
    cancelEdit: 'Cancel',
    rowEditor: 'Row Editor',
  },
  'ja-JP': {
    savedDatasets: '保存済みデータセット',
    noDatasets: '保存済みのデータセットはありません。ファイルをアップロードして保存してください。',
    save: 'ライブラリに保存',
    saved: '保存しました！',
    load: '読み込み',
    delete: '削除',
    exportCsv: 'CSV',
    exportJson: 'JSON',
    confirmDelete: 'このデータセットを削除しますか？',
    name: '名前',
    description: '説明',
    rows: '行',
    cols: '列',
    updated: '更新日',
    namePlaceholder: 'データセット名',
    descPlaceholder: '説明（任意）',
    addRow: '行を追加',
    saveChanges: '変更を保存',
    cancelEdit: 'キャンセル',
    rowEditor: '行エディター',
  },
};
const bLoc = navigator.languages?.[0] || navigator.language || 'en-US';
const locale = TR[bLoc] ? bLoc : Object.keys(TR).find((k) => k.startsWith(bLoc.split('-')[0])) || 'en-US';
const t = (k) => TR[locale]?.[k] || TR['en-US'][k] || k;

const btnBase = {
  display: 'inline-flex',
  alignItems: 'center',
  gap: 4,
  fontSize: 12,
  padding: '4px 10px',
  borderRadius: 6,
  border: '1px solid var(--border-primary)',
  background: 'var(--bg-primary)',
  cursor: 'pointer',
  color: 'var(--text-primary)',
  transition: 'background 0.15s',
};
const btnPrimary = {
  ...btnBase,
  background: 'var(--accent)',
  color: 'var(--text-on-accent)',
  border: '1px solid var(--accent)',
};
const btnDanger = { ...btnBase, color: 'var(--error-accent)', border: '1px solid var(--error-border)' };

/* ── Row Edit Modal ── */
function RowEditModal({ headers, row, onSave, onCancel }) {
  const [values, setValues] = useState(() => {
    const v = {};
    headers.forEach((h) => {
      v[h] = row ? (row[h] ?? '') : '';
    });
    return v;
  });
  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        background: 'var(--overlay)',
        zIndex: 100,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
      onClick={onCancel}
    >
      <div
        style={{
          background: 'var(--bg-primary)',
          borderRadius: 12,
          padding: 24,
          width: '90%',
          maxWidth: 520,
          maxHeight: '80vh',
          overflowY: 'auto',
          boxShadow: '0 8px 32px var(--shadow-heavy)',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <h3 style={{ fontSize: 16, fontWeight: 600, marginBottom: 16, color: 'var(--text-heading)' }}>
          {t('rowEditor')}
        </h3>
        {headers.map((h) => (
          <div key={h} style={{ marginBottom: 12 }}>
            <label
              style={{
                fontSize: 12,
                fontWeight: 500,
                color: 'var(--text-secondary)',
                display: 'block',
                marginBottom: 4,
              }}
            >
              {h}
            </label>
            <input
              value={values[h]}
              onChange={(e) => setValues((prev) => ({ ...prev, [h]: e.target.value }))}
              style={{
                width: '100%',
                padding: '6px 10px',
                fontSize: 13,
                border: '1px solid var(--border-secondary)',
                borderRadius: 6,
                boxSizing: 'border-box',
                background: 'var(--bg-input)',
                color: 'var(--text-primary)',
              }}
            />
          </div>
        ))}
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8, marginTop: 16 }}>
          <button style={btnBase} onClick={onCancel}>
            <X size={14} />
            {t('cancelEdit')}
          </button>
          <button style={btnPrimary} onClick={() => onSave(values)}>
            <Check size={14} />
            {t('saveChanges')}
          </button>
        </div>
      </div>
    </div>
  );
}

/* ── Save Dialog ── */
function SaveDialog({ defaultName, onSave, onCancel }) {
  const [name, setName] = useState(defaultName || '');
  const [desc, setDesc] = useState('');
  return (
    <div
      style={{
        background: 'var(--bg-secondary)',
        border: '1px solid var(--border-primary)',
        borderRadius: 8,
        padding: 16,
        marginTop: 12,
      }}
    >
      <div style={{ marginBottom: 8 }}>
        <label style={{ fontSize: 12, fontWeight: 500, color: 'var(--text-secondary)' }}>{t('name')}</label>
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder={t('namePlaceholder')}
          style={{
            width: '100%',
            padding: '6px 10px',
            fontSize: 13,
            border: '1px solid var(--border-secondary)',
            borderRadius: 6,
            marginTop: 4,
            boxSizing: 'border-box',
            background: 'var(--bg-input)',
            color: 'var(--text-primary)',
          }}
        />
      </div>
      <div style={{ marginBottom: 12 }}>
        <label style={{ fontSize: 12, fontWeight: 500, color: 'var(--text-secondary)' }}>{t('description')}</label>
        <input
          value={desc}
          onChange={(e) => setDesc(e.target.value)}
          placeholder={t('descPlaceholder')}
          style={{
            width: '100%',
            padding: '6px 10px',
            fontSize: 13,
            border: '1px solid var(--border-secondary)',
            borderRadius: 6,
            marginTop: 4,
            boxSizing: 'border-box',
            background: 'var(--bg-input)',
            color: 'var(--text-primary)',
          }}
        />
      </div>
      <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
        <button style={btnBase} onClick={onCancel}>
          <X size={14} />
          {t('cancelEdit')}
        </button>
        <button
          style={btnPrimary}
          onClick={() => name.trim() && onSave(name.trim(), desc.trim())}
          disabled={!name.trim()}
        >
          <Save size={14} />
          {t('save')}
        </button>
      </div>
    </div>
  );
}

/* ── Dataset List ── */
function DatasetList({ onLoad, refreshKey }) {
  const [datasets, setDatasets] = useState([]);
  const [renaming, setRenaming] = useState(null);
  const [renameVal, setRenameVal] = useState('');

  useEffect(() => {
    storage.list().then(setDatasets);
  }, [refreshKey]);

  const handleDelete = async (id) => {
    if (!window.confirm(t('confirmDelete'))) return;
    await storage.remove(id);
    storage.list().then(setDatasets);
  };
  const handleExport = async (id, format) => {
    const data = format === 'csv' ? await storage.exportCsv(id) : await storage.exportJson(id);
    const blob = new Blob([data], { type: format === 'csv' ? 'text/csv' : 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `export.${format}`;
    a.click();
    URL.revokeObjectURL(url);
  };
  const handleRename = async (id) => {
    if (renameVal.trim()) {
      await storage.update(id, { name: renameVal.trim() });
      storage.list().then(setDatasets);
    }
    setRenaming(null);
  };

  if (!datasets.length) {
    return (
      <div style={{ padding: 24, textAlign: 'center', color: 'var(--text-muted)', fontSize: 13 }}>
        <Database size={32} style={{ margin: '0 auto 8px', opacity: 0.4 }} />
        <p>{t('noDatasets')}</p>
      </div>
    );
  }
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
      {datasets.map((ds) => (
        <div
          key={ds.id}
          style={{
            border: '1px solid var(--border-primary)',
            borderRadius: 8,
            padding: 12,
            background: 'var(--bg-primary)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8 }}>
            <div style={{ flex: 1, minWidth: 0 }}>
              {renaming === ds.id ? (
                <div style={{ display: 'flex', gap: 4, alignItems: 'center' }}>
                  <input
                    value={renameVal}
                    onChange={(e) => setRenameVal(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') handleRename(ds.id);
                      if (e.key === 'Escape') setRenaming(null);
                    }}
                    autoFocus
                    style={{
                      flex: 1,
                      padding: '2px 8px',
                      fontSize: 13,
                      border: '1px solid var(--accent)',
                      borderRadius: 4,
                      background: 'var(--bg-input)',
                      color: 'var(--text-primary)',
                    }}
                  />
                  <button style={{ ...btnBase, padding: 4 }} onClick={() => handleRename(ds.id)}>
                    <Check size={14} />
                  </button>
                  <button style={{ ...btnBase, padding: 4 }} onClick={() => setRenaming(null)}>
                    <X size={14} />
                  </button>
                </div>
              ) : (
                <div>
                  <span style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-heading)' }}>{ds.name}</span>
                  {ds.description && (
                    <p style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 2 }}>{ds.description}</p>
                  )}
                  <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 4, display: 'flex', gap: 8 }}>
                    <span style={{ padding: '1px 6px', borderRadius: 4, background: 'var(--bg-badge)' }}>
                      {ds.fileType}
                    </span>
                    <span>
                      {ds.rowCount.toLocaleString()} {t('rows')}
                    </span>
                    <span>
                      {ds.colCount ?? ds.headers?.length ?? '?'} {t('cols')}
                    </span>
                    <span>
                      {t('updated')}: {new Date(ds.updatedAt).toLocaleDateString(locale)}
                    </span>
                  </div>
                </div>
              )}
            </div>
            <div style={{ display: 'flex', gap: 4, flexShrink: 0 }}>
              <button style={btnPrimary} onClick={() => onLoad(ds.id)}>
                <FolderOpen size={14} />
                {t('load')}
              </button>
              <button
                style={btnBase}
                onClick={() => {
                  setRenaming(ds.id);
                  setRenameVal(ds.name);
                }}
              >
                <Edit3 size={14} />
              </button>
              <button style={btnBase} onClick={() => handleExport(ds.id, 'csv')}>
                <Download size={14} />
                {t('exportCsv')}
              </button>
              <button style={btnBase} onClick={() => handleExport(ds.id, 'json')}>
                <Download size={14} />
                {t('exportJson')}
              </button>
              <button style={btnDanger} onClick={() => handleDelete(ds.id)}>
                <Trash2 size={14} />
              </button>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

/* ── Exported: DatasetManager ── */
export default function DatasetManager({ headers, rows, fileInfo, onLoad, onRowAdd }) {
  const [showSave, setShowSave] = useState(false);
  const [justSaved, setJustSaved] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);
  const [activeId, setActiveId] = useState(null);
  const [editModal, setEditModal] = useState(null);

  const hasData = headers.length > 0 && rows.length > 0;

  const handleSave = async (name, description) => {
    await storage.create({ name, description, fileType: fileInfo?.type || 'CSV', headers, rows });
    setShowSave(false);
    setJustSaved(true);
    setRefreshKey((k) => k + 1);
    setTimeout(() => setJustSaved(false), 2000);
  };
  const handleLoad = async (id) => {
    const ds = await storage.getById(id);
    if (ds) {
      setActiveId(id);
      onLoad(ds);
    }
  };
  const handleRowSave = async (values) => {
    if (editModal === 'new') {
      if (activeId) await storage.addRow(activeId, values);
      onRowAdd(values);
    }
    setEditModal(null);
    setRefreshKey((k) => k + 1);
  };

  return (
    <div>
      {hasData && !showSave && (
        <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginBottom: 12 }}>
          <button
            style={
              justSaved
                ? { ...btnBase, color: 'var(--success)', border: '1px solid var(--success-border)' }
                : btnPrimary
            }
            onClick={() => setShowSave(true)}
            disabled={justSaved}
          >
            {justSaved ? (
              <>
                <Check size={14} />
                {t('saved')}
              </>
            ) : (
              <>
                <Save size={14} />
                {t('save')}
              </>
            )}
          </button>
          <button style={btnBase} onClick={() => setEditModal('new')}>
            <Plus size={14} />
            {t('addRow')}
          </button>
        </div>
      )}
      {showSave && (
        <SaveDialog
          defaultName={fileInfo?.name?.replace(/\.\w+$/, '') || ''}
          onSave={handleSave}
          onCancel={() => setShowSave(false)}
        />
      )}
      <details style={{ marginTop: 16 }}>
        <summary
          style={{
            fontSize: 13,
            fontWeight: 600,
            color: 'var(--text-secondary)',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: 6,
            userSelect: 'none',
          }}
        >
          <Database size={16} />
          {t('savedDatasets')}
        </summary>
        <div style={{ marginTop: 8 }}>
          <DatasetList onLoad={handleLoad} refreshKey={refreshKey} />
        </div>
      </details>
      {editModal && (
        <RowEditModal
          headers={headers}
          row={editModal === 'new' ? null : editModal.row}
          onSave={handleRowSave}
          onCancel={() => setEditModal(null)}
        />
      )}
    </div>
  );
}
