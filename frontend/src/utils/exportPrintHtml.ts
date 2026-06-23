import appCss from '../App.css?raw';
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { ResumePreview } from '../components/ResumePreview';
import type { ResumeData } from '../types/resume';

const printOverrides = `
@page { size: letter; margin: 0; }
html, body { margin: 0; padding: 0; background: #fff; }
body { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
.resume-page { box-shadow: none !important; margin: 0 auto; }
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
