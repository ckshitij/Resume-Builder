# Resume Builder — Chrome Extension

Local-first resume editor using the shared React UI from `../frontend`.

## Features (v1)

- Full editor + live preview in Chrome side panel
- Auto-save to **IndexedDB** (data stays on your device)
- List, load, and delete saved resumes
- PDF export via browser print (WYSIWYG)

## Development

```bash
cd extension
npm install
npm run dev
```

1. Open Chrome → **Extensions** → enable **Developer mode**
2. Click **Load unpacked**
3. Select the `extension/dist` folder (created after first build)

While developing, `npm run dev` watches and rebuilds. Click **Reload** on the extension card after changes.

## Build

```bash
npm run build
```

Load `extension/dist` as an unpacked extension.

## Usage

1. Click the extension icon to open the **side panel**
2. Edit your resume — changes auto-save locally every 2 seconds
3. Open the **Saved** tab to switch or delete resumes
4. Click **PDF** — allow pop-ups if prompted, then choose **Save as PDF** in the print dialog

## Architecture

| Piece | Location |
|---|---|
| Shared UI | `../shared/src` (imported via `@shared` alias) |
| Local storage | `src/storage/indexedDbRepository.ts` |
| PDF export | `exportPdfViaPrint` — opens print HTML in new tab |
| Service worker | `src/background.ts` — opens side panel on icon click |

See [../docs/chrome-extension-plan.md](../docs/chrome-extension-plan.md) for the full roadmap.
