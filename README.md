# Resume Builder

A full-stack resume builder for creating, customizing, and exporting professional resumes. Build in the browser with a live preview, manage sections dynamically, validate ATS compatibility, and download polished **PDF** or **DOCX** files.

Built with **React + TypeScript** on the frontend, **Go** on the backend, and **PostgreSQL** for persistence — all orchestrated with **Docker Compose**.

---

## Table of contents

- [Why use this?](#why-use-this)
- [Features](#features)
- [Architecture](#architecture)
- [Tech stack](#tech-stack)
- [Quick start](#quick-start)
- [Local development](#local-development)
- [Using the app](#using-the-app)
- [Templates & customization](#templates--customization)
- [ATS compatibility](#ats-compatibility)
- [API reference](#api-reference)
- [Project structure](#project-structure)
- [Chrome extension](#chrome-extension)
- [Configuration](#configuration)
- [Troubleshooting](#troubleshooting)

---

## Why use this?

Job applications increasingly pass through **Applicant Tracking Systems (ATS)** before a human ever sees your resume. This project helps you:

1. **Edit visually** — see changes instantly in a live preview pane
2. **Stay flexible** — add, remove, and reorder resume sections on the fly
3. **Stay safe for ATS** — use an ATS-optimized template, real-time score, and actionable checks
4. **Export anywhere** — download PDF for applications or DOCX for further editing in Word

---

## Features

### Editor & sections

| Capability | Details |
|---|---|
| **Live preview** | Right-hand preview updates as you type — no save-and-refresh cycle |
| **Section manager** | Enable, hide, reorder, and rename sections |
| **Add/remove blocks** | Summary, Work Experience, Education, Skills, Projects, Certifications, Languages, Custom |
| **Per-item editing** | Add multiple jobs, degrees, projects, etc. within each section |
| **Drag-and-drop** | Reorder sections and entries in the sidebar and editor |
| **Rich text** | Use `*italic*` and `**bold**` in experience bullets and company descriptions |
| **Location picker** | Country, state, and city fields with optional remote flag for work experience |
| **Contact icons** | LinkedIn, GitHub, email, phone, and location shown with icons in preview and PDF |
| **Auto-save** | Changes debounce and persist to the API every 2 seconds |
| **Saved resumes** | Load and switch between previously saved resumes |

### Design & export

| Capability | Details |
|---|---|
| **4 templates** | ATS Optimized, Classic, Modern, Minimal |
| **25 fonts** | ATS-safe system fonts + Google Fonts (serif, sans-serif, modern) |
| **28 color presets** | Grouped palettes (neutrals, blues, greens, warm, purple, red) + custom hex |
| **Font size** | Adjustable from 9pt to 14pt with live preview |
| **PDF export** | WYSIWYG — captures the live preview and prints via headless Chromium |
| **DOCX export** | Word-compatible document built from embedded OOXML templates |

### ATS tooling

| Capability | Details |
|---|---|
| **ATS score ring** | Live percentage based on 8 compatibility checks |
| **Actionable tips** | Failed checks show specific guidance to fix issues |
| **ATS-safe mode** | Restricts fonts and colors to parser-friendly options |
| **Standard headings** | Warns when section titles deviate from ATS conventions |

---

## Architecture

```mermaid
flowchart LR
  subgraph client [Browser]
    UI[React UI]
    Preview[Live Preview]
    UI --> Preview
  end

  subgraph docker [Docker Compose]
    FE[Nginx + React]
    BE[Go API + Chromium]
    DB[(PostgreSQL)]
  end

  UI -->|REST /api| FE
  FE -->|proxy| BE
  BE --> DB
  Preview -->|HTML snapshot| BE
  BE -->|PDF / DOCX| UI
```

**Request flow**

1. The React app calls `/api/*` (proxied to the Go backend in dev and production).
2. Resume JSON is stored in PostgreSQL (`resumes.data` JSONB column).
3. **PDF export** — the frontend captures the live preview DOM, sends it as HTML with the resume data, and the backend prints it to PDF using headless Chromium (chromedp). The downloaded PDF matches the preview (fonts, icons, skill pills, rich text).
4. **DOCX export** — generated server-side from resume JSON using embedded OOXML templates.
5. SQL migrations and document templates are **embedded in the Go binary** via `go:embed` — no external files required at runtime.

---

## Tech stack

| Layer | Technology |
|---|---|
| Frontend | React 18, TypeScript, Vite |
| Backend | Go 1.22, chi router, pgx |
| Database | PostgreSQL 16 |
| PDF generation | Headless Chromium (chromedp); gofpdf fallback for saved-resume GET export |
| DOCX generation | Embedded OOXML + archive/zip |
| Containers | Docker, Docker Compose, Nginx |

---

## Quick start

**Prerequisites:** Docker and Docker Compose

```bash
git clone <repo-url>
cd resume-builder
docker compose up --build
```

| Service | URL |
|---|---|
| **UI** | http://localhost:3000 |
| **API** | http://localhost:8080 |
| **Health check** | http://localhost:8080/health |

Stop services:

```bash
docker compose down
```

The backend image includes **Chromium** for PDF export (~600 MB). The first `docker compose up --build` may take a few minutes.

Reset the database (removes all saved resumes):

```bash
docker compose down -v
```

---

## Local development

Run each service independently for faster iteration.

### 1. Database

```bash
docker compose up db
```

Default credentials:

| Variable | Value |
|---|---|
| `DB_HOST` | `localhost` |
| `DB_PORT` | `5432` |
| `DB_USER` | `resume` |
| `DB_PASSWORD` | `resume` |
| `DB_NAME` | `resume_builder` |

### 2. Backend

```bash
cd backend
export DB_HOST=localhost DB_USER=resume DB_PASSWORD=resume DB_NAME=resume_builder
go run ./cmd/server
```

API listens on **:8080**. Migrations run automatically on startup from embedded SQL files.

> **Note:** PDF export from the editor requires **Chromium** on the backend. The Docker image includes Chromium automatically. For local `go run` without Docker, install Chrome/Chromium and set `CHROMIUM_PATH` if needed (see [Configuration](#configuration)).

### 3. Frontend

```bash
cd frontend
npm install
npm run dev
```

Dev server: **http://localhost:5173** — Vite proxies `/api` and `/health` to `http://localhost:8080`.

### Build for production

```bash
# Frontend
cd frontend && npm run build

# Backend
cd backend && go build -o server ./cmd/server
```

---

## Using the app

### Layout

The workspace has three panes:

```
┌──────────────┬─────────────────────┬──────────────┐
│   Sidebar    │       Editor        │   Preview    │
│  (tabs)      │  (active section)   │  (live)      │
└──────────────┴─────────────────────┴──────────────┘
```

**Sidebar tabs**

| Tab | Purpose |
|---|---|
| **Sections** | Manage section order, visibility, and headings |
| **Design** | Pick template, fonts, colors, and font size |
| **ATS** | View compatibility score and fix failing checks |
| **Saved** | Load previously saved resumes |

### Typical workflow

1. Fill in **Contact** information (name, email, phone).
2. Write a **Professional Summary** (2–4 sentences).
3. Add **Work Experience** entries — one bullet per line for achievements.
4. Add **Education**, **Skills**, and optional sections.
5. Open the **ATS** tab and aim for **80%+** before exporting.
6. Click **PDF** or **DOCX** in the header to download.

**PDF export** uses whatever you see in the live preview — including template styling, contact icons, skill pills, and rich text. Hard-refresh the browser after pulling updates if export behavior seems stale.

---

## Templates & customization

### Templates

| Template | Layout | ATS-friendly |
|---|---|---|
| **ATS Optimized** | Single column, standard fonts, plain headings | Yes |
| **Classic** | Single column with section dividers | Yes |
| **Modern** | Two-column with colored sidebar | No |
| **Minimal** | Centered typography | No |

### Fonts (25 options)

- **ATS Safe** — Arial, Helvetica, Calibri, Verdana, Tahoma, Times New Roman, Georgia, Garamond, Cambria
- **Sans Serif** — Lato, Open Sans, Roboto, Source Sans 3, Work Sans
- **Modern** — Inter, Montserrat, Poppins, Nunito, Raleway
- **Serif** — Merriweather, Playfair Display, Libre Baskerville, Crimson Text, Lora, EB Garamond

### Colors (28 presets + custom)

Grouped swatches: Neutrals, Blues & Teals, Greens, Warm tones, Purples, Reds — plus a hex input and native color picker.

When **ATS-safe mode** is enabled, only dark accent colors and ATS-friendly fonts are available.

---

## ATS compatibility

### What the score checks

| Check | What it validates |
|---|---|
| ATS-friendly layout | Template is single-column (ATS or Classic) |
| Contact information | Full name, email, and phone are present |
| Standard section headings | Titles match conventions like "Work Experience" |
| Consistent date format | Dates use `YYYY` or `YYYY-MM` |
| Skills as plain text | Skills are comma-separated text, not graphics |
| No empty sections | Enabled sections have content |
| Concise summary | Summary is 50–600 characters |
| Bullet-point experience | Descriptions use line breaks for bullets |

### Best practices

- Use the **ATS Optimized** template when applying online
- Keep headings standard: `Professional Summary`, `Work Experience`, `Education`, `Skills`
- Put contact info in plain text fields — linked URLs are fine; decorative graphics reduce parser compatibility
- List skills as comma-separated text: `Go, TypeScript, React, PostgreSQL`
- Format dates as `2021-01` (not `Jan 2021` or `01/2021`)
- Write one achievement per line in experience descriptions
- Avoid tables, text boxes, headers/footers, and multi-column layouts for ATS submissions

---

## API reference

Base URL: `http://localhost:8080`

### Resumes

| Method | Path | Description |
|---|---|---|
| `GET` | `/api/resumes` | List all resumes (newest first) |
| `POST` | `/api/resumes` | Create a resume |
| `GET` | `/api/resumes/{id}` | Get a resume by ID |
| `PUT` | `/api/resumes/{id}` | Update a resume |
| `DELETE` | `/api/resumes/{id}` | Delete a resume |

### Export

| Method | Path | Description |
|---|---|---|
| `GET` | `/api/resumes/{id}/export/pdf` | Export saved resume as PDF (legacy gofpdf renderer) |
| `GET` | `/api/resumes/{id}/export/docx` | Export saved resume as DOCX |
| `POST` | `/api/resumes/export/pdf` | Export PDF from `{ data, html }` — used by the editor (headless Chromium) |
| `POST` | `/api/resumes/export/docx` | Export DOCX from request body (no save required) |

The editor POSTs PDF exports as:

```json
{
  "data": { /* full ResumeData object */ },
  "html": "<!DOCTYPE html>..."
}
```

The `html` field is a snapshot of the live preview DOM with embedded print CSS. It is required for POST PDF export.

### Metadata

| Method | Path | Description |
|---|---|---|
| `GET` | `/api/templates` | List available resume templates |
| `GET` | `/api/section-types` | List addable section types |
| `GET` | `/health` | Health check (`{"status":"ok"}`) |

### Example: create a resume

```bash
curl -X POST http://localhost:8080/api/resumes \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Software Engineer Resume",
    "data": {
      "personalInfo": {
        "fullName": "Jane Doe",
        "email": "jane@example.com",
        "phone": "+1 555 123 4567",
        "location": "San Francisco, CA",
        "summary": "Full-stack engineer with 5+ years of experience."
      },
      "sections": [],
      "experience": [],
      "education": [],
      "skills": ["Go", "React", "PostgreSQL"],
      "projects": [],
      "certifications": [],
      "languages": [],
      "customSections": [],
      "customization": {
        "templateId": "ats",
        "primaryColor": "#1a1a1a",
        "fontFamily": "Arial, Helvetica, sans-serif",
        "fontSize": 11,
        "atsMode": true
      }
    }
  }'
```

---

## Project structure

```
resume-builder/
├── docker-compose.yml          # Postgres + backend + frontend
├── README.md
│
├── backend/
│   ├── cmd/server/main.go      # HTTP server entrypoint
│   ├── internal/
│   │   ├── assets/             # go:embed migrations, HTML/DOCX templates
│   │   ├── database/           # Connection + migration runner
│   │   ├── export/             # Chromium PDF, gofpdf fallback, DOCX generation
│   │   ├── handlers/           # REST API handlers
│   │   ├── models/             # Resume data types
│   │   └── repository/         # PostgreSQL queries
│   ├── Dockerfile
│   └── go.mod
│
├── shared/                     # Shared React UI (web + extension)
│   └── src/
│       ├── components/         # Editor, preview, ATS panel, etc.
│       ├── hooks/              # useResumeEditor
│       ├── templates/          # Resume templates
│       ├── types/              # TypeScript types
│       ├── utils/              # ATS, defaults, exportPrintHtml
│       └── ResumeBuilderApp.tsx
│
├── frontend/                   # Web app (API-backed)
│   ├── src/
│   │   ├── api/                # REST client
│   │   └── storage/            # HttpResumeRepository
│   ├── Dockerfile
│   ├── nginx.conf              # Proxies /api to backend
│   └── package.json
│
├── extension/                  # Chrome extension (local IndexedDB)
│   ├── manifest.json
│   ├── src/
│   │   ├── storage/            # IndexedDB repository
│   │   └── export/             # Client-side PDF via print
│   └── package.json
│
└── docs/
    └── chrome-extension-plan.md
```

---

## Chrome extension

A **local-first** Chrome extension reuses the shared editor and stores resumes in **IndexedDB** on your device — no server required.

```bash
cd extension
npm install
npm run build
```

Load `extension/dist` as an unpacked extension in `chrome://extensions`, then click the toolbar icon to open the side panel.

See [extension/README.md](extension/README.md) and [docs/chrome-extension-plan.md](docs/chrome-extension-plan.md) for details.

---

## Configuration

### Backend environment variables

| Variable | Default | Description |
|---|---|---|
| `PORT` | `8080` | HTTP listen port |
| `DB_HOST` | `localhost` | PostgreSQL host |
| `DB_PORT` | `5432` | PostgreSQL port |
| `DB_USER` | `resume` | Database user |
| `DB_PASSWORD` | `resume` | Database password |
| `DB_NAME` | `resume_builder` | Database name |
| `DATABASE_URL` | — | Full connection string (overrides individual DB_* vars) |
| `CHROMIUM_PATH` | `/usr/bin/chromium-browser` (Docker) | Path to Chrome/Chromium binary for PDF export |
| `PDF_DEVICE_SCALE_FACTOR` | `2` | Render scale for sharper PDF text (1–3). Higher = sharper but larger files |

### Frontend environment variables

| Variable | Default | Description |
|---|---|---|
| `VITE_API_URL` | `""` (same origin) | API base URL for production builds |

---

## Troubleshooting

### UI loads but API calls fail

- Ensure the backend is running: `curl http://localhost:8080/health`
- In Docker, check backend logs: `docker compose logs backend`
- In dev, confirm Vite proxy is configured in `frontend/vite.config.ts`

### Database connection errors

- Wait for Postgres health check to pass before the backend starts
- Verify credentials match between `docker-compose.yml` and your env vars
- Reset with `docker compose down -v` if the schema is corrupted

### Export returns an error

- Ensure the resume has at least a full name in contact info
- Check backend logs: `docker compose logs backend`
- **PDF export failed** — confirm Chromium is installed (included in the backend Docker image). For local dev, set `CHROMIUM_PATH` to your Chrome/Chromium binary
- **PDF export failed (html required)** — hard-refresh the browser (`Cmd+Shift+R`) so the frontend sends the preview HTML snapshot
- Rebuild after updates: `docker compose up --build -d`

### PDF does not match the preview

- The editor uses headless Chromium and should match the live preview closely
- If the PDF looks like plain text with comma-separated skills (~7–8 KB file size), the old gofpdf path ran — rebuild frontend and backend, then hard-refresh
- If content is cut mid-section, ensure you are on the latest build (print CSS handles page breaks and multi-page flow)

### PDF text looks blurry or low resolution

- Default render scale is 2× (`PDF_DEVICE_SCALE_FACTOR=2`). Increase to `2.5` or `3` in backend environment if needed
- DOCX export uses a separate plain-text renderer and may differ from the preview

### DOCX looks different from PDF

- DOCX is generated from resume JSON, not the preview HTML. Formatting may differ from PDF; use PDF for visual fidelity and DOCX for editing in Word

---

## License

MIT (or your chosen license — update as needed)
