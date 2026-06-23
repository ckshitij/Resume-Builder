# Chrome Web Store Listing

Copy the sections below into the [Chrome Web Store Developer Dashboard](https://chrome.google.com/webstore/devconsole) when submitting **Resume Builder**.

---

## Package

Build the upload zip:

```bash
cd extension
npm run package:store
```

Upload: `extension/release/resume-builder-extension.zip`

---

## Store listing

### Name

```
Resume Builder
```

### Summary (short description, max 132 characters)

```
Build ATS-friendly resumes with live preview. Saved locally on your device — no account required.
```

### Description

```
Resume Builder helps you create professional, ATS-friendly resumes directly in Chrome.

FEATURES
• Live preview — see your resume update as you type
• Section manager — add, remove, and reorder Experience, Education, Skills, Projects, and more
• Four templates — ATS Optimized, Classic, Modern, Minimal
• Fonts & colors — customize appearance with ATS-safe options
• ATS score — real-time compatibility checks with actionable tips
• PDF export — download a print-ready PDF that matches your preview
• Auto-save — your work is saved locally every few seconds
• Multiple resumes — create, switch, and delete saved resumes

PRIVACY FIRST
• No account or sign-up required
• Resume data is stored locally in your browser (IndexedDB)
• Your content is never uploaded to our servers
• We do not sell user data

HOW TO USE
1. Click the extension icon to open the side panel
2. Fill in your details and customize your design
3. Export PDF — allow pop-ups if prompted, then choose "Save as PDF" in the print dialog

Open source: https://github.com/ckshitij/Resume-Builder
```

### Category

**Productivity**

### Language

**English**

---

## Privacy practices

### Privacy policy URL

Host `docs/privacy-policy.html` via GitHub Pages, then use:

```
https://ckshitij.github.io/Resume-Builder/docs/privacy-policy.html
```

To enable GitHub Pages: repo **Settings → Pages → Source: Deploy from branch → main → /docs** (or root with path).

Until Pages is live, you can also host the file on any public HTTPS URL.

### Single purpose

```
Help users create, edit, and export professional resumes locally in the browser.
```

### Permission justifications

| Permission | Justification |
|---|---|
| `storage` | Save resume data locally in the browser so edits persist between sessions. |
| `sidePanel` | Display the resume editor and live preview in Chrome's side panel. |

### Data usage certification

- Does **not** sell user data
- Does **not** use data for unrelated purposes
- Does **not** use data for creditworthiness or lending

### Remote code

**No** — all code is bundled in the extension package.

---

## Graphic assets

| Asset | File |
|---|---|
| Store icon (128×128) | `extension/icons/icon128.png` |
| Screenshots | Capture from side panel after loading unpacked extension |

**Screenshot tips (1280×800 or 640×400):**
1. Editor with sections sidebar + live preview
2. Design panel with template/font options
3. ATS score panel
4. Saved resumes list
5. PDF print preview (optional)

---

## Distribution

- **Visibility:** Public (or Unlisted for beta testing)
- **Regions:** All regions (or your preference)
- **Pricing:** Free

---

## Pre-submit checklist

- [ ] `npm run package:store` succeeds
- [ ] Privacy policy URL is live (HTTPS)
- [ ] Icons are final (not placeholder)
- [ ] 1–5 screenshots uploaded
- [ ] Version bumped in `extension/manifest.json` for updates
- [ ] Tested on fresh Chrome profile (install unpacked from `dist/`)

---

## After approval

Share link format:

```
https://chrome.google.com/webstore/detail/<extension-id>
```

The extension ID is shown in the developer dashboard after first upload.
