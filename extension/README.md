# Resume Builder — Chrome Extension

Local-first resume editor using the shared React UI from `../shared`.

## Features

- Full editor + live preview in a **full Chrome tab** (click the toolbar icon)
- Auto-save to **IndexedDB** (data stays on your device)
- List, load, and delete saved resumes
- PDF export via browser print (WYSIWYG)

## Development

```bash
npm install
npm run dev
```

1. Open Chrome → **Extensions** → enable **Developer mode**
2. Click **Load unpacked**
3. Select the `dist/` folder (created after first build)

While developing, `npm run dev` watches and rebuilds. Click **Reload** on the extension card after changes.

## Production / Chrome Web Store

### 1. Build store package

```bash
npm run package:store
```

This runs a production build and creates:

```
release/resume-builder-extension.zip
```

Upload that zip to the [Chrome Web Store Developer Dashboard](https://chrome.google.com/webstore/devconsole).

### 2. Privacy policy

Required for store submission. Host `../docs/privacy-policy.html` (e.g. via GitHub Pages):

```
https://ckshitij.github.io/Resume-Builder/docs/privacy-policy.html
```

### 3. Listing copy & checklist

See **[CHROME_WEB_STORE.md](./CHROME_WEB_STORE.md)** for store description, permission justifications, screenshot tips, and pre-submit checklist.

## Usage

1. Click the **Resume Builder** icon in the toolbar — opens a full tab
2. Edit your resume — changes auto-save locally every 2 seconds
3. Set the **Resume name** in the header or on the **Saved** tab
4. Open the **Saved** tab to switch or delete resumes
5. Click **PDF** — allow pop-ups if prompted, then choose **Save as PDF** in the print dialog

## Architecture

| Piece | Location |
|---|---|
| Shared UI | `../shared/src` (imported via `@shared` alias) |
| Local storage | `src/storage/indexedDbRepository.ts` |
| PDF export | `exportPdfViaPrint` — opens print HTML in new tab |
| Service worker | `src/background.ts` — opens side panel on icon click |

See [../docs/chrome-extension-plan.md](../docs/chrome-extension-plan.md) for the full roadmap.
