# CSV / JSON Data Visualizer

> [Japanese version (README.md)](./README.md)

A client-side application that renders CSV and JSON files as interactive tables, with AI-powered natural language analysis and chart generation.

---

## Concept

**"See, touch, and query your data — entirely in the browser."**

Most data analysis tools require environment setup or programming knowledge. This application aims to let you start previewing, editing, and analyzing data instantly, just by dropping a CSV or JSON file into the browser.

Analysis instructions are given in natural language. Type something like "Show the top 10 sales as a bar chart" and the AI generates aggregation code, executes it, and returns the result as a chart or table. No need to learn SQL or spreadsheet formulas.

Data is stored in the browser's localStorage. The only external communication happens when sending an AI analysis request. The design prioritizes privacy.

---

## Features

### Data Operations

- Upload CSV / JSON files via drag & drop or file picker
- Automatically flatten nested JSON structures into tabular format
- Sort columns (ascending / descending / reset — 3-state toggle)
- Drag-resize column widths
- Toggle column visibility, reorder columns by drag
- Pagination (10 / 25 / 50 / 100 / All)
- Add, edit, and delete rows (CRUD)
- Save, load, rename, and export datasets (CSV / JSON)

### AI Analysis

- Describe analysis in natural language; AI generates and executes aggregation code
- Results rendered as bar charts, line charts, tables, or summary values
- Supported providers and models:
  - **OpenAI**: GPT-5 Nano (default), GPT-5 Mini, GPT-4.1 Mini, GPT-4.1 Nano
  - **Gemini**: Gemini 2.5 Flash, Gemini 2.5 Pro, Gemini 2.0 Flash
- Switch providers and models on the fly via the selector at the top

### Display & UI

- URL cells rendered as clickable links with hover preview popups
- Image URLs displayed as thumbnails (40x40) with hover enlargement
- Toggle between wide mode (1440px) and compact mode (960px)
- Automatic language switching (Japanese / English) based on browser locale
- IME-aware submission — Cmd+Enter / Ctrl+Enter to explicitly send

---

## Architecture

### Tech Stack

| Category | Technology | Rationale |
|---|---|---|
| Framework | React 19 | Component-oriented with straightforward state management |
| Build Tool | Vite 7 | Fast HMR and minimal configuration |
| Charts | Recharts | React-native declarative chart components |
| Icons | Lucide React | Lightweight, tree-shakable icon set |
| Testing | Vitest + Testing Library | Integrated test environment for Vite projects |
| Package Manager | pnpm | Fast and strict dependency resolution |

### Design Philosophy

The application follows a **single-file-centric structure**.

`App.jsx` consolidates the core logic for table rendering, AI analysis, column settings, pagination, and CRUD — minimizing data-passing between components. This is a deliberate choice for a small-to-medium utility app, avoiding the navigation overhead of excessive file splitting.

Only two modules with clear independent responsibilities are separated:

```
src/
├── App.jsx                    # Application core (UI + logic)
├── components/
│   └── DatasetManager.jsx     # Dataset management UI (save / load / CRUD)
└── lib/
    └── storage.js             # Storage abstraction layer
```

### Storage Abstraction

Data persistence is handled by `LocalStorageAdapter` in `storage.js`. A unified interface makes it possible to swap storage implementations.

```
list()              → List all datasets (metadata only)
getById(id)         → Get a single dataset with full data
create(data)        → Create new dataset
update(id, data)    → Update dataset
remove(id)          → Delete dataset
addRow(id, row)     → Add a row
updateRow(id, idx, row) → Update a row
removeRow(id, idx)  → Delete a row
```

To migrate to Firebase or Supabase, simply replace the adapter with one implementing the same interface — no changes needed in `App.jsx` or `DatasetManager.jsx`.

```js
// Current
export const storage = new LocalStorageAdapter();

// Firebase migration
import { db } from './firebase';
export const storage = new FirebaseAdapter(db);
```

### AI Analysis Flow

```
User input (natural language)
    ↓
Send to AI API along with data structure (headers + sample rows)
    ↓
AI generates JavaScript aggregation code
    ↓
Execute code in the browser and capture results
    ↓
Render based on result type (bar chart / line chart / table / summary)
```

### API Proxy

To prevent API key leakage, all AI API requests are routed through Vite's dev server proxy. Keys are attached server-side in headers, never sent from the browser directly.

| Endpoint | Forwards to |
|---|---|
| `/api/openai` | `https://api.openai.com/v1/chat/completions` |
| `/api/gemini/<model>` | `https://generativelanguage.googleapis.com/v1beta/models/<model>:generateContent` |

> For production, switch to a backend proxy (Express, Next.js API Routes, etc.).

### Internationalization (i18n)

Automatically switches between Japanese and English based on `navigator.language`. Translation definitions are embedded directly in `TR` objects within each component, with no external library dependency.

---

## Project Structure

```
CSV-Visual/
├── index.html                    # SPA entry point
├── vite.config.js                # Vite config + API proxy
├── package.json
├── .env                          # API keys (Git-ignored)
├── public/                       # Static assets (favicons, etc.)
├── docs/                         # Documentation
│   ├── setup.md                  # Setup guide
│   ├── architecture.md           # Architecture details
│   └── testing.md                # Testing guide
└── src/
    ├── main.jsx                  # React entry point
    ├── index.css                 # Global styles
    ├── App.jsx                   # Main component
    ├── App.test.jsx              # App tests
    ├── components/
    │   ├── DatasetManager.jsx    # Dataset save / load / CRUD
    │   └── DatasetManager.test.jsx
    ├── lib/
    │   ├── storage.js            # Storage abstraction layer
    │   └── storage.test.js
    └── test/
        └── setup.js              # Shared test setup
```

---

## Setup

### Prerequisites

- Node.js 18+
- pnpm (npm and yarn also work, but the lockfile is pnpm format)

### Install & Run

```bash
pnpm install
pnpm dev
```

The browser opens `http://localhost:5173` automatically.

### Environment Variables

Create a `.env` file at the project root with the API keys for the providers you use.

```
VITE_OPENAI_API_KEY=your-openai-api-key
VITE_GEMINI_API_KEY=your-gemini-api-key
```

Keys for unused providers can be left empty. `.env` is listed in `.gitignore` and will not be committed.

> See [docs/setup.md](./docs/setup.md) for detailed instructions.

---

## Development Commands

```bash
pnpm dev       # Start dev server (HMR enabled)
pnpm build     # Production build (output to dist/)
pnpm preview   # Preview the production build
pnpm test      # Run tests (Vitest)
pnpm lint      # Static analysis (ESLint)
```

---

## Testing

Testing is built on Vitest and Testing Library.

```bash
pnpm test              # Run all tests
pnpm test -- --watch   # Watch mode
```

| Test file | Scope |
|---|---|
| `storage.test.js` | Storage adapter CRUD, row operations, export |
| `DatasetManager.test.jsx` | Save button display, dialog behavior, dataset list |
| `App.test.jsx` | Helper functions, UI interactions |

> See [docs/testing.md](./docs/testing.md) for details.

---

## Documentation

| Document | Contents |
|---|---|
| [docs/setup.md](./docs/setup.md) | Setup guide (including from-scratch instructions) |
| [docs/architecture.md](./docs/architecture.md) | Architecture details |
| [docs/testing.md](./docs/testing.md) | Testing guide |

---

## License

MIT
