import { createRoot } from 'react-dom/client';
import ResumeBuilderApp from '@shared/ResumeBuilderApp';
import '@shared/App.css';
import './extension.css';
import { exportPdfViaPrint, indexedDbRepository } from './storage/indexedDbRepository';

createRoot(document.getElementById('root')!).render(
  <ResumeBuilderApp
    repository={indexedDbRepository}
    tagline="Saved locally · No account required"
    showDocxExport={false}
    exportPDF={exportPdfViaPrint}
    exportPdfSuccessMessage="Print dialog opened — choose Save as PDF"
  />,
);
