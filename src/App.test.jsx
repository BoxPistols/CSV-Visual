import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import App from './App';

// ── Utility function tests (replicate module-scoped helpers) ──

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

const IMG_EXT_RE = /\.(jpe?g|png|gif|webp|svg|bmp|ico|avif)(\?.*)?$/i;
const IMG_HOST_RE = /pbs\.twimg\.com|instagram\..+\/p\/|i\.imgur\.com|images\.unsplash\.com|cdn\.discordapp\.com/;
function isImageUrl(url) {
  try { return IMG_EXT_RE.test(url) || IMG_HOST_RE.test(url); } catch { return false; }
}

describe('flattenJson', () => {
  it('flattens a simple array', () => {
    const result = flattenJson([{ a: 1, b: 2 }]);
    expect(result).toEqual([{ a: 1, b: 2 }]);
  });

  it('flattens nested objects with dot notation', () => {
    const result = flattenJson([{ user: { name: 'Alice', age: 30 }, score: 100 }]);
    expect(result).toEqual([{ 'user.name': 'Alice', 'user.age': 30, score: 100 }]);
  });

  it('handles json.data wrapper', () => {
    const result = flattenJson({ data: [{ x: 1 }] });
    expect(result).toEqual([{ x: 1 }]);
  });

  it('converts arrays to comma-separated strings', () => {
    const result = flattenJson([{ tags: ['a', 'b', 'c'] }]);
    expect(result).toEqual([{ tags: 'a, b, c' }]);
  });

  it('wraps a plain object in an array', () => {
    const result = flattenJson({ foo: 'bar' });
    expect(result).toEqual([{ foo: 'bar' }]);
  });
});

describe('rowsToCsv', () => {
  it('returns empty string for empty rows', () => {
    expect(rowsToCsv([])).toBe('');
  });

  it('converts rows to CSV string', () => {
    const rows = [{ a: '1', b: '2' }, { a: '3', b: '4' }];
    const csv = rowsToCsv(rows, ['a', 'b']);
    expect(csv).toBe('a,b\n1,2\n3,4');
  });

  it('escapes values with commas', () => {
    const csv = rowsToCsv([{ x: 'a,b' }], ['x']);
    expect(csv).toBe('x\n"a,b"');
  });

  it('escapes values with quotes', () => {
    const csv = rowsToCsv([{ x: 'say "hi"' }], ['x']);
    expect(csv).toBe('x\n"say ""hi"""');
  });
});

describe('parseCsv', () => {
  it('parses a simple CSV string', () => {
    const { h, rows } = parseCsv('name,age\nAlice,30\nBob,25');
    expect(h).toEqual(['name', 'age']);
    expect(rows).toHaveLength(2);
    expect(rows[0]).toEqual({ name: 'Alice', age: '30' });
    expect(rows[1]).toEqual({ name: 'Bob', age: '25' });
  });

  it('strips surrounding quotes from headers', () => {
    const { h } = parseCsv('"name","age"\nAlice,30');
    expect(h).toEqual(['name', 'age']);
  });
});

describe('isImageUrl', () => {
  it('detects common image extensions', () => {
    expect(isImageUrl('https://example.com/photo.jpg')).toBe(true);
    expect(isImageUrl('https://example.com/photo.png')).toBe(true);
    expect(isImageUrl('https://example.com/photo.gif')).toBe(true);
    expect(isImageUrl('https://example.com/photo.webp')).toBe(true);
    expect(isImageUrl('https://example.com/photo.avif')).toBe(true);
  });

  it('detects image URLs with query strings', () => {
    expect(isImageUrl('https://example.com/photo.jpg?w=200&h=200')).toBe(true);
  });

  it('detects known image hosting domains', () => {
    expect(isImageUrl('https://pbs.twimg.com/media/abc123')).toBe(true);
    expect(isImageUrl('https://i.imgur.com/abc.gif')).toBe(true);
    expect(isImageUrl('https://images.unsplash.com/photo-123')).toBe(true);
  });

  it('returns false for non-image URLs', () => {
    expect(isImageUrl('https://example.com/page')).toBe(false);
    expect(isImageUrl('https://example.com/doc.pdf')).toBe(false);
  });

  it('returns false for non-URL strings', () => {
    expect(isImageUrl('not a url')).toBe(false);
    expect(isImageUrl('')).toBe(false);
  });
});

// ── UI Tests ──

// Mock recharts to avoid SVG rendering issues in jsdom
vi.mock('recharts', () => ({
  LineChart: ({ children }) => <div data-testid="line-chart">{children}</div>,
  Line: () => null,
  BarChart: ({ children }) => <div data-testid="bar-chart">{children}</div>,
  Bar: () => null,
  XAxis: () => null,
  YAxis: () => null,
  CartesianGrid: () => null,
  Tooltip: () => null,
  Legend: () => null,
  ResponsiveContainer: ({ children }) => <div>{children}</div>,
}));

describe('App UI', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('renders the page title', () => {
    render(<App />);
    expect(screen.getByRole('heading', { level: 1 })).toBeInTheDocument();
  });

  it('toggles wide mode on button click', () => {
    render(<App />);
    const toggleBtns = screen.getAllByTitle(/compact|wide/i);
    const toggleBtn = toggleBtns[0];

    expect(toggleBtn).toHaveAttribute('title', 'Compact');
    fireEvent.click(toggleBtn);
    expect(toggleBtn).toHaveAttribute('title', 'Wide');
    fireEvent.click(toggleBtn);
    expect(toggleBtn).toHaveAttribute('title', 'Compact');
  });

  it('shows AI provider selector defaulting to OpenAI', () => {
    render(<App />);
    const selects = document.querySelectorAll('select');
    expect(selects.length).toBeGreaterThanOrEqual(2);
    expect(selects[0].value).toBe('openai');
    expect(selects[1].value).toBe('gpt-5-nano');
  });

  it('changes model options when switching AI provider', () => {
    render(<App />);
    const selects = document.querySelectorAll('select');
    fireEvent.change(selects[0], { target: { value: 'gemini' } });
    expect(selects[0].value).toBe('gemini');
    expect(selects[1].value).toBe('gemini-2.5-flash');
  });

  it('toggles accordion open/close', () => {
    const { container } = render(<App />);
    const chevronUp = container.querySelector('.lucide-chevron-up');
    expect(chevronUp).toBeTruthy();
    const clickableHeader = chevronUp.parentElement;

    // Initially open - file input should be in this container
    expect(container.querySelector('input[type="file"]')).toBeInTheDocument();

    // Click header to close
    fireEvent.click(clickableHeader);
    expect(container.querySelector('input[type="file"]')).not.toBeInTheDocument();
    expect(container.querySelector('.lucide-chevron-down')).toBeTruthy();

    // Click again to re-open
    const chevronDown = container.querySelector('.lucide-chevron-down');
    fireEvent.click(chevronDown.parentElement);
    expect(container.querySelector('input[type="file"]')).toBeInTheDocument();
  });

  it('shows file info after CSV upload', async () => {
    render(<App />);
    const csvContent = 'name,age\nAlice,30\nBob,25';
    const file = new File([csvContent], 'test.csv', { type: 'text/csv' });
    // Polyfill file.text() for jsdom if missing
    if (typeof file.text !== 'function') {
      file.text = () => Promise.resolve(csvContent);
    }

    const input = document.querySelector('input[type="file"]');
    expect(input).toBeTruthy();

    // Set files property on the actual input element, then fire change
    Object.defineProperty(input, 'files', { value: [file], configurable: true });
    fireEvent.change(input);

    // Wait for async file processing
    const fileName = await screen.findByText('test.csv', {}, { timeout: 3000 });
    expect(fileName).toBeInTheDocument();
  });
});
