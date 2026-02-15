import React, { useState } from 'react';
import { Settings2, Eye, EyeOff, Trash2, CheckCircle, XCircle, Loader2 } from 'lucide-react';
import { getKey, setKey, removeKey, testConnection } from '../lib/aiConfig';

/* ── i18n ── */
const TR = {
  'en-US': {
    settingsTitle: 'AI Settings',
    apiKey: 'API Key',
    save: 'Save',
    clear: 'Clear',
    testConnection: 'Test Connection',
    testing: 'Testing...',
    testSuccess: 'Connected successfully',
    testFailed: 'Connection failed',
    noKeySet: 'Not configured (using server proxy)',
    keySet: 'Key saved',
    placeholder: 'Enter API key...',
    close: 'Close',
  },
  'ja-JP': {
    settingsTitle: 'AI \u8a2d\u5b9a',
    apiKey: 'API \u30ad\u30fc',
    save: '\u4fdd\u5b58',
    clear: '\u30af\u30ea\u30a2',
    testConnection: '\u63a5\u7d9a\u30c6\u30b9\u30c8',
    testing: '\u30c6\u30b9\u30c8\u4e2d...',
    testSuccess: '\u63a5\u7d9a\u6210\u529f',
    testFailed: '\u63a5\u7d9a\u5931\u6557',
    noKeySet: '\u672a\u8a2d\u5b9a\uff08\u30b5\u30fc\u30d0\u30fc\u30d7\u30ed\u30ad\u30b7\u4f7f\u7528\uff09',
    keySet: '\u30ad\u30fc\u4fdd\u5b58\u6e08\u307f',
    placeholder: 'API \u30ad\u30fc\u3092\u5165\u529b...',
    close: '\u9589\u3058\u308b',
  },
};
const bLoc = navigator.languages?.[0] || navigator.language || 'en-US';
const locale = TR[bLoc] ? bLoc : Object.keys(TR).find((k) => k.startsWith(bLoc.split('-')[0])) || 'en-US';
const t = (k) => TR[locale]?.[k] || TR['en-US'][k] || k;

const PROVIDERS = [
  { id: 'openai', label: 'OpenAI' },
  { id: 'gemini', label: 'Gemini' },
];

function ProviderKeyRow({ provider }) {
  const [value, setValue] = useState('');
  const [masked, setMasked] = useState(true);
  const [saved, setSaved] = useState(() => getKey(provider.id).length > 0);
  const [testing, setTesting] = useState(false);
  const [testResult, setTestResult] = useState(null);

  const handleSave = () => {
    if (!value.trim()) return;
    setKey(provider.id, value.trim());
    setSaved(true);
    setValue('');
    setTestResult(null);
  };

  const handleClear = () => {
    removeKey(provider.id);
    setSaved(false);
    setValue('');
    setTestResult(null);
  };

  const handleTest = async () => {
    const key = value.trim() || getKey(provider.id);
    if (!key) return;
    setTesting(true);
    setTestResult(null);
    try {
      const result = await testConnection(provider.id, key);
      setTestResult(result);
    } catch {
      setTestResult({ ok: false });
    } finally {
      setTesting(false);
    }
  };

  return (
    <div
      style={{
        padding: 12,
        border: '1px solid var(--border-primary)',
        borderRadius: 8,
        background: 'var(--bg-secondary)',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
        <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)' }}>{provider.label}</span>
        <span style={{ fontSize: 11, color: saved ? 'var(--success)' : 'var(--text-muted)' }}>
          {saved ? t('keySet') : t('noKeySet')}
        </span>
      </div>
      <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
        <div style={{ flex: 1, position: 'relative' }}>
          <input
            type={masked ? 'password' : 'text'}
            value={value}
            onChange={(e) => setValue(e.target.value)}
            placeholder={t('placeholder')}
            style={{
              width: '100%',
              padding: '6px 32px 6px 10px',
              fontSize: 12,
              border: '1px solid var(--border-secondary)',
              borderRadius: 6,
              boxSizing: 'border-box',
              background: 'var(--bg-input)',
              color: 'var(--text-primary)',
            }}
          />
          <button
            onClick={() => setMasked(!masked)}
            style={{
              position: 'absolute',
              right: 6,
              top: '50%',
              transform: 'translateY(-50%)',
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              color: 'var(--text-muted)',
              padding: 2,
            }}
          >
            {masked ? <Eye size={14} /> : <EyeOff size={14} />}
          </button>
        </div>
        <button
          onClick={handleSave}
          disabled={!value.trim()}
          style={{
            fontSize: 11,
            padding: '6px 10px',
            borderRadius: 6,
            border: '1px solid var(--border-primary)',
            background: value.trim() ? 'var(--accent)' : 'var(--bg-badge)',
            color: value.trim() ? 'var(--text-on-accent)' : 'var(--text-muted)',
            cursor: value.trim() ? 'pointer' : 'not-allowed',
            whiteSpace: 'nowrap',
          }}
        >
          {t('save')}
        </button>
        {saved && (
          <button
            onClick={handleClear}
            style={{
              fontSize: 11,
              padding: '6px 8px',
              borderRadius: 6,
              border: '1px solid var(--error-border)',
              background: 'var(--bg-primary)',
              color: 'var(--error-accent)',
              cursor: 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
            }}
          >
            <Trash2 size={12} />
          </button>
        )}
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 8 }}>
        <button
          onClick={handleTest}
          disabled={testing || (!value.trim() && !saved)}
          style={{
            fontSize: 11,
            padding: '4px 10px',
            borderRadius: 6,
            border: '1px solid var(--border-primary)',
            background: 'var(--bg-primary)',
            cursor: testing || (!value.trim() && !saved) ? 'not-allowed' : 'pointer',
            color: 'var(--text-primary)',
            display: 'inline-flex',
            alignItems: 'center',
            gap: 4,
            opacity: testing || (!value.trim() && !saved) ? 0.5 : 1,
          }}
        >
          {testing ? <Loader2 size={12} className="animate-spin" /> : <Settings2 size={12} />}
          {testing ? t('testing') : t('testConnection')}
        </button>
        {testResult && (
          <span
            style={{
              fontSize: 11,
              display: 'inline-flex',
              alignItems: 'center',
              gap: 4,
              color: testResult.ok ? 'var(--success)' : 'var(--error-accent)',
            }}
          >
            {testResult.ok ? <CheckCircle size={12} /> : <XCircle size={12} />}
            {testResult.ok ? t('testSuccess') : t('testFailed')}
          </span>
        )}
      </div>
    </div>
  );
}

export default function SettingsPanel({ onClose }) {
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
      onClick={onClose}
    >
      <div
        style={{
          background: 'var(--bg-primary)',
          borderRadius: 12,
          padding: 24,
          width: '90%',
          maxWidth: 480,
          maxHeight: '80vh',
          overflowY: 'auto',
          boxShadow: '0 8px 32px var(--shadow-heavy)',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
          <h2
            style={{
              fontSize: 16,
              fontWeight: 600,
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              color: 'var(--text-heading)',
            }}
          >
            <Settings2 size={18} color="var(--accent)" />
            {t('settingsTitle')}
          </h2>
          <button
            onClick={onClose}
            style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', fontSize: 18 }}
          >
            {'\u2715'}
          </button>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {PROVIDERS.map((p) => (
            <ProviderKeyRow key={p.id} provider={p} />
          ))}
        </div>
      </div>
    </div>
  );
}
