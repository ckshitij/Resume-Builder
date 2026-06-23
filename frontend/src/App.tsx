import { useEffect, useMemo, useState } from 'react';
import { api } from './api/client';
import { ATSPanel } from './components/ATSPanel';
import { CustomizationPanel } from './components/CustomizationPanel';
import { ResumePreview } from './components/ResumePreview';
import { SectionEditor } from './components/SectionEditor';
import { SectionManager } from './components/SectionManager';
import { useResumeEditor } from './hooks/useResumeEditor';
import type { Resume } from './types/resume';
import { runATSChecks } from './utils/ats';
import './App.css';

export default function App() {
  const editor = useResumeEditor();
  const [activeSectionId, setActiveSectionId] = useState<string>('sec-personal');
  const [resumes, setResumes] = useState<Resume[]>([]);
  const [exporting, setExporting] = useState<string | null>(null);

  const atsChecks = useMemo(() => runATSChecks(editor.data), [editor.data]);

  useEffect(() => {
    api.listResumes().then(setResumes).catch(() => setResumes([]));
  }, [editor.saved, editor.resumeId]);

  const handleExport = async (format: 'pdf' | 'docx') => {
    setExporting(format);
    try {
      const name = editor.data.personalInfo.fullName || editor.title || 'resume';
      if (format === 'pdf') await api.exportPDF(editor.data, name);
      else await api.exportDOCX(editor.data, name);
    } catch (e) {
      alert(e instanceof Error ? e.message : 'Export failed');
    } finally {
      setExporting(null);
    }
  };

  return (
    <div className="app">
      <header className="app-header">
        <h1>Resume Builder</h1>
        <div className="header-actions">
          <input
            className="title-input"
            value={editor.title}
            onChange={(e) => { editor.setTitle(e.target.value); }}
            aria-label="Resume title"
          />
          <span className={`save-status ${editor.saved ? 'saved' : 'unsaved'}`}>
            {editor.saving ? 'Saving…' : editor.saved ? 'Saved' : 'Unsaved'}
          </span>
          <button type="button" onClick={editor.newResume}>New</button>
          <button type="button" onClick={editor.save} disabled={editor.saving}>Save</button>
          <button type="button" onClick={() => handleExport('pdf')} disabled={!!exporting}>
            {exporting === 'pdf' ? 'Exporting…' : 'Download PDF'}
          </button>
          <button type="button" onClick={() => handleExport('docx')} disabled={!!exporting}>
            {exporting === 'docx' ? 'Exporting…' : 'Download DOCX'}
          </button>
        </div>
      </header>

      {editor.error && <div className="error-banner">{editor.error}</div>}

      <div className="workspace">
        <aside className="sidebar-left">
          <SectionManager
            sections={editor.data.sections}
            availableToAdd={editor.availableToAdd}
            onAdd={editor.addSection}
            onRemove={editor.removeSection}
            onReorder={editor.reorderSection}
            onUpdate={editor.updateSection}
            activeSectionId={activeSectionId}
            onSelect={setActiveSectionId}
          />
          <CustomizationPanel
            customization={editor.data.customization}
            onChange={(patch) => editor.setData((prev) => ({
              ...prev,
              customization: { ...prev.customization, ...patch },
            }))}
          />
          <ATSPanel checks={atsChecks} />
          {resumes.length > 0 && (
            <div className="panel">
              <h3>Saved Resumes</h3>
              <ul className="resume-list">
                {resumes.map((r) => (
                  <li key={r.id}>
                    <button type="button" onClick={() => { editor.loadResume(r); setActiveSectionId('sec-personal'); }}>
                      {r.title}
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </aside>

        <main className="editor-main">
          <SectionEditor
            data={editor.data}
            activeSectionId={activeSectionId}
            onChange={editor.setData}
          />
        </main>

        <aside className="preview-pane">
          <div className="preview-header">Live Preview</div>
          <div className="preview-scroll">
            <ResumePreview data={editor.data} />
          </div>
        </aside>
      </div>
    </div>
  );
}
