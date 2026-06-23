import { createRoot } from 'react-dom/client';
import ResumeBuilderApp from '@shared/ResumeBuilderApp';
import { exportDocxViaApi, exportPdfViaApi, httpResumeRepository } from './storage/httpRepository';

createRoot(document.getElementById('root')!).render(
  <ResumeBuilderApp
    repository={httpResumeRepository}
    exportPDF={exportPdfViaApi}
    exportDOCX={exportDocxViaApi}
  />,
);
