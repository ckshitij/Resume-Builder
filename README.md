# Resume Builder

Full-stack resume builder with a React TypeScript UI, Go API, PostgreSQL storage, and Docker Compose.

## Features

- **Live preview** — edits update the preview instantly
- **Add/remove sections** — summary, experience, education, skills, projects, certifications, languages, and custom blocks
- **Reorder sections** — control section order on the resume
- **ATS compatibility** — dedicated ATS template, live score, and export checks
- **Templates** — ATS Optimized, Classic, Modern, Minimal
- **Export** — download as PDF or DOCX
- **Embedded assets** — SQL migrations and templates ship inside the Go binary

## Quick start

```bash
docker compose up --build
```

- UI: http://localhost:3000
- API: http://localhost:8080

## Local development

### Backend

```bash
cd backend
# Start Postgres (or use docker compose up db)
export DB_HOST=localhost DB_USER=resume DB_PASSWORD=resume DB_NAME=resume_builder
go run ./cmd/server
```

### Frontend

```bash
cd frontend
npm install
npm run dev
```

The Vite dev server proxies `/api` to `http://localhost:8080`.

## API

| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/resumes` | List resumes |
| POST | `/api/resumes` | Create resume |
| GET | `/api/resumes/{id}` | Get resume |
| PUT | `/api/resumes/{id}` | Update resume |
| DELETE | `/api/resumes/{id}` | Delete resume |
| POST | `/api/resumes/export/pdf` | Export PDF from data |
| POST | `/api/resumes/export/docx` | Export DOCX from data |
| GET | `/api/templates` | List templates |
| GET | `/api/section-types` | List section types |

## ATS tips

- Use the **ATS Optimized** template for job applications
- Keep standard headings: "Work Experience", "Education", "Skills"
- Use plain text contact info and comma-separated skills
- Format dates as `YYYY-MM`
- Use one achievement per line in experience descriptions
