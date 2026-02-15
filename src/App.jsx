import React, { useState, useMemo, useRef, useEffect, useCallback, forwardRef, useImperativeHandle } from 'react';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import {
  Upload,
  FileText,
  Loader2,
  FileJson,
  Download,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  ChevronUp,
  ChevronDown,
  Settings2,
  GripVertical,
  Edit3,
  Trash2,
  Bot,
  Maximize2,
  Minimize2,
  Search,
  X,
  Moon,
  Sun,
  Monitor,
  AArrowUp,
  AArrowDown,
} from 'lucide-react';
import DatasetManager from './components/DatasetManager';
import SettingsPanel from './components/SettingsPanel';
import FolderSyncPanel from './components/FolderSyncPanel';
import { getGlobalState, setGlobalState, getDatasetState, setDatasetState } from './lib/viewState';
import { getKey, hasKey } from './lib/aiConfig';

/* ── AI Provider Config ── */
const AI_PROVIDERS = {
  openai: {
    label: 'OpenAI',
    models: [
      { id: 'gpt-5-nano', label: 'GPT-5 Nano (default)' },
      { id: 'gpt-5-mini', label: 'GPT-5 Mini' },
      { id: 'gpt-4.1-mini', label: 'GPT-4.1 Mini' },
      { id: 'gpt-4.1-nano', label: 'GPT-4.1 Nano' },
    ],
    defaultModel: 'gpt-5-nano',
  },
  gemini: {
    label: 'Gemini',
    models: [
      { id: 'gemini-2.5-flash', label: 'Gemini 2.5 Flash' },
      { id: 'gemini-2.5-pro', label: 'Gemini 2.5 Pro' },
      { id: 'gemini-2.0-flash', label: 'Gemini 2.0 Flash' },
    ],
    defaultModel: 'gemini-2.5-flash',
  },
};

/* ── Theme Cycle ── */
const THEME_CYCLE = ['auto', 'dark', 'light'];
const THEME_ICON = { auto: Monitor, dark: Moon, light: Sun };

/* ── Font Size ── */
const FONT_SIZES = ['s', 'm', 'l'];
const FONT_LABELS = { s: 'S', m: 'M', l: 'L' };

/* ── i18n ── */
const TR = {
  'en-US': {
    pageTitle: 'CSV / JSON Data Visualizer',
    instructionsText: 'Upload your CSV or JSON file to get started. Describe what you want to know in plain language.',
    uploadText: 'Drop CSV or JSON file here, or click to upload',
    sampleDataLink: "Don't have a file? Try with sample data",
    sampleDataUrl: 'https://www.realtor.com/research/data',
    dataPreviewTitle: 'Data Preview',
    analysisRequestTitle: 'Analysis Request',
    analysisPlaceholder: 'Describe the analysis you want to run...',
    runAnalysisButton: 'Run Analysis',
    processingButton: 'Processing...',
    planningAnalysis: 'Planning analysis...',
    calculatingResults: 'Calculating results...',
    errorReadingFile: 'Error reading file: ',
    errorUnsupportedFormat: 'Unsupported format. Upload CSV or JSON.',
    errorUploadAndQuery: 'Please upload a file and enter a query.',
    errorDuringAnalysis: 'Error during analysis: ',
    barChart: 'Bar Chart',
    lineChart: 'Line Chart',
    tableResults: 'Table Results',
    countResult: 'Count Result',
    rows: 'rows',
    columns: 'columns',
    submitHint: '\u2318+Enter to submit',
    submitHintWin: 'Ctrl+Enter to submit',
    rowsPerPage: 'Rows / page',
    pageOf: 'of',
    showing: 'Showing',
    to: '\u2013',
    totalRows: 'rows',
    all: 'All',
    colSettings: 'Column settings',
    showAll: 'Show all',
    hideAll: 'Hide all',
    resetOrder: 'Reset order',
    actions: 'Actions',
    aiProvider: 'AI Provider',
    aiModel: 'Model',
    dataManagement: 'Data Management',
    exportCurrentJson: 'Export JSON (Current View)',
    settings: 'Settings',
    search: 'Search',
    searchPlaceholder: 'Search all columns...',
    matchCount: '{matched} of {total}',
    maxRows: 'Max rows',
    noLimit: 'No limit',
    limited: 'Limited to {n}',
    themeAuto: 'Auto',
    themeLight: 'Light',
    themeDark: 'Dark',
    fontSizeSmall: 'Small',
    fontSizeMedium: 'Medium',
    fontSizeLarge: 'Large',
    fontSize: 'Font size',
  },
  'ja-JP': {
    pageTitle: 'CSV / JSON \u30c7\u30fc\u30bf\u30d3\u30b8\u30e5\u30a2\u30e9\u30a4\u30b6\u30fc',
    instructionsText:
      'CSV\u307e\u305f\u306fJSON\u30d5\u30a1\u30a4\u30eb\u3092\u30a2\u30c3\u30d7\u30ed\u30fc\u30c9\u3057\u3001\u81ea\u7136\u306a\u65e5\u672c\u8a9e\u3067\u5206\u6790\u5185\u5bb9\u3092\u5165\u529b\u3057\u3066\u304f\u3060\u3055\u3044\u3002',
    uploadText:
      'CSV / JSON \u30d5\u30a1\u30a4\u30eb\u3092\u30c9\u30ed\u30c3\u30d7\u3001\u307e\u305f\u306f\u30af\u30ea\u30c3\u30af',
    sampleDataLink: '\u30b5\u30f3\u30d7\u30eb\u30c7\u30fc\u30bf\u3092\u304a\u8a66\u3057\u304f\u3060\u3055\u3044',
    sampleDataUrl: 'https://www.realtor.com/research/data',
    dataPreviewTitle: '\u30c7\u30fc\u30bf\u30d7\u30ec\u30d3\u30e5\u30fc',
    analysisRequestTitle: '\u5206\u6790\u30ea\u30af\u30a8\u30b9\u30c8',
    analysisPlaceholder: '\u5b9f\u884c\u3057\u305f\u3044\u5206\u6790\u5185\u5bb9\u3092\u5165\u529b\u2026',
    runAnalysisButton: '\u5206\u6790\u3092\u5b9f\u884c',
    processingButton: '\u51e6\u7406\u4e2d\u2026',
    planningAnalysis: '\u5206\u6790\u3092\u8a08\u753b\u4e2d\u2026',
    calculatingResults: '\u7d50\u679c\u3092\u8a08\u7b97\u4e2d\u2026',
    errorReadingFile: '\u8aad\u307f\u8fbc\u307f\u30a8\u30e9\u30fc: ',
    errorUnsupportedFormat:
      '\u672a\u5bfe\u5fdc\u306e\u5f62\u5f0f\u3067\u3059\u3002CSV/JSON\u3092\u30a2\u30c3\u30d7\u30ed\u30fc\u30c9\u3057\u3066\u304f\u3060\u3055\u3044\u3002',
    errorUploadAndQuery:
      '\u30d5\u30a1\u30a4\u30eb\u3068\u5206\u6790\u5185\u5bb9\u3092\u5165\u529b\u3057\u3066\u304f\u3060\u3055\u3044\u3002',
    errorDuringAnalysis: '\u5206\u6790\u30a8\u30e9\u30fc: ',
    barChart: '\u68d2\u30b0\u30e9\u30d5',
    lineChart: '\u6298\u308c\u7dda\u30b0\u30e9\u30d5',
    tableResults: '\u30c6\u30fc\u30d6\u30eb\u7d50\u679c',
    countResult: '\u96c6\u8a08\u7d50\u679c',
    rows: '\u884c',
    columns: '\u5217',
    submitHint: '\u2318+Enter\u3067\u9001\u4fe1',
    submitHintWin: 'Ctrl+Enter\u3067\u9001\u4fe1',
    rowsPerPage: '\u8868\u793a\u4ef6\u6570',
    pageOf: '/',
    showing: '',
    to: '\u2013',
    totalRows: '\u4ef6\u4e2d',
    all: '\u3059\u3079\u3066',
    colSettings: '\u30ab\u30e9\u30e0\u8a2d\u5b9a',
    showAll: '\u3059\u3079\u3066\u8868\u793a',
    hideAll: '\u3059\u3079\u3066\u975e\u8868\u793a',
    resetOrder: '\u9806\u5e8f\u30ea\u30bb\u30c3\u30c8',
    actions: '\u64cd\u4f5c',
    aiProvider: 'AI\u30d7\u30ed\u30d0\u30a4\u30c0\u30fc',
    aiModel: '\u30e2\u30c7\u30eb',
    dataManagement: '\u30c7\u30fc\u30bf\u7ba1\u7406',
    exportCurrentJson: 'JSON\u51fa\u529b\uff08\u73fe\u5728\u306e\u8868\u793a\uff09',
    settings: '\u8a2d\u5b9a',
    search: '\u691c\u7d22',
    searchPlaceholder: '\u5168\u5217\u3092\u691c\u7d22...',
    matchCount: '{total}\u4ef6\u4e2d{matched}\u4ef6',
    maxRows: '\u6700\u5927\u8868\u793a\u4ef6\u6570',
    noLimit: '\u5236\u9650\u306a\u3057',
    limited: '{n}\u4ef6\u306b\u5236\u9650\u4e2d',
    themeAuto: '\u81ea\u52d5',
    themeLight: '\u30e9\u30a4\u30c8',
    themeDark: '\u30c0\u30fc\u30af',
    fontSizeSmall: '\u5c0f',
    fontSizeMedium: '\u4e2d',
    fontSizeLarge: '\u5927',
    fontSize: '\u6587\u5b57\u30b5\u30a4\u30ba',
  },
};
const bLoc = navigator.languages?.[0] || navigator.language || 'en-US';
const locale = TR[bLoc] ? bLoc : Object.keys(TR).find((k) => k.startsWith(bLoc.split('-')[0])) || 'en-US';
const t = (k) => TR[locale]?.[k] || TR['en-US'][k] || k;
const isJa = locale.startsWith('ja');

/* ── Helpers ── */
const flattenJson = (json) => {
  let a = Array.isArray(json) ? json : json.data || json.results || json.items || json.records || [json];
  if (!Array.isArray(a)) a = [a];
  return a.map((item) => {
    const row = {};
    const walk = (o, p) => {
      for (const [k, v] of Object.entries(o || {})) {
        const key = p ? `${p}.${k}` : k;
        if (v && typeof v === 'object' && !Array.isArray(v)) walk(v, key);
        else row[key] = Array.isArray(v) ? v.join(', ') : v;
      }
    };
    walk(item, '');
    return row;
  });
};
const rowsToCsv = (rows, headers) => {
  if (!rows.length) return '';
  const h = headers || [...new Set(rows.flatMap((r) => Object.keys(r)))];
  return [
    h.join(','),
    ...rows.map((r) =>
      h
        .map((k) => {
          const s = String(r[k] ?? '');
          return s.includes(',') || s.includes('"') || s.includes('\n') ? `"${s.replace(/"/g, '""')}"` : s;
        })
        .join(','),
    ),
  ].join('\n');
};
const parseCsv = (text) => {
  const lines = text.trim().split('\n');
  const h = lines[0].split(',').map((s) => s.trim().replace(/^"|"$/g, ''));
  const rows = [];
  for (let i = 1; i < lines.length; i++) {
    const v = lines[i].split(',').map((s) => s.trim().replace(/^"|"$/g, ''));
    const row = {};
    h.forEach((k, j) => {
      row[k] = v[j] || '';
    });
    rows.push(row);
  }
  return { h, rows };
};

/* ── Image URL detection ── */
const IMG_EXT_RE = /\.(jpe?g|png|gif|webp|svg|bmp|ico|avif)(\?.*)?$/i;
const IMG_HOST_RE = /pbs\.twimg\.com|instagram\..+\/p\/|i\.imgur\.com|images\.unsplash\.com|cdn\.discordapp\.com/;
function isImageUrl(url) {
  try {
    return IMG_EXT_RE.test(url) || IMG_HOST_RE.test(url);
  } catch {
    return false;
  }
}

/* ── URL Hover Preview ── */
function LinkWithPreview({ href, children }) {
  const [show, setShow] = useState(false);
  const [pos, setPos] = useState({ x: 0, y: 0 });
  const timer = useRef(null);
  const isImg = isImageUrl(href);

  const onEnter = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    setPos({ x: rect.left, y: rect.bottom + 4 });
    timer.current = setTimeout(() => setShow(true), 400);
  };
  const onLeave = () => {
    clearTimeout(timer.current);
    setShow(false);
  };

  return (
    <span style={{ position: 'relative', display: 'inline' }} onMouseEnter={onEnter} onMouseLeave={onLeave}>
      <a
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        style={{ color: 'var(--link)', textDecoration: 'underline' }}
      >
        {children}
      </a>
      {show && (
        <div
          style={{
            position: 'fixed',
            left: Math.min(pos.x, window.innerWidth - 340),
            top: pos.y,
            zIndex: 9999,
            background: 'var(--bg-primary)',
            border: '1px solid var(--border-primary)',
            borderRadius: 8,
            boxShadow: '0 8px 24px var(--shadow-heavy)',
            overflow: 'hidden',
            width: isImg ? 'auto' : 320,
            maxWidth: 400,
            maxHeight: 280,
          }}
        >
          {isImg ? (
            <img
              src={href}
              alt=""
              style={{ maxWidth: 380, maxHeight: 260, display: 'block', borderRadius: 6 }}
              onError={(e) => {
                e.currentTarget.style.display = 'none';
              }}
            />
          ) : (
            <div style={{ padding: 10, fontSize: 11, color: 'var(--text-tertiary)' }}>
              <div
                style={{
                  fontWeight: 600,
                  marginBottom: 4,
                  color: 'var(--text-primary)',
                  wordBreak: 'break-all',
                  fontSize: 12,
                }}
              >
                {href}
              </div>
              <div style={{ color: 'var(--text-muted)' }}>
                {isJa ? '\u65b0\u3057\u3044\u30bf\u30d6\u3067\u958b\u304f \u2192' : 'Open in new tab \u2192'}
              </div>
            </div>
          )}
        </div>
      )}
    </span>
  );
}

/* ── CellValue (image thumbnail + URL preview) ── */
function CellValue({ value }) {
  const s = String(value ?? '');
  const re = /(https?:\/\/[^\s,)"'<>]+)/;

  // Multiple URLs separated by spaces (e.g. media URLs)
  const urls = s.match(new RegExp(re.source, 'g'));

  // If all content is image URLs, render as thumbnail gallery
  if (urls && urls.length > 0 && urls.every((u) => isImageUrl(u))) {
    return (
      <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
        {urls.map((url, i) => (
          <a key={i} href={url} target="_blank" rel="noopener noreferrer">
            <img
              src={url}
              alt=""
              style={{
                width: 40,
                height: 40,
                objectFit: 'cover',
                borderRadius: 4,
                border: '1px solid var(--border-primary)',
                cursor: 'pointer',
                transition: 'transform 0.15s',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'scale(2.5)';
                e.currentTarget.style.zIndex = '100';
                e.currentTarget.style.position = 'relative';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = '';
                e.currentTarget.style.zIndex = '';
                e.currentTarget.style.position = '';
              }}
              onError={(e) => {
                e.currentTarget.style.display = 'none';
              }}
            />
          </a>
        ))}
      </div>
    );
  }

  if (!re.test(s)) return s;

  return (
    <span>
      {s.split(re).map((part, i) =>
        re.test(part) ? (
          <LinkWithPreview key={i} href={part}>
            {part}
          </LinkWithPreview>
        ) : (
          part
        ),
      )}
    </span>
  );
}

/* ── Pagination ── */
const PG_SIZES = [10, 25, 50, 100];
function PgBtn({ onClick, disabled, children }) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      style={{
        padding: 4,
        borderRadius: 4,
        cursor: disabled ? 'not-allowed' : 'pointer',
        opacity: disabled ? 0.3 : 1,
        background: 'none',
        border: 'none',
        color: 'var(--text-tertiary)',
      }}
    >
      {children}
    </button>
  );
}
function Pagination({ total, page, size, onPage, onSize }) {
  const pages = size === 'all' ? 1 : Math.ceil(total / size);
  const eff = size === 'all' ? total : size;
  const s = (page - 1) * eff + 1,
    e = Math.min(page * eff, total);
  const info = isJa
    ? `${total.toLocaleString(locale)}${t('totalRows')} ${s.toLocaleString(locale)}${t('to')}${e.toLocaleString(locale)}${t('rows')}`
    : `${t('showing')} ${s.toLocaleString(locale)}${t('to')}${e.toLocaleString(locale)} ${t('pageOf')} ${total.toLocaleString(locale)} ${t('totalRows')}`;
  return (
    <div
      style={{
        display: 'flex',
        flexWrap: 'wrap',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: 12,
        marginTop: 12,
        fontSize: 12,
        color: 'var(--text-tertiary)',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <span>{t('rowsPerPage')}:</span>
        <select
          value={size}
          onChange={(ev) => {
            onSize(ev.target.value === 'all' ? 'all' : Number(ev.target.value));
            onPage(1);
          }}
          style={{
            padding: '2px 6px',
            border: '1px solid var(--border-secondary)',
            borderRadius: 4,
            fontSize: 12,
            background: 'var(--bg-input)',
            color: 'var(--text-primary)',
          }}
        >
          {PG_SIZES.map((n) => (
            <option key={n} value={n}>
              {n}
            </option>
          ))}
          <option value="all">{t('all')}</option>
        </select>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
        <span style={{ color: 'var(--text-muted)', marginRight: 4 }}>{info}</span>
        {size !== 'all' && pages > 1 && (
          <>
            <PgBtn onClick={() => onPage(1)} disabled={page <= 1}>
              <ChevronsLeft size={16} />
            </PgBtn>
            <PgBtn onClick={() => onPage(page - 1)} disabled={page <= 1}>
              <ChevronLeft size={16} />
            </PgBtn>
            <span style={{ padding: '0 8px', fontVariantNumeric: 'tabular-nums' }}>
              {page} {t('pageOf')} {pages}
            </span>
            <PgBtn onClick={() => onPage(page + 1)} disabled={page >= pages}>
              <ChevronRight size={16} />
            </PgBtn>
            <PgBtn onClick={() => onPage(pages)} disabled={page >= pages}>
              <ChevronsRight size={16} />
            </PgBtn>
          </>
        )}
      </div>
    </div>
  );
}

/* ── Row Edit Modal (standalone component) ── */
function RowEditModal({ editModal, headers, isJa, onClose, onAdd, onUpdate }) {
  const isNew = editModal === 'new';
  const [vals, setVals] = useState(() => {
    const v = {};
    headers.forEach((h) => {
      v[h] = isNew ? '' : (editModal.row?.[h] ?? '');
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
      onClick={onClose}
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
          {isNew ? (isJa ? '\u884c\u3092\u8ffd\u52a0' : 'Add Row') : isJa ? '\u884c\u3092\u7de8\u96c6' : 'Edit Row'}
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
              value={vals[h]}
              onChange={(e) => setVals((prev) => ({ ...prev, [h]: e.target.value }))}
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
          <button
            style={{
              padding: '6px 14px',
              fontSize: 13,
              border: '1px solid var(--border-primary)',
              borderRadius: 6,
              background: 'var(--bg-primary)',
              cursor: 'pointer',
              color: 'var(--text-primary)',
            }}
            onClick={onClose}
          >
            {isJa ? '\u30ad\u30e3\u30f3\u30bb\u30eb' : 'Cancel'}
          </button>
          <button
            style={{
              padding: '6px 14px',
              fontSize: 13,
              border: 'none',
              borderRadius: 6,
              background: 'var(--accent)',
              color: 'var(--text-on-accent)',
              cursor: 'pointer',
            }}
            onClick={() => {
              if (isNew) onAdd(vals);
              else onUpdate(editModal.rowIndex, vals);
              onClose();
            }}
          >
            {isJa ? '\u4fdd\u5b58' : 'Save'}
          </button>
        </div>
      </div>
    </div>
  );
}

/* ── Column Settings Panel ── */
function ColPanel({ cols, onToggle, onToggleAll, onReorder, onReset, onClose }) {
  const dragFrom = useRef(null),
    dragTo = useRef(null);
  return (
    <div
      style={{
        position: 'absolute',
        right: 0,
        top: 32,
        zIndex: 50,
        background: 'var(--bg-primary)',
        border: '1px solid var(--border-primary)',
        borderRadius: 8,
        boxShadow: '0 4px 12px var(--shadow)',
        padding: 12,
        minWidth: 220,
        maxHeight: 320,
        overflowY: 'auto',
      }}
      onClick={(ev) => ev.stopPropagation()}
    >
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: 8,
          paddingBottom: 8,
          borderBottom: '1px solid var(--border-subtle)',
        }}
      >
        <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-primary)' }}>{t('colSettings')}</span>
        <button
          onClick={onClose}
          style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', fontSize: 14 }}
        >
          {'\u2715'}
        </button>
      </div>
      <div style={{ display: 'flex', gap: 4, marginBottom: 8 }}>
        {[
          ['showAll', true],
          ['hideAll', false],
        ].map(([k, v]) => (
          <button
            key={k}
            onClick={() => onToggleAll(v)}
            style={{
              fontSize: 11,
              padding: '2px 8px',
              borderRadius: 4,
              border: '1px solid var(--border-primary)',
              background: 'var(--bg-secondary)',
              cursor: 'pointer',
              color: 'var(--text-primary)',
            }}
          >
            {t(k)}
          </button>
        ))}
        <button
          onClick={onReset}
          style={{
            fontSize: 11,
            padding: '2px 8px',
            borderRadius: 4,
            border: '1px solid var(--border-primary)',
            background: 'var(--bg-secondary)',
            cursor: 'pointer',
            color: 'var(--text-primary)',
          }}
        >
          {t('resetOrder')}
        </button>
      </div>
      {cols.map((c, i) => (
        <div
          key={c.key}
          draggable
          onDragStart={() => {
            dragFrom.current = i;
          }}
          onDragEnter={() => {
            dragTo.current = i;
          }}
          onDragOver={(ev) => ev.preventDefault()}
          onDragEnd={() => {
            if (dragFrom.current !== null && dragTo.current !== null && dragFrom.current !== dragTo.current)
              onReorder(dragFrom.current, dragTo.current);
            dragFrom.current = null;
            dragTo.current = null;
          }}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            padding: '4px 4px',
            borderRadius: 4,
            cursor: 'grab',
            userSelect: 'none',
          }}
        >
          <GripVertical size={14} color="var(--border-secondary)" />
          <label
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 6,
              fontSize: 12,
              color: 'var(--text-primary)',
              cursor: 'pointer',
              flex: 1,
            }}
          >
            <input
              type="checkbox"
              checked={c.visible}
              onChange={() => onToggle(c.key)}
              style={{ accentColor: 'var(--accent)' }}
            />
            <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{c.key}</span>
          </label>
        </div>
      ))}
    </div>
  );
}

/* ── Column Resize Hook ── */
function useColumnResize(initialWidths) {
  const [widths, setWidths] = useState(initialWidths);
  const onMouseDown = (colKey, e) => {
    e.preventDefault();
    e.stopPropagation();
    const startX = e.clientX,
      startW = widths[colKey] || 150;
    const onMove = (ev) => {
      setWidths((prev) => ({ ...prev, [colKey]: Math.max(60, Math.min(600, startW + (ev.clientX - startX))) }));
    };
    const onUp = () => {
      document.removeEventListener('mousemove', onMove);
      document.removeEventListener('mouseup', onUp);
      document.body.style.cursor = '';
      document.body.style.userSelect = '';
    };
    document.body.style.cursor = 'col-resize';
    document.body.style.userSelect = 'none';
    document.addEventListener('mousemove', onMove);
    document.addEventListener('mouseup', onUp);
  };
  const resetWidths = (keys) => {
    const w = {};
    keys.forEach((k) => {
      w[k] = 150;
    });
    setWidths(w);
  };
  return { widths, onMouseDown, resetWidths };
}

/* ── DataTable ── */
const DataTable = forwardRef(function DataTable(
  { headers, rows, isArrayRows, onEditRow, onDeleteRow, initialViewState, onViewStateChange },
  ref,
) {
  const [cols, setCols] = useState(() => {
    if (initialViewState?.cols) {
      const saved = initialViewState.cols;
      const savedKeys = new Set(saved.map((c) => c.key));
      const extra = headers.filter((h) => !savedKeys.has(h)).map((h) => ({ key: h, visible: true }));
      return [...saved.filter((c) => headers.includes(c.key)), ...extra];
    }
    return headers.map((h) => ({ key: h, visible: true }));
  });
  const [sortKey, setSortKey] = useState(initialViewState?.sortKey ?? null);
  const [sortDir, setSortDir] = useState(initialViewState?.sortDir ?? 'asc');
  const [panel, setPanel] = useState(false);
  const [pg, setPg] = useState(initialViewState?.pg ?? 1);
  const [pgSize, setPgSize] = useState(initialViewState?.pgSize ?? 25);
  const [filterText, setFilterText] = useState(initialViewState?.filterText ?? '');
  const [maxRows, setMaxRows] = useState(initialViewState?.maxRows ?? null);

  const initW = () => {
    if (initialViewState?.widths) return { ...initialViewState.widths };
    const w = {};
    headers.forEach((h) => {
      w[h] = 150;
    });
    return w;
  };
  const { widths, onMouseDown, resetWidths } = useColumnResize(initW());

  const [prevHeaders, setPrevHeaders] = useState(headers);
  const [initialized, setInitialized] = useState(!!initialViewState);
  if (JSON.stringify(headers) !== JSON.stringify(prevHeaders)) {
    setPrevHeaders(headers);
    if (initialized) {
      setCols(headers.map((h) => ({ key: h, visible: true })));
      resetWidths(headers);
      setSortKey(null);
      setPg(1);
    }
    setInitialized(true);
  }

  // Notify parent of view state changes
  useEffect(() => {
    if (onViewStateChange) {
      onViewStateChange({ cols, sortKey, sortDir, pg, pgSize, widths, filterText, maxRows });
    }
  }, [cols, sortKey, sortDir, pg, pgSize, widths, filterText, maxRows, onViewStateChange]);

  const visCols = useMemo(() => cols.filter((c) => c.visible), [cols]);
  const hasActions = !isArrayRows && (onEditRow || onDeleteRow);

  const getVal = useCallback(
    (row, colKey) => {
      if (isArrayRows) {
        const idx = headers.indexOf(colKey);
        return idx >= 0 ? (row[idx] ?? '') : '';
      }
      return row[colKey] ?? '';
    },
    [isArrayRows, headers],
  );

  // Expose getVisibleData for JSON export
  useImperativeHandle(
    ref,
    () => ({
      getVisibleData: () => {
        const visKeys = cols.filter((c) => c.visible).map((c) => c.key);
        const sorted = (() => {
          const mapped = rows.map((row) => ({ row }));
          if (!sortKey) return mapped;
          return [...mapped].sort((a, b) => {
            const va = getVal(a.row, sortKey),
              vb = getVal(b.row, sortKey);
            const na = Number(va),
              nb = Number(vb);
            if (!isNaN(na) && va !== '' && !isNaN(nb) && vb !== '') return sortDir === 'asc' ? na - nb : nb - na;
            return sortDir === 'asc'
              ? String(va).localeCompare(String(vb), locale)
              : String(vb).localeCompare(String(va), locale);
          });
        })();
        return sorted.map(({ row }) => {
          const obj = {};
          visKeys.forEach((k) => {
            obj[k] = isArrayRows ? (row[headers.indexOf(k)] ?? '') : (row[k] ?? '');
          });
          return obj;
        });
      },
    }),
    [cols, rows, sortKey, sortDir, headers, isArrayRows, getVal],
  );

  const sortedWithIdx = useMemo(() => {
    const mapped = rows.map((row, idx) => ({ row, origIdx: idx }));
    if (!sortKey) return mapped;
    return [...mapped].sort((a, b) => {
      const va = getVal(a.row, sortKey),
        vb = getVal(b.row, sortKey);
      const na = Number(va),
        nb = Number(vb);
      if (!isNaN(na) && va !== '' && !isNaN(nb) && vb !== '') return sortDir === 'asc' ? na - nb : nb - na;
      return sortDir === 'asc'
        ? String(va).localeCompare(String(vb), locale)
        : String(vb).localeCompare(String(va), locale);
    });
  }, [rows, sortKey, sortDir, getVal]);

  const filteredRows = useMemo(() => {
    if (!filterText.trim()) return sortedWithIdx;
    const q = filterText.toLowerCase();
    const visKeys = visCols.map((c) => c.key);
    return sortedWithIdx.filter(({ row }) => visKeys.some((k) => String(getVal(row, k)).toLowerCase().includes(q)));
  }, [sortedWithIdx, filterText, visCols, getVal]);

  const limitedRows = useMemo(() => {
    if (maxRows == null || maxRows <= 0) return filteredRows;
    return filteredRows.slice(0, maxRows);
  }, [filteredRows, maxRows]);

  const total = limitedRows.length;
  const eff = pgSize === 'all' ? total : pgSize;
  const pageItems = pgSize === 'all' ? limitedRows : limitedRows.slice((pg - 1) * eff, pg * eff);

  const handleFilterChange = (text) => {
    setFilterText(text);
    setPg(1);
  };
  const handleMaxRowsChange = (val) => {
    const n = val === '' ? null : Math.max(1, parseInt(val, 10));
    setMaxRows(isNaN(n) ? null : n);
    setPg(1);
  };

  const handleSort = (key) => {
    if (sortKey === key) {
      if (sortDir === 'asc') setSortDir('desc');
      else {
        setSortKey(null);
        setSortDir('asc');
      }
    } else {
      setSortKey(key);
      setSortDir('asc');
    }
    setPg(1);
  };
  const reorder = (from, to) => {
    setCols((prev) => {
      const a = [...prev];
      const [item] = a.splice(from, 1);
      a.splice(to, 0, item);
      return a;
    });
  };
  const totalWidth = visCols.reduce((s, c) => s + (widths[c.key] || 150), 0) + (hasActions ? 80 : 0);

  const filterActive = filterText.trim() !== '';
  const totalBeforeFilter = sortedWithIdx.length;
  const totalAfterFilter = filteredRows.length;
  const isLimited = maxRows != null && maxRows > 0 && maxRows < totalAfterFilter;

  const statusParts = [];
  if (filterActive) {
    statusParts.push(
      t('matchCount')
        .replace('{matched}', totalAfterFilter.toLocaleString(locale))
        .replace('{total}', totalBeforeFilter.toLocaleString(locale)),
    );
  }
  if (isLimited) {
    statusParts.push(t('limited').replace('{n}', maxRows.toLocaleString(locale)));
  }

  return (
    <div>
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 8,
          marginBottom: 8,
          position: 'relative',
          flexWrap: 'wrap',
        }}
      >
        {/* Search input */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            flex: 1,
            minWidth: 180,
            maxWidth: 360,
            border: '1px solid var(--border-primary)',
            borderRadius: 6,
            padding: '0 8px',
            background: 'var(--bg-input)',
          }}
        >
          <Search size={14} color="var(--text-muted)" />
          <input
            type="text"
            value={filterText}
            onChange={(e) => handleFilterChange(e.target.value)}
            placeholder={t('searchPlaceholder')}
            style={{
              flex: 1,
              border: 'none',
              outline: 'none',
              padding: '5px 6px',
              fontSize: 12,
              background: 'transparent',
              color: 'var(--text-primary)',
            }}
          />
          {filterText && (
            <button
              onClick={() => handleFilterChange('')}
              style={{
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                padding: 2,
                display: 'flex',
                color: 'var(--text-muted)',
              }}
            >
              <X size={14} />
            </button>
          )}
        </div>
        {/* Max rows input */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 12, color: 'var(--text-tertiary)' }}>
          <span>{t('maxRows')}:</span>
          <input
            type="number"
            min="1"
            value={maxRows ?? ''}
            onChange={(e) => handleMaxRowsChange(e.target.value)}
            placeholder={t('noLimit')}
            style={{
              width: 80,
              padding: '4px 6px',
              fontSize: 12,
              border: '1px solid var(--border-primary)',
              borderRadius: 6,
              textAlign: 'right',
              background: 'var(--bg-input)',
              color: 'var(--text-primary)',
            }}
          />
        </div>
        {/* Column settings */}
        <button
          onClick={() => setPanel(!panel)}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 4,
            fontSize: 12,
            color: 'var(--text-tertiary)',
            background: 'none',
            border: '1px solid var(--border-primary)',
            borderRadius: 6,
            padding: '4px 10px',
            cursor: 'pointer',
            marginLeft: 'auto',
          }}
        >
          <Settings2 size={14} />
          {t('colSettings')}
        </button>
        {panel && (
          <ColPanel
            cols={cols}
            onToggle={(k) => setCols((p) => p.map((c) => (c.key === k ? { ...c, visible: !c.visible } : c)))}
            onToggleAll={(v) => setCols((p) => p.map((c) => ({ ...c, visible: v })))}
            onReorder={reorder}
            onReset={() => {
              setCols(headers.map((h) => ({ key: h, visible: true })));
              resetWidths(headers);
            }}
            onClose={() => setPanel(false)}
          />
        )}
      </div>
      {statusParts.length > 0 && (
        <div style={{ fontSize: 11, color: 'var(--text-tertiary)', marginBottom: 6, display: 'flex', gap: 8 }}>
          {statusParts.map((s, i) => (
            <span key={i} style={{ padding: '2px 8px', background: 'var(--bg-filter-badge)', borderRadius: 4 }}>
              {s}
            </span>
          ))}
        </div>
      )}
      <div style={{ overflowX: 'auto', border: '1px solid var(--border-primary)', borderRadius: 8 }}>
        <table style={{ borderCollapse: 'collapse', tableLayout: 'fixed', width: totalWidth }}>
          <colgroup>
            {hasActions && <col style={{ width: 80 }} />}
            {visCols.map((col) => (
              <col key={col.key} style={{ width: widths[col.key] || 150 }} />
            ))}
          </colgroup>
          <thead>
            <tr>
              {hasActions && (
                <th
                  style={{
                    padding: '8px 8px',
                    textAlign: 'center',
                    fontWeight: 600,
                    fontSize: 12,
                    color: 'var(--text-primary)',
                    borderBottom: '2px solid var(--border-primary)',
                    background: 'var(--bg-secondary)',
                    width: 80,
                  }}
                >
                  {t('actions')}
                </th>
              )}
              {visCols.map((col) => (
                <th
                  key={col.key}
                  style={{
                    padding: '8px 16px 8px 12px',
                    textAlign: 'left',
                    fontWeight: 600,
                    fontSize: 12,
                    color: 'var(--text-primary)',
                    borderBottom: '2px solid var(--border-primary)',
                    whiteSpace: 'nowrap',
                    cursor: 'pointer',
                    userSelect: 'none',
                    position: 'relative',
                    overflow: 'hidden',
                    background: sortKey === col.key ? 'var(--bg-hover)' : 'var(--bg-secondary)',
                  }}
                  onClick={() => handleSort(col.key)}
                >
                  <span
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: 4,
                      maxWidth: '100%',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                    }}
                  >
                    {col.key}
                    {sortKey === col.key &&
                      (sortDir === 'asc' ? (
                        <ChevronUp size={14} color="var(--accent)" />
                      ) : (
                        <ChevronDown size={14} color="var(--accent)" />
                      ))}
                  </span>
                  <div
                    style={{
                      position: 'absolute',
                      right: 0,
                      top: 0,
                      bottom: 0,
                      width: 6,
                      cursor: 'col-resize',
                      zIndex: 2,
                      borderRight: '2px solid transparent',
                      transition: 'border-color 0.15s',
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.borderRight = '2px solid var(--border-resize)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.borderRight = '2px solid transparent';
                    }}
                    onMouseDown={(e) => onMouseDown(col.key, e)}
                  />
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {pageItems.map(({ row, origIdx }, ri) => (
              <tr key={ri} style={{ background: ri % 2 === 0 ? 'var(--bg-primary)' : 'var(--bg-tertiary)' }}>
                {hasActions && (
                  <td
                    style={{
                      padding: '4px 4px',
                      borderBottom: '1px solid var(--border-subtle)',
                      textAlign: 'center',
                      verticalAlign: 'top',
                    }}
                  >
                    <div style={{ display: 'flex', gap: 2, justifyContent: 'center' }}>
                      {onEditRow && (
                        <button
                          style={{
                            padding: '2px 6px',
                            fontSize: 11,
                            border: '1px solid var(--border-primary)',
                            borderRadius: 4,
                            background: 'var(--bg-primary)',
                            cursor: 'pointer',
                            display: 'inline-flex',
                            alignItems: 'center',
                            color: 'var(--text-primary)',
                          }}
                          onClick={() => onEditRow({ rowIndex: origIdx, row })}
                        >
                          <Edit3 size={12} />
                        </button>
                      )}
                      {onDeleteRow && (
                        <button
                          style={{
                            padding: '2px 6px',
                            fontSize: 11,
                            border: '1px solid var(--error-border)',
                            borderRadius: 4,
                            background: 'var(--bg-primary)',
                            cursor: 'pointer',
                            color: 'var(--error-accent)',
                            display: 'inline-flex',
                            alignItems: 'center',
                          }}
                          onClick={() => onDeleteRow(origIdx)}
                        >
                          <Trash2 size={12} />
                        </button>
                      )}
                    </div>
                  </td>
                )}
                {visCols.map((col) => (
                  <td
                    key={col.key}
                    style={{
                      padding: '6px 12px',
                      borderBottom: '1px solid var(--border-subtle)',
                      fontSize: 12,
                      color: 'var(--text-secondary)',
                      verticalAlign: 'top',
                      overflow: 'hidden',
                    }}
                  >
                    <div
                      style={{
                        overflow: 'hidden',
                        display: '-webkit-box',
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: 'vertical',
                        wordBreak: 'break-word',
                        lineHeight: '1.5',
                      }}
                    >
                      <CellValue value={getVal(row, col.key)} />
                    </div>
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {total > 10 && <Pagination total={total} page={pg} size={pgSize} onPage={setPg} onSize={setPgSize} />}
    </div>
  );
});

/* \u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550
   AI API Callers
   \u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550 */

async function callOpenAI(model, prompt, apiKey) {
  const direct = !!apiKey;
  const url = direct ? 'https://api.openai.com/v1/chat/completions' : '/api/openai';
  const headers = { 'Content-Type': 'application/json' };
  if (direct) headers['Authorization'] = `Bearer ${apiKey}`;
  const res = await fetch(url, {
    method: 'POST',
    headers,
    body: JSON.stringify({
      model,
      messages: [{ role: 'user', content: prompt }],
      max_completion_tokens: 16000,
    }),
  });
  if (!res.ok) throw new Error(`OpenAI API ${res.status}: ${await res.text()}`);
  const d = await res.json();
  return d.choices[0].message.content;
}

async function callGemini(model, prompt, apiKey) {
  const direct = !!apiKey;
  const url = direct
    ? `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`
    : `/api/gemini/${model}`;
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      contents: [{ parts: [{ text: prompt }] }],
      generationConfig: { maxOutputTokens: 16000 },
    }),
  });
  if (!res.ok) throw new Error(`Gemini API ${res.status}: ${await res.text()}`);
  const d = await res.json();
  return d.candidates[0].content.parts[0].text;
}

/* \u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550
   Main App
   \u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550 */
export default function App() {
  const globalState = getGlobalState();
  const [allRows, setAllRows] = useState([]);
  const [headers, setHeaders] = useState([]);
  const [fileInfo, setFileInfo] = useState(null);
  const [query, setQuery] = useState('');
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState('');
  const [error, setError] = useState('');
  const [composing, setComposing] = useState(false);
  const [editModal, setEditModal] = useState(null);
  const [wideMode, setWideMode] = useState(globalState.wideMode ?? true);
  const [dataOpen, setDataOpen] = useState(true);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [theme, setTheme] = useState(globalState.theme || 'auto');
  const [fontScale, setFontScale] = useState(globalState.fontScale || 'm');

  // AI provider state - restored from localStorage
  const [provider, setProvider] = useState(globalState.provider || 'openai');
  const [model, setModel] = useState(
    globalState.model ||
      AI_PROVIDERS[globalState.provider || 'openai']?.defaultModel ||
      AI_PROVIDERS.openai.defaultModel,
  );

  // DataTable ref for JSON export
  const dataTableRef = useRef(null);

  // Dataset view state
  const [activeDatasetId, setActiveDatasetId] = useState(null);
  const [datasetViewState, setDatasetViewState] = useState(null);

  const isMac = /Mac|iPhone|iPad/.test(navigator.userAgent);
  const hintText = isMac ? t('submitHint') : t('submitHintWin');

  // Persist global state changes
  useEffect(() => {
    setGlobalState({ wideMode });
  }, [wideMode]);
  useEffect(() => {
    setGlobalState({ provider, model });
  }, [provider, model]);

  // Theme: apply data-theme attribute
  useEffect(() => {
    if (theme === 'auto') {
      delete document.documentElement.dataset.theme;
    } else {
      document.documentElement.dataset.theme = theme;
    }
    setGlobalState({ theme });
  }, [theme]);

  // Font scale: apply data-font attribute
  useEffect(() => {
    if (fontScale === 'm') {
      delete document.documentElement.dataset.font;
    } else {
      document.documentElement.dataset.font = fontScale;
    }
    setGlobalState({ fontScale });
  }, [fontScale]);

  const cycleTheme = () => {
    const idx = THEME_CYCLE.indexOf(theme);
    setTheme(THEME_CYCLE[(idx + 1) % THEME_CYCLE.length]);
  };
  const ThemeIcon = THEME_ICON[theme];
  const themeLabel = t(theme === 'auto' ? 'themeAuto' : theme === 'dark' ? 'themeDark' : 'themeLight');

  const cycleFontSize = () => {
    const idx = FONT_SIZES.indexOf(fontScale);
    setFontScale(FONT_SIZES[(idx + 1) % FONT_SIZES.length]);
  };
  const fontLabel =
    t('fontSize') +
    ': ' +
    t(fontScale === 's' ? 'fontSizeSmall' : fontScale === 'l' ? 'fontSizeLarge' : 'fontSizeMedium');

  const handleProviderChange = (newProvider) => {
    setProvider(newProvider);
    setModel(AI_PROVIDERS[newProvider].defaultModel);
  };

  // ── DataTable view state callback ──
  const handleViewStateChange = useCallback(
    (state) => {
      if (activeDatasetId) {
        setDatasetState(activeDatasetId, state);
      }
    },
    [activeDatasetId],
  );

  // ── JSON Export ──
  const handleExportJson = () => {
    if (!dataTableRef.current) return;
    const data = dataTableRef.current.getVisibleData();
    const json = JSON.stringify(data, null, 2);
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${fileInfo?.name?.replace(/\.\w+$/, '') || 'export'}_view.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // ── CRUD Callbacks ──
  const handleRowUpdate = (rowIndex, newRow) => {
    setAllRows((prev) => {
      const a = [...prev];
      a[rowIndex] = newRow;
      return a;
    });
  };
  const handleRowAdd = (newRow) => {
    setAllRows((prev) => [...prev, newRow]);
  };
  const handleRowDelete = (rowIndex) => {
    setAllRows((prev) => prev.filter((_, i) => i !== rowIndex));
  };
  const handleLoadDataset = (ds) => {
    setHeaders(ds.headers);
    setAllRows(ds.rows);
    setFileInfo({ name: ds.name, type: ds.fileType, rows: ds.rows.length, cols: ds.headers.length });
    setResult(null);
    setError('');
    // Restore dataset-specific view state
    setActiveDatasetId(ds.id || null);
    const saved = ds.id ? getDatasetState(ds.id) : null;
    setDatasetViewState(saved);
  };

  const syncCsv = (hdrs, rows) => rowsToCsv(rows, hdrs);

  const loadFile = async (file) => {
    if (!file) return;
    const ext = file.name.split('.').pop().toLowerCase();
    const text = await file.text();
    try {
      let hdrs, rows;
      if (ext === 'json') {
        const json = JSON.parse(text);
        rows = flattenJson(json);
        if (!rows.length) throw new Error('Empty');
        hdrs = [...new Set(rows.flatMap((r) => Object.keys(r)))];
      } else if (ext === 'csv') {
        const p = parseCsv(text);
        hdrs = p.h;
        rows = p.rows;
      } else {
        setError(t('errorUnsupportedFormat'));
        return;
      }
      setHeaders(hdrs);
      setAllRows(rows);
      setFileInfo({ name: file.name, type: ext.toUpperCase(), rows: rows.length, cols: hdrs.length });
      setResult(null);
      setError('');
      setActiveDatasetId(null);
      setDatasetViewState(null);
    } catch (err) {
      setError(t('errorReadingFile') + err.message);
    }
  };

  const analyze = async () => {
    const currentCsv = syncCsv(headers, allRows);
    if (!currentCsv || !query.trim()) {
      setError(t('errorUploadAndQuery'));
      return;
    }
    setLoading(true);
    setStatus(t('planningAnalysis'));
    setError('');
    try {
      const sample = currentCsv.trim().split('\n').slice(0, 6).join('\n');
      const lang = isJa
        ? '\u30c1\u30e3\u30fc\u30c8\u306e\u30bf\u30a4\u30c8\u30eb\u30fb\u30e9\u30d9\u30eb\u306f\u3059\u3079\u3066\u65e5\u672c\u8a9e\u3067\u3002'
        : 'Respond in English.';
      const prompt = `CSV data (first 5 rows):\n${sample}\n\nTotal rows: ${allRows.length}\nRequest: "${query}"\n\nWrite JS code. Parse csvData (CSV string), analyze, output:\nanalysisResult = { type: 'bar_chart'|'line_chart'|'table'|'count', data: ... };\n\nStructures:\n- bar_chart/line_chart: { labels: string[], values: number[], title?: string }\n- table: { headers: string[], rows: any[][] }\n- count: { value: number|string, label?: string }\n\n${lang}\n\nReturn ONLY JS code. No markdown/backticks.`;

      setStatus(`${AI_PROVIDERS[provider].label} (${model}) ...`);

      let code;
      const apiKey = hasKey(provider) ? getKey(provider) : '';
      if (provider === 'openai') {
        code = await callOpenAI(model, prompt, apiKey || undefined);
      } else {
        code = await callGemini(model, prompt, apiKey || undefined);
      }

      // Strip markdown code fences if present
      code = code
        .replace(/^```(?:javascript|js)?\n?/i, '')
        .replace(/\n?```$/i, '')
        .trim();

      setStatus(t('calculatingResults'));
      const fn = new Function('csvData', code + '\nreturn analysisResult;');
      setResult(fn(currentCsv));
    } catch (err) {
      setError(t('errorDuringAnalysis') + err.message);
    } finally {
      setLoading(false);
      setStatus('');
    }
  };

  const renderResult = () => {
    if (!result) return null;
    const { type, data } = result;
    if (type === 'bar_chart') {
      const d = data.labels.map((l, i) => ({ name: l, value: data.values[i] }));
      return (
        <div style={{ marginTop: 16 }}>
          <h3 style={{ fontSize: 16, fontWeight: 600, marginBottom: 12, color: 'var(--text-heading)' }}>
            {data.title || t('barChart')}
          </h3>
          <ResponsiveContainer width="100%" height={400}>
            <BarChart data={d}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" tick={{ fontSize: 12 }} />
              <YAxis tick={{ fontSize: 12 }} />
              <Tooltip />
              <Legend />
              <Bar dataKey="value" fill="var(--accent)" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      );
    }
    if (type === 'line_chart') {
      const d = data.labels.map((l, i) => ({ name: l, value: data.values[i] }));
      return (
        <div style={{ marginTop: 16 }}>
          <h3 style={{ fontSize: 16, fontWeight: 600, marginBottom: 12, color: 'var(--text-heading)' }}>
            {data.title || t('lineChart')}
          </h3>
          <ResponsiveContainer width="100%" height={400}>
            <LineChart data={d}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" tick={{ fontSize: 12 }} />
              <YAxis tick={{ fontSize: 12 }} />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="value" stroke="var(--accent)" strokeWidth={2} dot={{ r: 3 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      );
    }
    if (type === 'table') {
      return (
        <div style={{ marginTop: 16 }}>
          <h3 style={{ fontSize: 16, fontWeight: 600, marginBottom: 12, color: 'var(--text-heading)' }}>
            {t('tableResults')}
          </h3>
          <DataTable headers={data.headers} rows={data.rows} isArrayRows={true} />
        </div>
      );
    }
    if (type === 'count') {
      return (
        <div style={{ marginTop: 16, textAlign: 'center', padding: '32px 0' }}>
          <p style={{ fontSize: 13, color: 'var(--text-tertiary)', marginBottom: 8 }}>
            {data.label || t('countResult')}
          </p>
          <p style={{ fontSize: 48, fontWeight: 700, color: 'var(--accent)' }}>
            {typeof data.value === 'number' ? data.value.toLocaleString(locale) : data.value}
          </p>
        </div>
      );
    }
    return null;
  };

  /* ── Row Edit Modal (rendered conditionally below) ── */

  const selectStyle = {
    padding: '4px 8px',
    fontSize: 12,
    border: '1px solid var(--border-secondary)',
    borderRadius: 6,
    background: 'var(--bg-input)',
    color: 'var(--text-primary)',
    cursor: 'pointer',
  };

  return (
    <div
      style={{
        minHeight: '100vh',
        background: 'linear-gradient(135deg, var(--bg-page), var(--bg-page-accent) 50%)',
        padding: 24,
      }}
    >
      <div style={{ maxWidth: wideMode ? 1440 : 960, margin: '0 auto', transition: 'max-width 0.3s ease' }}>
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: 4,
            flexWrap: 'wrap',
            gap: 8,
          }}
        >
          <h1 style={{ fontSize: 24, fontWeight: 700, color: 'var(--text-heading)' }}>{t('pageTitle')}</h1>

          {/* AI Provider / Model Selector + Width Toggle + Theme Toggle */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <Bot size={16} color="var(--accent)" />
            <select value={provider} onChange={(e) => handleProviderChange(e.target.value)} style={selectStyle}>
              {Object.entries(AI_PROVIDERS).map(([key, cfg]) => (
                <option key={key} value={key}>
                  {cfg.label}
                </option>
              ))}
            </select>
            <select value={model} onChange={(e) => setModel(e.target.value)} style={selectStyle}>
              {AI_PROVIDERS[provider].models.map((m) => (
                <option key={m.id} value={m.id}>
                  {m.label}
                </option>
              ))}
            </select>
            <button
              onClick={() => setWideMode((w) => !w)}
              title={wideMode ? 'Compact' : 'Wide'}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: 32,
                height: 32,
                borderRadius: 6,
                border: '1px solid var(--border-secondary)',
                background: wideMode ? 'var(--bg-hover)' : 'var(--bg-primary)',
                cursor: 'pointer',
                color: 'var(--accent)',
                transition: 'background 0.15s',
              }}
            >
              {wideMode ? <Minimize2 size={16} /> : <Maximize2 size={16} />}
            </button>
            <button
              onClick={cycleFontSize}
              title={fontLabel}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                minWidth: 32,
                height: 32,
                borderRadius: 6,
                border: '1px solid var(--border-secondary)',
                background: fontScale !== 'm' ? 'var(--bg-hover)' : 'var(--bg-primary)',
                cursor: 'pointer',
                color: 'var(--accent)',
                transition: 'background 0.15s',
                fontSize: 11,
                fontWeight: 700,
                gap: 2,
                padding: '0 6px',
              }}
            >
              {fontScale === 's' ? <AArrowDown size={16} /> : fontScale === 'l' ? <AArrowUp size={16} /> : 'A'}
              <span style={{ fontSize: 9 }}>{FONT_LABELS[fontScale]}</span>
            </button>
            <button
              onClick={cycleTheme}
              title={themeLabel}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: 32,
                height: 32,
                borderRadius: 6,
                border: '1px solid var(--border-secondary)',
                background: 'var(--bg-primary)',
                cursor: 'pointer',
                color: 'var(--accent)',
                transition: 'background 0.15s',
              }}
            >
              <ThemeIcon size={16} />
            </button>
            <button
              onClick={() => setSettingsOpen(true)}
              title={t('settings')}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: 32,
                height: 32,
                borderRadius: 6,
                border: '1px solid var(--border-secondary)',
                background: 'var(--bg-primary)',
                cursor: 'pointer',
                color: 'var(--accent)',
                transition: 'background 0.15s',
              }}
            >
              <Settings2 size={16} />
            </button>
          </div>
        </div>
        <p style={{ fontSize: 13, color: 'var(--text-tertiary)', marginBottom: 24 }}>{t('instructionsText')}</p>

        {/* Data Management Accordion */}
        <div
          style={{
            marginTop: 8,
            border: '1px solid var(--border-primary)',
            borderRadius: 10,
            background: 'var(--bg-primary)',
            overflow: 'hidden',
          }}
        >
          <div
            onClick={() => setDataOpen((o) => !o)}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '10px 16px',
              cursor: 'pointer',
              userSelect: 'none',
              background: dataOpen ? 'var(--bg-secondary)' : 'var(--bg-primary)',
              transition: 'background 0.15s',
            }}
          >
            <span
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 8,
                fontSize: 13,
                fontWeight: 600,
                color: 'var(--text-primary)',
              }}
            >
              <Upload size={16} color="var(--accent)" />
              {t('dataManagement')}
              {fileInfo && (
                <span style={{ fontSize: 11, fontWeight: 400, color: 'var(--text-muted)', marginLeft: 4 }}>
                  ({fileInfo.name} - {allRows.length.toLocaleString(locale)} {t('rows')})
                </span>
              )}
            </span>
            {dataOpen ? (
              <ChevronUp size={18} color="var(--text-muted)" />
            ) : (
              <ChevronDown size={18} color="var(--text-muted)" />
            )}
          </div>
          {dataOpen && (
            <div style={{ padding: '16px 16px 20px' }}>
              {/* Upload */}
              <label
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  height: 112,
                  border: '2px dashed var(--border-secondary)',
                  borderRadius: 12,
                  background: 'var(--bg-secondary)',
                  cursor: 'pointer',
                }}
                onDragOver={(e) => e.preventDefault()}
                onDrop={(e) => {
                  e.preventDefault();
                  loadFile(e.dataTransfer?.files?.[0]);
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 12, color: 'var(--text-tertiary)' }}>
                  <Upload size={24} />
                  <span style={{ fontSize: 14 }}>{t('uploadText')}</span>
                </div>
                <input
                  type="file"
                  style={{ display: 'none' }}
                  accept=".csv,.json"
                  onChange={(e) => loadFile(e.target.files[0])}
                />
              </label>
              <p style={{ textAlign: 'center', fontSize: 12, color: 'var(--text-muted)', marginTop: 8 }}>
                {t('sampleDataLink')}{' '}
                <a
                  href={t('sampleDataUrl')}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{ color: 'var(--accent)', textDecoration: 'underline' }}
                >
                  {t('sampleDataUrl')}
                </a>
              </p>

              {/* Dataset Manager */}
              <div style={{ marginTop: 16 }}>
                <DatasetManager
                  headers={headers}
                  rows={allRows}
                  fileInfo={fileInfo}
                  onLoad={handleLoadDataset}
                  onRowAdd={handleRowAdd}
                />
              </div>

              {/* Folder Sync */}
              <FolderSyncPanel onLoadFile={loadFile} />
            </div>
          )}
        </div>

        {/* File info + Data Preview — always visible outside accordion */}
        {fileInfo && (
          <div
            style={{
              marginTop: 16,
              display: 'flex',
              alignItems: 'center',
              gap: 12,
              fontSize: 12,
              color: 'var(--text-tertiary)',
            }}
          >
            <span
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 4,
                padding: '4px 10px',
                borderRadius: 99,
                background: 'var(--bg-accent-light)',
                color: 'var(--text-accent-dark)',
                fontWeight: 500,
              }}
            >
              {fileInfo.type === 'JSON' ? <FileJson size={14} /> : <FileText size={14} />}
              {fileInfo.type}
            </span>
            <span>{fileInfo.name}</span>
            <span>&bull;</span>
            <span>
              {allRows.length.toLocaleString(locale)} {t('rows')} &times; {headers.length} {t('columns')}
            </span>
          </div>
        )}

        {allRows.length > 0 && (
          <div style={{ marginTop: 16 }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
              <h2
                style={{
                  fontSize: 13,
                  fontWeight: 600,
                  color: 'var(--text-secondary)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 6,
                  margin: 0,
                }}
              >
                <FileText size={16} />
                {t('dataPreviewTitle')}
              </h2>
              <button
                onClick={handleExportJson}
                style={{
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
                }}
              >
                <Download size={12} />
                {t('exportCurrentJson')}
              </button>
            </div>
            <DataTable
              ref={dataTableRef}
              headers={headers}
              rows={allRows}
              isArrayRows={false}
              onEditRow={(info) => setEditModal(info)}
              onDeleteRow={(idx) => handleRowDelete(idx)}
              initialViewState={datasetViewState}
              onViewStateChange={handleViewStateChange}
            />
          </div>
        )}

        {/* Analysis input */}
        {headers.length > 0 && (
          <div style={{ marginTop: 24 }}>
            <h2 style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 8 }}>
              {t('analysisRequestTitle')}
            </h2>
            <div style={{ display: 'flex', gap: 12 }}>
              <div style={{ flex: 1, position: 'relative' }}>
                <textarea
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  onCompositionStart={() => setComposing(true)}
                  onCompositionEnd={() => setComposing(false)}
                  onKeyDown={(e) => {
                    if (composing) return;
                    const mod = isMac ? e.metaKey : e.ctrlKey;
                    if (e.key === 'Enter' && mod && !loading && query.trim()) {
                      e.preventDefault();
                      analyze();
                    }
                    if (e.key === 'Enter' && !e.shiftKey && !mod) e.preventDefault();
                  }}
                  placeholder={t('analysisPlaceholder')}
                  rows={2}
                  disabled={loading}
                  style={{
                    width: '100%',
                    padding: '10px 14px',
                    fontSize: 14,
                    border: '1px solid var(--border-secondary)',
                    borderRadius: 8,
                    resize: 'none',
                    boxSizing: 'border-box',
                    background: 'var(--bg-input)',
                    color: 'var(--text-primary)',
                  }}
                />
                <span
                  style={{
                    position: 'absolute',
                    right: 12,
                    bottom: 8,
                    fontSize: 11,
                    color: 'var(--text-muted)',
                    pointerEvents: 'none',
                  }}
                >
                  {hintText}
                </span>
              </div>
              <button
                onClick={analyze}
                disabled={loading || !query.trim()}
                style={{
                  padding: '10px 20px',
                  fontSize: 14,
                  fontWeight: 500,
                  color: 'var(--text-on-accent)',
                  background: loading || !query.trim() ? 'var(--border-secondary)' : 'var(--accent)',
                  border: 'none',
                  borderRadius: 8,
                  cursor: loading || !query.trim() ? 'not-allowed' : 'pointer',
                  whiteSpace: 'nowrap',
                  alignSelf: 'flex-start',
                }}
              >
                {loading ? t('processingButton') : t('runAnalysisButton')}
              </button>
            </div>
          </div>
        )}

        {loading && (
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 12, padding: '48px 0' }}>
            <Loader2 size={24} color="var(--accent)" className="animate-spin" />
            <span style={{ fontSize: 14, color: 'var(--text-tertiary)' }}>{status}</span>
          </div>
        )}
        {error && (
          <div
            style={{
              marginTop: 16,
              padding: 12,
              background: 'var(--error-bg)',
              border: '1px solid var(--error-border)',
              borderRadius: 8,
              fontSize: 13,
              color: 'var(--error-text)',
            }}
          >
            {error}
          </div>
        )}
        {!loading && result && (
          <div
            style={{
              marginTop: 24,
              background: 'var(--bg-primary)',
              border: '1px solid var(--border-primary)',
              borderRadius: 12,
              padding: 24,
            }}
          >
            {renderResult()}
          </div>
        )}

        {editModal && (
          <RowEditModal
            editModal={editModal}
            headers={headers}
            isJa={isJa}
            onClose={() => setEditModal(null)}
            onAdd={handleRowAdd}
            onUpdate={handleRowUpdate}
          />
        )}
        {settingsOpen && <SettingsPanel onClose={() => setSettingsOpen(false)} />}
      </div>
    </div>
  );
}
