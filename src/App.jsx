import React, { useState, useMemo, useRef } from 'react';
import {
  LineChart, Line, BarChart, Bar, XAxis, YAxis,
  CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from 'recharts';
import {
  Upload, FileText, Loader2, FileJson,
  ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight,
  ChevronUp, ChevronDown, Settings2, GripVertical,
  Edit3, Trash2, Bot, Maximize2, Minimize2
} from 'lucide-react';
import DatasetManager from './components/DatasetManager';

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

/* ── i18n ── */
const TR = {
  "en-US": {
    pageTitle: "CSV / JSON Data Visualizer",
    instructionsText: "Upload your CSV or JSON file to get started. Describe what you want to know in plain language.",
    uploadText: "Drop CSV or JSON file here, or click to upload",
    sampleDataLink: "Don't have a file? Try with sample data",
    sampleDataUrl: "https://www.realtor.com/research/data",
    dataPreviewTitle: "Data Preview",
    analysisRequestTitle: "Analysis Request",
    analysisPlaceholder: "Describe the analysis you want to run...",
    runAnalysisButton: "Run Analysis",
    processingButton: "Processing...",
    planningAnalysis: "Planning analysis...",
    calculatingResults: "Calculating results...",
    errorReadingFile: "Error reading file: ",
    errorUnsupportedFormat: "Unsupported format. Upload CSV or JSON.",
    errorUploadAndQuery: "Please upload a file and enter a query.",
    errorDuringAnalysis: "Error during analysis: ",
    barChart: "Bar Chart", lineChart: "Line Chart",
    tableResults: "Table Results", countResult: "Count Result",
    rows: "rows", columns: "columns",
    submitHint: "\u2318+Enter to submit", submitHintWin: "Ctrl+Enter to submit",
    rowsPerPage: "Rows / page", pageOf: "of",
    showing: "Showing", to: "\u2013", totalRows: "rows", all: "All",
    colSettings: "Column settings", showAll: "Show all",
    hideAll: "Hide all", resetOrder: "Reset order",
    actions: "Actions",
    aiProvider: "AI Provider", aiModel: "Model",
    dataManagement: "Data Management",
  },
  "ja-JP": {
    pageTitle: "CSV / JSON \u30c7\u30fc\u30bf\u30d3\u30b8\u30e5\u30a2\u30e9\u30a4\u30b6\u30fc",
    instructionsText: "CSV\u307e\u305f\u306fJSON\u30d5\u30a1\u30a4\u30eb\u3092\u30a2\u30c3\u30d7\u30ed\u30fc\u30c9\u3057\u3001\u81ea\u7136\u306a\u65e5\u672c\u8a9e\u3067\u5206\u6790\u5185\u5bb9\u3092\u5165\u529b\u3057\u3066\u304f\u3060\u3055\u3044\u3002",
    uploadText: "CSV / JSON \u30d5\u30a1\u30a4\u30eb\u3092\u30c9\u30ed\u30c3\u30d7\u3001\u307e\u305f\u306f\u30af\u30ea\u30c3\u30af",
    sampleDataLink: "\u30b5\u30f3\u30d7\u30eb\u30c7\u30fc\u30bf\u3092\u304a\u8a66\u3057\u304f\u3060\u3055\u3044",
    sampleDataUrl: "https://www.realtor.com/research/data",
    dataPreviewTitle: "\u30c7\u30fc\u30bf\u30d7\u30ec\u30d3\u30e5\u30fc",
    analysisRequestTitle: "\u5206\u6790\u30ea\u30af\u30a8\u30b9\u30c8",
    analysisPlaceholder: "\u5b9f\u884c\u3057\u305f\u3044\u5206\u6790\u5185\u5bb9\u3092\u5165\u529b\u2026",
    runAnalysisButton: "\u5206\u6790\u3092\u5b9f\u884c",
    processingButton: "\u51e6\u7406\u4e2d\u2026",
    planningAnalysis: "\u5206\u6790\u3092\u8a08\u753b\u4e2d\u2026",
    calculatingResults: "\u7d50\u679c\u3092\u8a08\u7b97\u4e2d\u2026",
    errorReadingFile: "\u8aad\u307f\u8fbc\u307f\u30a8\u30e9\u30fc: ",
    errorUnsupportedFormat: "\u672a\u5bfe\u5fdc\u306e\u5f62\u5f0f\u3067\u3059\u3002CSV/JSON\u3092\u30a2\u30c3\u30d7\u30ed\u30fc\u30c9\u3057\u3066\u304f\u3060\u3055\u3044\u3002",
    errorUploadAndQuery: "\u30d5\u30a1\u30a4\u30eb\u3068\u5206\u6790\u5185\u5bb9\u3092\u5165\u529b\u3057\u3066\u304f\u3060\u3055\u3044\u3002",
    errorDuringAnalysis: "\u5206\u6790\u30a8\u30e9\u30fc: ",
    barChart: "\u68d2\u30b0\u30e9\u30d5", lineChart: "\u6298\u308c\u7dda\u30b0\u30e9\u30d5",
    tableResults: "\u30c6\u30fc\u30d6\u30eb\u7d50\u679c", countResult: "\u96c6\u8a08\u7d50\u679c",
    rows: "\u884c", columns: "\u5217",
    submitHint: "\u2318+Enter\u3067\u9001\u4fe1", submitHintWin: "Ctrl+Enter\u3067\u9001\u4fe1",
    rowsPerPage: "\u8868\u793a\u4ef6\u6570", pageOf: "/",
    showing: "", to: "\u2013", totalRows: "\u4ef6\u4e2d", all: "\u3059\u3079\u3066",
    colSettings: "\u30ab\u30e9\u30e0\u8a2d\u5b9a", showAll: "\u3059\u3079\u3066\u8868\u793a",
    hideAll: "\u3059\u3079\u3066\u975e\u8868\u793a", resetOrder: "\u9806\u5e8f\u30ea\u30bb\u30c3\u30c8",
    actions: "\u64cd\u4f5c",
    aiProvider: "AI\u30d7\u30ed\u30d0\u30a4\u30c0\u30fc", aiModel: "\u30e2\u30c7\u30eb",
    dataManagement: "\u30c7\u30fc\u30bf\u7ba1\u7406",
  }
};
const bLoc = navigator.languages?.[0] || navigator.language || 'en-US';
const locale = TR[bLoc] ? bLoc : (Object.keys(TR).find(k => k.startsWith(bLoc.split('-')[0])) || 'en-US');
const t = (k) => TR[locale]?.[k] || TR['en-US'][k] || k;
const isJa = locale.startsWith('ja');

/* ── Helpers ── */
const flattenJson = (json) => {
  let a = Array.isArray(json) ? json : (json.data || json.results || json.items || json.records || [json]);
  if (!Array.isArray(a)) a = [a];
  return a.map(item => {
    const row = {};
    const walk = (o, p) => {
      for (const [k, v] of Object.entries(o || {})) {
        const key = p ? `${p}.${k}` : k;
        if (v && typeof v === 'object' && !Array.isArray(v)) walk(v, key);
        else row[key] = Array.isArray(v) ? v.join(', ') : v;
      }
    };
    walk(item, ''); return row;
  });
};
const rowsToCsv = (rows, headers) => {
  if (!rows.length) return '';
  const h = headers || [...new Set(rows.flatMap(r => Object.keys(r)))];
  return [h.join(','), ...rows.map(r => h.map(k => {
    const s = String(r[k] ?? '');
    return s.includes(',') || s.includes('"') || s.includes('\n') ? `"${s.replace(/"/g, '""')}"` : s;
  }).join(','))].join('\n');
};
const parseCsv = (text) => {
  const lines = text.trim().split('\n');
  const h = lines[0].split(',').map(s => s.trim().replace(/^"|"$/g, ''));
  const rows = [];
  for (let i = 1; i < lines.length; i++) {
    const v = lines[i].split(',').map(s => s.trim().replace(/^"|"$/g, ''));
    const row = {}; h.forEach((k, j) => { row[k] = v[j] || ''; }); rows.push(row);
  }
  return { h, rows };
};

/* ── CellValue ── */
function CellValue({ value }) {
  const s = String(value ?? '');
  const re = /(https?:\/\/[^\s,)"'<>]+)/;
  if (!re.test(s)) return s;
  return (<span>{s.split(re).map((part, i) =>
    re.test(part) ? <a key={i} href={part} target="_blank" rel="noopener noreferrer"
      style={{ color: '#4f46e5', textDecoration: 'underline' }}>{part}</a> : part
  )}</span>);
}

/* ── Pagination ── */
const PG_SIZES = [10, 25, 50, 100];
function Pagination({ total, page, size, onPage, onSize }) {
  const pages = size === 'all' ? 1 : Math.ceil(total / size);
  const eff = size === 'all' ? total : size;
  const s = (page - 1) * eff + 1, e = Math.min(page * eff, total);
  const info = isJa
    ? `${total.toLocaleString(locale)}${t('totalRows')} ${s.toLocaleString(locale)}${t('to')}${e.toLocaleString(locale)}${t('rows')}`
    : `${t('showing')} ${s.toLocaleString(locale)}${t('to')}${e.toLocaleString(locale)} ${t('pageOf')} ${total.toLocaleString(locale)} ${t('totalRows')}`;
  const B = ({ onClick, disabled, children }) => (
    <button onClick={onClick} disabled={disabled} style={{ padding: 4, borderRadius: 4,
      cursor: disabled ? 'not-allowed' : 'pointer', opacity: disabled ? 0.3 : 1, background: 'none', border: 'none' }}>{children}</button>
  );
  return (
    <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: 12, marginTop: 12, fontSize: 12, color: '#6b7280' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <span>{t('rowsPerPage')}:</span>
        <select value={size} onChange={(ev) => { onSize(ev.target.value === 'all' ? 'all' : Number(ev.target.value)); onPage(1); }}
          style={{ padding: '2px 6px', border: '1px solid #d1d5db', borderRadius: 4, fontSize: 12 }}>
          {PG_SIZES.map(n => <option key={n} value={n}>{n}</option>)}
          <option value="all">{t('all')}</option>
        </select>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
        <span style={{ color: '#9ca3af', marginRight: 4 }}>{info}</span>
        {size !== 'all' && pages > 1 && <>
          <B onClick={() => onPage(1)} disabled={page <= 1}><ChevronsLeft size={16} /></B>
          <B onClick={() => onPage(page - 1)} disabled={page <= 1}><ChevronLeft size={16} /></B>
          <span style={{ padding: '0 8px', fontVariantNumeric: 'tabular-nums' }}>{page} {t('pageOf')} {pages}</span>
          <B onClick={() => onPage(page + 1)} disabled={page >= pages}><ChevronRight size={16} /></B>
          <B onClick={() => onPage(pages)} disabled={page >= pages}><ChevronsRight size={16} /></B>
        </>}
      </div>
    </div>
  );
}

/* ── Column Settings Panel ── */
function ColPanel({ cols, onToggle, onToggleAll, onReorder, onReset, onClose }) {
  const dragFrom = useRef(null), dragTo = useRef(null);
  return (
    <div style={{ position: 'absolute', right: 0, top: 32, zIndex: 50, background: '#fff',
      border: '1px solid #e5e7eb', borderRadius: 8, boxShadow: '0 4px 12px rgba(0,0,0,.1)',
      padding: 12, minWidth: 220, maxHeight: 320, overflowY: 'auto' }}
      onClick={(ev) => ev.stopPropagation()}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        marginBottom: 8, paddingBottom: 8, borderBottom: '1px solid #f3f4f6' }}>
        <span style={{ fontSize: 12, fontWeight: 600, color: '#374151' }}>{t('colSettings')}</span>
        <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#9ca3af', fontSize: 14 }}>\u2715</button>
      </div>
      <div style={{ display: 'flex', gap: 4, marginBottom: 8 }}>
        {[['showAll', true], ['hideAll', false]].map(([k, v]) => (
          <button key={k} onClick={() => onToggleAll(v)}
            style={{ fontSize: 11, padding: '2px 8px', borderRadius: 4, border: '1px solid #e5e7eb', background: '#f9fafb', cursor: 'pointer' }}>{t(k)}</button>
        ))}
        <button onClick={onReset} style={{ fontSize: 11, padding: '2px 8px', borderRadius: 4, border: '1px solid #e5e7eb', background: '#f9fafb', cursor: 'pointer' }}>{t('resetOrder')}</button>
      </div>
      {cols.map((c, i) => (
        <div key={c.key} draggable
          onDragStart={() => { dragFrom.current = i; }}
          onDragEnter={() => { dragTo.current = i; }}
          onDragOver={(ev) => ev.preventDefault()}
          onDragEnd={() => { if (dragFrom.current !== null && dragTo.current !== null && dragFrom.current !== dragTo.current) onReorder(dragFrom.current, dragTo.current); dragFrom.current = null; dragTo.current = null; }}
          style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '4px 4px', borderRadius: 4, cursor: 'grab', userSelect: 'none' }}>
          <GripVertical size={14} color="#d1d5db" />
          <label style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, color: '#374151', cursor: 'pointer', flex: 1 }}>
            <input type="checkbox" checked={c.visible} onChange={() => onToggle(c.key)} style={{ accentColor: '#6366f1' }} />
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
    e.preventDefault(); e.stopPropagation();
    const startX = e.clientX, startW = widths[colKey] || 150;
    const onMove = (ev) => { setWidths(prev => ({ ...prev, [colKey]: Math.max(60, Math.min(600, startW + (ev.clientX - startX))) })); };
    const onUp = () => { document.removeEventListener('mousemove', onMove); document.removeEventListener('mouseup', onUp); document.body.style.cursor = ''; document.body.style.userSelect = ''; };
    document.body.style.cursor = 'col-resize'; document.body.style.userSelect = 'none';
    document.addEventListener('mousemove', onMove); document.addEventListener('mouseup', onUp);
  };
  const resetWidths = (keys) => { const w = {}; keys.forEach(k => { w[k] = 150; }); setWidths(w); };
  return { widths, onMouseDown, resetWidths };
}

/* ── DataTable ── */
function DataTable({ headers, rows, isArrayRows, onEditRow, onDeleteRow }) {
  const [cols, setCols] = useState(() => headers.map(h => ({ key: h, visible: true })));
  const [sortKey, setSortKey] = useState(null);
  const [sortDir, setSortDir] = useState('asc');
  const [panel, setPanel] = useState(false);
  const [pg, setPg] = useState(1);
  const [pgSize, setPgSize] = useState(25);

  const initW = () => { const w = {}; headers.forEach(h => { w[h] = 150; }); return w; };
  const { widths, onMouseDown, resetWidths } = useColumnResize(initW());

  const prevH = useRef(headers);
  if (JSON.stringify(headers) !== JSON.stringify(prevH.current)) {
    prevH.current = headers; setCols(headers.map(h => ({ key: h, visible: true })));
    resetWidths(headers); setSortKey(null); setPg(1);
  }

  const visCols = useMemo(() => cols.filter(c => c.visible), [cols]);
  const hasActions = !isArrayRows && (onEditRow || onDeleteRow);

  const getVal = (row, colKey) => {
    if (isArrayRows) { const idx = headers.indexOf(colKey); return idx >= 0 ? (row[idx] ?? '') : ''; }
    return row[colKey] ?? '';
  };

  const sortedWithIdx = useMemo(() => {
    const mapped = rows.map((row, idx) => ({ row, origIdx: idx }));
    if (!sortKey) return mapped;
    return [...mapped].sort((a, b) => {
      const va = getVal(a.row, sortKey), vb = getVal(b.row, sortKey);
      const na = Number(va), nb = Number(vb);
      if (!isNaN(na) && va !== '' && !isNaN(nb) && vb !== '') return sortDir === 'asc' ? na - nb : nb - na;
      return sortDir === 'asc' ? String(va).localeCompare(String(vb), locale) : String(vb).localeCompare(String(va), locale);
    });
  }, [rows, sortKey, sortDir]);

  const total = sortedWithIdx.length;
  const eff = pgSize === 'all' ? total : pgSize;
  const pageItems = pgSize === 'all' ? sortedWithIdx : sortedWithIdx.slice((pg - 1) * eff, pg * eff);

  const handleSort = (key) => {
    if (sortKey === key) { if (sortDir === 'asc') setSortDir('desc'); else { setSortKey(null); setSortDir('asc'); } }
    else { setSortKey(key); setSortDir('asc'); }
    setPg(1);
  };
  const reorder = (from, to) => { setCols(prev => { const a = [...prev]; const [item] = a.splice(from, 1); a.splice(to, 0, item); return a; }); };
  const totalWidth = visCols.reduce((s, c) => s + (widths[c.key] || 150), 0) + (hasActions ? 80 : 0);

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 8, position: 'relative' }}>
        <button onClick={() => setPanel(!panel)}
          style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 12, color: '#6b7280',
            background: 'none', border: '1px solid #e5e7eb', borderRadius: 6, padding: '4px 10px', cursor: 'pointer' }}>
          <Settings2 size={14} />{t('colSettings')}
        </button>
        {panel && <ColPanel cols={cols}
          onToggle={(k) => setCols(p => p.map(c => c.key === k ? { ...c, visible: !c.visible } : c))}
          onToggleAll={(v) => setCols(p => p.map(c => ({ ...c, visible: v })))}
          onReorder={reorder}
          onReset={() => { setCols(headers.map(h => ({ key: h, visible: true }))); resetWidths(headers); }}
          onClose={() => setPanel(false)} />}
      </div>
      <div style={{ overflowX: 'auto', border: '1px solid #e5e7eb', borderRadius: 8 }}>
        <table style={{ borderCollapse: 'collapse', tableLayout: 'fixed', width: totalWidth }}>
          <colgroup>
            {hasActions && <col style={{ width: 80 }} />}
            {visCols.map(col => <col key={col.key} style={{ width: widths[col.key] || 150 }} />)}
          </colgroup>
          <thead>
            <tr>
              {hasActions && (
                <th style={{ padding: '8px 8px', textAlign: 'center', fontWeight: 600, fontSize: 12,
                  color: '#374151', borderBottom: '2px solid #e5e7eb', background: '#f9fafb', width: 80 }}>
                  {t('actions')}
                </th>
              )}
              {visCols.map(col => (
                <th key={col.key}
                  style={{ padding: '8px 16px 8px 12px', textAlign: 'left', fontWeight: 600, fontSize: 12,
                    color: '#374151', borderBottom: '2px solid #e5e7eb', whiteSpace: 'nowrap',
                    cursor: 'pointer', userSelect: 'none', position: 'relative', overflow: 'hidden',
                    background: sortKey === col.key ? '#eef2ff' : '#f9fafb' }}
                  onClick={() => handleSort(col.key)}>
                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, maxWidth: '100%', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {col.key}
                    {sortKey === col.key && (sortDir === 'asc' ? <ChevronUp size={14} color="#6366f1" /> : <ChevronDown size={14} color="#6366f1" />)}
                  </span>
                  <div style={{ position: 'absolute', right: 0, top: 0, bottom: 0, width: 6, cursor: 'col-resize', zIndex: 2, borderRight: '2px solid transparent', transition: 'border-color 0.15s' }}
                    onMouseEnter={(e) => { e.currentTarget.style.borderRight = '2px solid #a5b4fc'; }}
                    onMouseLeave={(e) => { e.currentTarget.style.borderRight = '2px solid transparent'; }}
                    onMouseDown={(e) => onMouseDown(col.key, e)} />
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {pageItems.map(({ row, origIdx }, ri) => (
              <tr key={ri} style={{ background: ri % 2 === 0 ? '#fff' : '#fafafa' }}>
                {hasActions && (
                  <td style={{ padding: '4px 4px', borderBottom: '1px solid #f3f4f6', textAlign: 'center', verticalAlign: 'top' }}>
                    <div style={{ display: 'flex', gap: 2, justifyContent: 'center' }}>
                      {onEditRow && (
                        <button style={{ padding: '2px 6px', fontSize: 11, border: '1px solid #e5e7eb', borderRadius: 4, background: '#fff', cursor: 'pointer', display: 'inline-flex', alignItems: 'center' }}
                          onClick={() => onEditRow({ rowIndex: origIdx, row })}>
                          <Edit3 size={12} />
                        </button>
                      )}
                      {onDeleteRow && (
                        <button style={{ padding: '2px 6px', fontSize: 11, border: '1px solid #fecaca', borderRadius: 4, background: '#fff', cursor: 'pointer', color: '#dc2626', display: 'inline-flex', alignItems: 'center' }}
                          onClick={() => onDeleteRow(origIdx)}>
                          <Trash2 size={12} />
                        </button>
                      )}
                    </div>
                  </td>
                )}
                {visCols.map(col => (
                  <td key={col.key} style={{ padding: '6px 12px', borderBottom: '1px solid #f3f4f6', fontSize: 12, color: '#4b5563', verticalAlign: 'top', overflow: 'hidden' }}>
                    <div style={{ overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', wordBreak: 'break-word', lineHeight: '1.5' }}>
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
}

/* ══════════════════════════════════════════
   AI API Callers
   ══════════════════════════════════════════ */

async function callOpenAI(model, prompt) {
  const res = await fetch('/api/openai', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      model,
      messages: [{ role: 'user', content: prompt }],
      max_tokens: 16000,
    }),
  });
  if (!res.ok) throw new Error(`OpenAI API ${res.status}: ${await res.text()}`);
  const d = await res.json();
  return d.choices[0].message.content;
}

async function callGemini(model, prompt) {
  const res = await fetch(`/api/gemini/${model}`, {
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

/* ══════════════════════════════════════════
   Main App
   ══════════════════════════════════════════ */
export default function App() {
  const [allRows, setAllRows] = useState([]);
  const [csvStr, setCsvStr] = useState('');
  const [headers, setHeaders] = useState([]);
  const [fileInfo, setFileInfo] = useState(null);
  const [query, setQuery] = useState('');
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState('');
  const [error, setError] = useState('');
  const [composing, setComposing] = useState(false);
  const [editModal, setEditModal] = useState(null);
  const [wideMode, setWideMode] = useState(true);
  const [dataOpen, setDataOpen] = useState(true);

  // AI provider state
  const [provider, setProvider] = useState('openai');
  const [model, setModel] = useState(AI_PROVIDERS.openai.defaultModel);

  const isMac = /Mac|iPhone|iPad/.test(navigator.userAgent);
  const hintText = isMac ? t('submitHint') : t('submitHintWin');

  const handleProviderChange = (newProvider) => {
    setProvider(newProvider);
    setModel(AI_PROVIDERS[newProvider].defaultModel);
  };

  // ── CRUD Callbacks ──
  const handleRowUpdate = (rowIndex, newRow) => {
    setAllRows(prev => { const a = [...prev]; a[rowIndex] = newRow; return a; });
  };
  const handleRowAdd = (newRow) => { setAllRows(prev => [...prev, newRow]); };
  const handleRowDelete = (rowIndex) => { setAllRows(prev => prev.filter((_, i) => i !== rowIndex)); };
  const handleLoadDataset = (ds) => {
    setHeaders(ds.headers); setAllRows(ds.rows);
    setCsvStr(rowsToCsv(ds.rows, ds.headers));
    setFileInfo({ name: ds.name, type: ds.fileType, rows: ds.rows.length, cols: ds.headers.length });
    setResult(null); setError('');
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
        hdrs = [...new Set(rows.flatMap(r => Object.keys(r)))];
      } else if (ext === 'csv') {
        const p = parseCsv(text); hdrs = p.h; rows = p.rows;
      } else { setError(t('errorUnsupportedFormat')); return; }
      setHeaders(hdrs); setAllRows(rows); setCsvStr(syncCsv(hdrs, rows));
      setFileInfo({ name: file.name, type: ext.toUpperCase(), rows: rows.length, cols: hdrs.length });
      setResult(null); setError('');
    } catch (err) { setError(t('errorReadingFile') + err.message); }
  };

  const analyze = async () => {
    const currentCsv = syncCsv(headers, allRows);
    setCsvStr(currentCsv);
    if (!currentCsv || !query.trim()) { setError(t('errorUploadAndQuery')); return; }
    setLoading(true); setStatus(t('planningAnalysis')); setError('');
    try {
      const sample = currentCsv.trim().split('\n').slice(0, 6).join('\n');
      const lang = isJa ? '\u30c1\u30e3\u30fc\u30c8\u306e\u30bf\u30a4\u30c8\u30eb\u30fb\u30e9\u30d9\u30eb\u306f\u3059\u3079\u3066\u65e5\u672c\u8a9e\u3067\u3002' : 'Respond in English.';
      const prompt = `CSV data (first 5 rows):\n${sample}\n\nTotal rows: ${allRows.length}\nRequest: "${query}"\n\nWrite JS code. Parse csvData (CSV string), analyze, output:\nanalysisResult = { type: 'bar_chart'|'line_chart'|'table'|'count', data: ... };\n\nStructures:\n- bar_chart/line_chart: { labels: string[], values: number[], title?: string }\n- table: { headers: string[], rows: any[][] }\n- count: { value: number|string, label?: string }\n\n${lang}\n\nReturn ONLY JS code. No markdown/backticks.`;

      setStatus(`${AI_PROVIDERS[provider].label} (${model}) ...`);

      let code;
      if (provider === 'openai') {
        code = await callOpenAI(model, prompt);
      } else {
        code = await callGemini(model, prompt);
      }

      // Strip markdown code fences if present
      code = code.replace(/^```(?:javascript|js)?\n?/i, '').replace(/\n?```$/i, '').trim();

      setStatus(t('calculatingResults'));
      const fn = new Function('csvData', code + '\nreturn analysisResult;');
      setResult(fn(currentCsv));
    } catch (err) { setError(t('errorDuringAnalysis') + err.message); }
    finally { setLoading(false); setStatus(''); }
  };

  const renderResult = () => {
    if (!result) return null;
    const { type, data } = result;
    if (type === 'bar_chart') {
      const d = data.labels.map((l, i) => ({ name: l, value: data.values[i] }));
      return (<div style={{ marginTop: 16 }}><h3 style={{ fontSize: 16, fontWeight: 600, marginBottom: 12 }}>{data.title || t('barChart')}</h3><ResponsiveContainer width="100%" height={400}><BarChart data={d}><CartesianGrid strokeDasharray="3 3" /><XAxis dataKey="name" tick={{ fontSize: 12 }} /><YAxis tick={{ fontSize: 12 }} /><Tooltip /><Legend /><Bar dataKey="value" fill="#6366f1" radius={[4, 4, 0, 0]} /></BarChart></ResponsiveContainer></div>);
    }
    if (type === 'line_chart') {
      const d = data.labels.map((l, i) => ({ name: l, value: data.values[i] }));
      return (<div style={{ marginTop: 16 }}><h3 style={{ fontSize: 16, fontWeight: 600, marginBottom: 12 }}>{data.title || t('lineChart')}</h3><ResponsiveContainer width="100%" height={400}><LineChart data={d}><CartesianGrid strokeDasharray="3 3" /><XAxis dataKey="name" tick={{ fontSize: 12 }} /><YAxis tick={{ fontSize: 12 }} /><Tooltip /><Legend /><Line type="monotone" dataKey="value" stroke="#6366f1" strokeWidth={2} dot={{ r: 3 }} /></LineChart></ResponsiveContainer></div>);
    }
    if (type === 'table') {
      return (<div style={{ marginTop: 16 }}><h3 style={{ fontSize: 16, fontWeight: 600, marginBottom: 12 }}>{t('tableResults')}</h3><DataTable headers={data.headers} rows={data.rows} isArrayRows={true} /></div>);
    }
    if (type === 'count') {
      return (<div style={{ marginTop: 16, textAlign: 'center', padding: '32px 0' }}><p style={{ fontSize: 13, color: '#6b7280', marginBottom: 8 }}>{data.label || t('countResult')}</p><p style={{ fontSize: 48, fontWeight: 700, color: '#6366f1' }}>{typeof data.value === 'number' ? data.value.toLocaleString(locale) : data.value}</p></div>);
    }
    return null;
  };

  /* ── Row Edit Modal ── */
  const RowEditModalInline = () => {
    if (!editModal) return null;
    const isNew = editModal === 'new';
    const initVals = {};
    headers.forEach(h => { initVals[h] = isNew ? '' : (editModal.row?.[h] ?? ''); });
    const [vals, setVals] = useState(initVals);
    return (
      <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,.3)', zIndex: 100,
        display: 'flex', alignItems: 'center', justifyContent: 'center' }}
        onClick={() => setEditModal(null)}>
        <div style={{ background: '#fff', borderRadius: 12, padding: 24, width: '90%', maxWidth: 520,
          maxHeight: '80vh', overflowY: 'auto', boxShadow: '0 8px 32px rgba(0,0,0,.15)' }}
          onClick={(e) => e.stopPropagation()}>
          <h3 style={{ fontSize: 16, fontWeight: 600, marginBottom: 16 }}>
            {isNew ? (isJa ? '\u884c\u3092\u8ffd\u52a0' : 'Add Row') : (isJa ? '\u884c\u3092\u7de8\u96c6' : 'Edit Row')}
          </h3>
          {headers.map(h => (
            <div key={h} style={{ marginBottom: 12 }}>
              <label style={{ fontSize: 12, fontWeight: 500, color: '#4b5563', display: 'block', marginBottom: 4 }}>{h}</label>
              <input value={vals[h]} onChange={(e) => setVals(prev => ({ ...prev, [h]: e.target.value }))}
                style={{ width: '100%', padding: '6px 10px', fontSize: 13, border: '1px solid #d1d5db', borderRadius: 6, boxSizing: 'border-box' }} />
            </div>
          ))}
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8, marginTop: 16 }}>
            <button style={{ padding: '6px 14px', fontSize: 13, border: '1px solid #e5e7eb', borderRadius: 6, background: '#fff', cursor: 'pointer' }}
              onClick={() => setEditModal(null)}>{isJa ? '\u30ad\u30e3\u30f3\u30bb\u30eb' : 'Cancel'}</button>
            <button style={{ padding: '6px 14px', fontSize: 13, border: 'none', borderRadius: 6, background: '#6366f1', color: '#fff', cursor: 'pointer' }}
              onClick={() => { if (isNew) handleRowAdd(vals); else handleRowUpdate(editModal.rowIndex, vals); setEditModal(null); }}>
              {isJa ? '\u4fdd\u5b58' : 'Save'}
            </button>
          </div>
        </div>
      </div>
    );
  };

  const selectStyle = {
    padding: '4px 8px', fontSize: 12, border: '1px solid #d1d5db',
    borderRadius: 6, background: '#fff', color: '#374151', cursor: 'pointer',
  };

  return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(135deg, #f8fafc, #eef2ff 50%)', padding: 24 }}>
      <div style={{ maxWidth: wideMode ? 1440 : 960, margin: '0 auto', transition: 'max-width 0.3s ease' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 4, flexWrap: 'wrap', gap: 8 }}>
          <h1 style={{ fontSize: 24, fontWeight: 700 }}>{t('pageTitle')}</h1>

          {/* AI Provider / Model Selector + Width Toggle */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <Bot size={16} color="#6366f1" />
            <select value={provider} onChange={(e) => handleProviderChange(e.target.value)} style={selectStyle}>
              {Object.entries(AI_PROVIDERS).map(([key, cfg]) => (
                <option key={key} value={key}>{cfg.label}</option>
              ))}
            </select>
            <select value={model} onChange={(e) => setModel(e.target.value)} style={selectStyle}>
              {AI_PROVIDERS[provider].models.map((m) => (
                <option key={m.id} value={m.id}>{m.label}</option>
              ))}
            </select>
            <button onClick={() => setWideMode(w => !w)} title={wideMode ? 'Compact' : 'Wide'}
              style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                width: 32, height: 32, borderRadius: 6, border: '1px solid #d1d5db',
                background: wideMode ? '#eef2ff' : '#fff', cursor: 'pointer', color: '#6366f1',
                transition: 'background 0.15s' }}>
              {wideMode ? <Minimize2 size={16} /> : <Maximize2 size={16} />}
            </button>
          </div>
        </div>
        <p style={{ fontSize: 13, color: '#6b7280', marginBottom: 24 }}>{t('instructionsText')}</p>

        {/* Data Management Accordion */}
        <div style={{ marginTop: 8, border: '1px solid #e5e7eb', borderRadius: 10, background: '#fff', overflow: 'hidden' }}>
          <div onClick={() => setDataOpen(o => !o)}
            style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              padding: '10px 16px', cursor: 'pointer', userSelect: 'none',
              background: dataOpen ? '#f9fafb' : '#fff', transition: 'background 0.15s' }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, fontWeight: 600, color: '#374151' }}>
              <Upload size={16} color="#6366f1" />{t('dataManagement')}
              {fileInfo && (
                <span style={{ fontSize: 11, fontWeight: 400, color: '#9ca3af', marginLeft: 4 }}>
                  ({fileInfo.name} - {allRows.length.toLocaleString(locale)} {t('rows')})
                </span>
              )}
            </span>
            {dataOpen ? <ChevronUp size={18} color="#9ca3af" /> : <ChevronDown size={18} color="#9ca3af" />}
          </div>
          {dataOpen && (
            <div style={{ padding: '16px 16px 20px' }}>
              {/* Upload */}
              <label style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: 112,
                border: '2px dashed #d1d5db', borderRadius: 12, background: '#f9fafb', cursor: 'pointer' }}
                onDragOver={(e) => e.preventDefault()} onDrop={(e) => { e.preventDefault(); loadFile(e.dataTransfer?.files?.[0]); }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12, color: '#6b7280' }}>
                  <Upload size={24} /><span style={{ fontSize: 14 }}>{t('uploadText')}</span>
                </div>
                <input type="file" style={{ display: 'none' }} accept=".csv,.json" onChange={(e) => loadFile(e.target.files[0])} />
              </label>
              <p style={{ textAlign: 'center', fontSize: 12, color: '#9ca3af', marginTop: 8 }}>
                {t('sampleDataLink')}{' '}
                <a href={t('sampleDataUrl')} target="_blank" rel="noopener noreferrer" style={{ color: '#6366f1', textDecoration: 'underline' }}>{t('sampleDataUrl')}</a>
              </p>

              {/* Dataset Manager */}
              <div style={{ marginTop: 16 }}>
                <DatasetManager headers={headers} rows={allRows} fileInfo={fileInfo}
                  onLoad={handleLoadDataset} onRowAdd={handleRowAdd} />
              </div>

              {/* File info */}
              {fileInfo && (
                <div style={{ marginTop: 16, display: 'flex', alignItems: 'center', gap: 12, fontSize: 12, color: '#6b7280' }}>
                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, padding: '4px 10px',
                    borderRadius: 99, background: '#e0e7ff', color: '#4338ca', fontWeight: 500 }}>
                    {fileInfo.type === 'JSON' ? <FileJson size={14} /> : <FileText size={14} />}{fileInfo.type}
                  </span>
                  <span>{fileInfo.name}</span><span>&bull;</span>
                  <span>{allRows.length.toLocaleString(locale)} {t('rows')} &times; {headers.length} {t('columns')}</span>
                </div>
              )}

              {/* Preview with CRUD */}
              {allRows.length > 0 && (
                <div style={{ marginTop: 24 }}>
                  <h2 style={{ fontSize: 13, fontWeight: 600, color: '#4b5563', marginBottom: 8,
                    display: 'flex', alignItems: 'center', gap: 6 }}>
                    <FileText size={16} />{t('dataPreviewTitle')}
                  </h2>
                  <DataTable headers={headers} rows={allRows} isArrayRows={false}
                    onEditRow={(info) => setEditModal(info)}
                    onDeleteRow={(idx) => handleRowDelete(idx)} />
                </div>
              )}
            </div>
          )}
        </div>

        {/* Analysis input */}
        {headers.length > 0 && (
          <div style={{ marginTop: 24 }}>
            <h2 style={{ fontSize: 13, fontWeight: 600, color: '#4b5563', marginBottom: 8 }}>{t('analysisRequestTitle')}</h2>
            <div style={{ display: 'flex', gap: 12 }}>
              <div style={{ flex: 1, position: 'relative' }}>
                <textarea value={query} onChange={(e) => setQuery(e.target.value)}
                  onCompositionStart={() => setComposing(true)} onCompositionEnd={() => setComposing(false)}
                  onKeyDown={(e) => {
                    if (composing) return;
                    const mod = isMac ? e.metaKey : e.ctrlKey;
                    if (e.key === 'Enter' && mod && !loading && query.trim()) { e.preventDefault(); analyze(); }
                    if (e.key === 'Enter' && !e.shiftKey && !mod) e.preventDefault();
                  }}
                  placeholder={t('analysisPlaceholder')} rows={2} disabled={loading}
                  style={{ width: '100%', padding: '10px 14px', fontSize: 14, border: '1px solid #d1d5db', borderRadius: 8, resize: 'none', boxSizing: 'border-box' }} />
                <span style={{ position: 'absolute', right: 12, bottom: 8, fontSize: 11, color: '#9ca3af', pointerEvents: 'none' }}>{hintText}</span>
              </div>
              <button onClick={analyze} disabled={loading || !query.trim()}
                style={{ padding: '10px 20px', fontSize: 14, fontWeight: 500, color: '#fff',
                  background: loading || !query.trim() ? '#d1d5db' : '#6366f1', border: 'none', borderRadius: 8,
                  cursor: loading || !query.trim() ? 'not-allowed' : 'pointer', whiteSpace: 'nowrap', alignSelf: 'flex-start' }}>
                {loading ? t('processingButton') : t('runAnalysisButton')}
              </button>
            </div>
          </div>
        )}

        {loading && (
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 12, padding: '48px 0' }}>
            <Loader2 size={24} color="#6366f1" className="animate-spin" /><span style={{ fontSize: 14, color: '#6b7280' }}>{status}</span>
          </div>
        )}
        {error && (<div style={{ marginTop: 16, padding: 12, background: '#fef2f2', border: '1px solid #fecaca', borderRadius: 8, fontSize: 13, color: '#b91c1c' }}>{error}</div>)}
        {!loading && result && (<div style={{ marginTop: 24, background: '#fff', border: '1px solid #e5e7eb', borderRadius: 12, padding: 24 }}>{renderResult()}</div>)}

        <RowEditModalInline />
      </div>
    </div>
  );
}
