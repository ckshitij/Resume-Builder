import appCss from '../App.css?raw';
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { ResumePreview } from '../components/ResumePreview';
import type { ResumeData } from '../types/resume';

const printOverrides = `
@page {
  size: letter;
  margin: 0.45in 0.5in;
}

html, body {
  margin: 0;
  padding: 0;
  background: #fff;
}

body {
  -webkit-print-color-adjust: exact;
  print-color-adjust: exact;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-rendering: optimizeLegibility;
}

/* Let content flow naturally across pages — not one fixed 11in box */
.resume-page {
  box-shadow: none !important;
  margin: 0 !important;
  padding: 0 !important;
  width: auto !important;
  max-width: none !important;
  min-height: auto !important;
  height: auto !important;
  overflow: visible !important;
}

/* Keep section headings with the content that follows */
.resume-page h1,
.resume-page h2,
.contact-row {
  break-after: avoid-page;
  page-break-after: avoid;
}

/* Keep each job, education row, project, etc. on one page when possible */
.entry {
  break-inside: avoid-page;
  page-break-inside: avoid;
}

/* Avoid orphaned single bullet lines */
.entry ul {
  break-inside: auto;
  page-break-inside: auto;
}

.entry li {
  orphans: 2;
  widows: 2;
}

.entry-role-line,
.entry-meta,
.entry-company-desc {
  break-after: avoid-page;
  page-break-after: avoid;
}

/* Skill pills can wrap across pages */
.resume-section-skills {
  break-inside: auto;
  page-break-inside: auto;
}
`;

function wrapPrintDocument(body: string): string {
  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<style>${printOverrides}${appCss}</style>
</head>
<body>${body}</body>
</html>`;
}

/** Capture the live preview DOM so PDF matches exactly what is on screen. */
export function buildResumePrintHtml(data: ResumeData): string {
  const live = document.querySelector('.preview-canvas .resume-page');
  if (live) {
    return wrapPrintDocument(live.outerHTML);
  }
  const markup = renderToStaticMarkup(createElement(ResumePreview, { data }));
  return wrapPrintDocument(markup);
}
