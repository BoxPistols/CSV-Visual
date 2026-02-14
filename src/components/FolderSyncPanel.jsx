import React, { useState, useRef } from 'react';
import { FolderOpen, RefreshCw, FileText, FileJson, Upload, X } from 'lucide-react';
import { isSupported, FolderSync } from '../lib/folderSync';

/* ── i18n ── */
const TR = {
  'en-US': {
    folderSync: 'Local Folder Sync',
    selectFolder: 'Select Folder',
    disconnect: 'Disconnect',
    connected: 'Connected',
    autoSync: 'Auto sync',
    loadFile: 'Load',
    noFiles: 'No CSV/JSON files found.',
    notSupported: 'File System Access API not supported. Use file upload above.',
    fallbackSelect: 'Select folder (files)',
    folderName: 'Folder',
  },
  'ja-JP': {
    folderSync: '\u30ed\u30fc\u30ab\u30eb\u30d5\u30a9\u30eb\u30c0\u540c\u671f',
    selectFolder: '\u30d5\u30a9\u30eb\u30c0\u9078\u629e',
    disconnect: '\u5207\u65ad',
    connected: '\u63a5\u7d9a\u4e2d',
    autoSync: '\u81ea\u52d5\u540c\u671f',
    loadFile: '\u8aad\u307f\u8fbc\u307f',
    noFiles: 'CSV/JSON \u30d5\u30a1\u30a4\u30eb\u304c\u898b\u3064\u304b\u308a\u307e\u305b\u3093\u3002',
    notSupported:
      'File System Access API \u975e\u5bfe\u5fdc\u3067\u3059\u3002\u4e0a\u306e\u30d5\u30a1\u30a4\u30eb\u30a2\u30c3\u30d7\u30ed\u30fc\u30c9\u3092\u4f7f\u7528\u3057\u3066\u304f\u3060\u3055\u3044\u3002',
    fallbackSelect: '\u30d5\u30a9\u30eb\u30c0\u9078\u629e\uff08\u30d5\u30a1\u30a4\u30eb\uff09',
    folderName: '\u30d5\u30a9\u30eb\u30c0',
  },
};
const bLoc = navigator.languages?.[0] || navigator.language || 'en-US';
const locale = TR[bLoc] ? bLoc : Object.keys(TR).find((k) => k.startsWith(bLoc.split('-')[0])) || 'en-US';
const t = (k) => TR[locale]?.[k] || TR['en-US'][k] || k;

export default function FolderSyncPanel({ onLoadFile }) {
  const syncRef = useRef(new FolderSync());
  const [connected, setConnected] = useState(false);
  const [folderName, setFolderName] = useState('');
  const [files, setFiles] = useState([]);
  const [autoSync, setAutoSync] = useState(false);
  const [loadingFile, setLoadingFile] = useState(null);
  const fallbackRef = useRef(null);

  const supported = isSupported();

  const handlePick = async () => {
    try {
      const name = await syncRef.current.pickDirectory();
      setFolderName(name);
      setConnected(true);
      const fileList = await syncRef.current.listFiles();
      setFiles(fileList);
    } catch {
      // user cancelled or error
    }
  };

  const handleDisconnect = () => {
    syncRef.current.disconnect();
    setConnected(false);
    setFolderName('');
    setFiles([]);
    setAutoSync(false);
  };

  const handleRefresh = async () => {
    if (!syncRef.current.connected) return;
    const fileList = await syncRef.current.listFiles();
    setFiles(fileList);
  };

  const handleLoadFile = async (fileEntry) => {
    setLoadingFile(fileEntry.name);
    try {
      const { name, text } = await syncRef.current.readFile(fileEntry.handle);
      const ext = name.split('.').pop().toLowerCase();
      const file = new File([text], name, {
        type: ext === 'json' ? 'application/json' : 'text/csv',
      });
      onLoadFile(file);
    } catch {
      // read error
    }
    setLoadingFile(null);
  };

  const handleAutoSyncToggle = () => {
    if (autoSync) {
      syncRef.current.stopAutoSync();
      setAutoSync(false);
    } else {
      syncRef.current.startAutoSync((fileList) => {
        setFiles(fileList);
      });
      setAutoSync(true);
    }
  };

  // Fallback for unsupported browsers
  const handleFallbackChange = (e) => {
    const fileList = Array.from(e.target.files || []);
    const supported = fileList.filter((f) => {
      const name = f.name.toLowerCase();
      return name.endsWith('.csv') || name.endsWith('.json');
    });
    if (supported.length > 0) {
      // Load the first file directly
      onLoadFile(supported[0]);
    }
  };

  const btnStyle = {
    display: 'inline-flex',
    alignItems: 'center',
    gap: 4,
    fontSize: 11,
    padding: '4px 10px',
    borderRadius: 6,
    border: '1px solid var(--border-primary)',
    background: 'var(--bg-primary)',
    cursor: 'pointer',
    color: 'var(--text-primary)',
  };

  return (
    <div
      style={{
        marginTop: 12,
        padding: 12,
        border: '1px solid var(--border-primary)',
        borderRadius: 8,
        background: 'var(--bg-secondary)',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
        <span
          style={{
            fontSize: 12,
            fontWeight: 600,
            color: 'var(--text-primary)',
            display: 'flex',
            alignItems: 'center',
            gap: 6,
          }}
        >
          <FolderOpen size={14} color="var(--accent)" />
          {t('folderSync')}
        </span>
        {connected && (
          <span style={{ fontSize: 11, color: 'var(--success)', display: 'flex', alignItems: 'center', gap: 4 }}>
            {'\u25cf'} {t('connected')}: {folderName}
          </span>
        )}
      </div>

      {!supported ? (
        <div>
          <p style={{ fontSize: 11, color: 'var(--text-muted)', marginBottom: 8 }}>{t('notSupported')}</p>
          <label style={btnStyle}>
            <Upload size={12} />
            {t('fallbackSelect')}
            <input
              ref={fallbackRef}
              type="file"
              multiple
              webkitdirectory=""
              style={{ display: 'none' }}
              onChange={handleFallbackChange}
            />
          </label>
        </div>
      ) : (
        <div>
          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', alignItems: 'center' }}>
            {!connected ? (
              <button
                onClick={handlePick}
                style={{
                  ...btnStyle,
                  background: 'var(--accent)',
                  color: 'var(--text-on-accent)',
                  border: '1px solid var(--accent)',
                }}
              >
                <FolderOpen size={12} />
                {t('selectFolder')}
              </button>
            ) : (
              <>
                <button onClick={handleRefresh} style={btnStyle}>
                  <RefreshCw size={12} />
                </button>
                <label
                  style={{
                    fontSize: 11,
                    color: 'var(--text-primary)',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 4,
                    cursor: 'pointer',
                  }}
                >
                  <input
                    type="checkbox"
                    checked={autoSync}
                    onChange={handleAutoSyncToggle}
                    style={{ accentColor: 'var(--accent)' }}
                  />
                  {t('autoSync')}
                </label>
                <button
                  onClick={handleDisconnect}
                  style={{
                    ...btnStyle,
                    color: 'var(--error-accent)',
                    border: '1px solid var(--error-border)',
                    marginLeft: 'auto',
                  }}
                >
                  <X size={12} />
                  {t('disconnect')}
                </button>
              </>
            )}
          </div>

          {connected && (
            <div style={{ marginTop: 8 }}>
              {files.length === 0 ? (
                <p style={{ fontSize: 11, color: 'var(--text-muted)', padding: 8 }}>{t('noFiles')}</p>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                  {files.map((f) => (
                    <div
                      key={f.name}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        padding: '4px 8px',
                        borderRadius: 6,
                        background: 'var(--bg-primary)',
                        border: '1px solid var(--border-subtle)',
                      }}
                    >
                      <span
                        style={{
                          fontSize: 12,
                          color: 'var(--text-primary)',
                          display: 'flex',
                          alignItems: 'center',
                          gap: 6,
                        }}
                      >
                        {f.type === 'JSON' ? (
                          <FileJson size={14} color="var(--accent)" />
                        ) : (
                          <FileText size={14} color="var(--accent)" />
                        )}
                        {f.name}
                      </span>
                      <button
                        onClick={() => handleLoadFile(f)}
                        disabled={loadingFile === f.name}
                        style={{
                          ...btnStyle,
                          fontSize: 10,
                          padding: '2px 8px',
                          opacity: loadingFile === f.name ? 0.5 : 1,
                        }}
                      >
                        {t('loadFile')}
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
