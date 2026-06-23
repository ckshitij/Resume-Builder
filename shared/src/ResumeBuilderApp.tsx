import { useCallback, useEffect, useMemo, useState } from 'react';
import { ATSPanel } from './components/ATSPanel';
import { CustomizationPanel } from './components/CustomizationPanel';
import { Header } from './components/Header';
import { IconFolder, IconLayers, IconPalette, IconShield } from './components/Icons';
import { PreviewPanel } from './components/PreviewPanel';
import { SectionEditor } from './components/SectionEditor';
import { SectionManager } from './components/SectionManager';
import { SavedResumesPanel } from './components/SavedResumesPanel';
import { SidebarTabs } from './components/Sidebar';
import { Toast } from './components/Toast';
import { useResumeEditor, type SaveEvent } from './hooks/useResumeEditor';
import type { ResumeRepository } from './storage/repository';
import type { Resume, ResumeData } from './types/resume';
import { atsScore, runATSChecks } from './utils/ats';
import { buildResumePrintHtml } from './utils/exportPrintHtml';
import './App.css';

type SidebarTab = 'sections' | 'design' | 'ats' | 'saved';
type MobileView = 'edit' | 'preview';

export interface ResumeBuilderAppProps {
  repository: ResumeRepository;
  tagline?: string;
  showDocxExport?: boolean;
  exportPDF?: (data: ResumeData, html: string, filename: string) => Promise<void>;
  exportDOCX?: (data: ResumeData, filename: string) => Promise<void>;
  exportPdfSuccessMessage?: string;
  exportDocxSuccessMessage?: string;
}

export default function ResumeBuilderApp({
  repository,
  tagline = 'ATS-ready · Live preview',
  showDocxExport = true,
  exportPDF,
  exportDOCX,
  exportPdfSuccessMessage = 'PDF downloaded successfully',
  exportDocxSuccessMessage = 'DOCX downloaded successfully',
}: ResumeBuilderAppProps) {
  const [toast, setToast] = useState<{ message: string; type: 'error' | 'success' } | null>(null);

  const handleSaved = useCallback((event: SaveEvent) => {
    setToast({
      message: event.auto
        ? `"${event.title}" auto-saved`
        : `"${event.title}" saved successfully`,
      type: 'success',
    });
  }, []);

  const editor = useResumeEditor({ repository, onSaved: handleSaved });
  const [activeSectionId, setActiveSectionId] = useState<string>('sec-personal');
  const [sidebarTab, setSidebarTab] = useState<SidebarTab>('sections');
  const [mobileView, setMobileView] = useState<MobileView>('edit');
  const [resumes, setResumes] = useState<Resume[]>([]);
  const [exporting, setExporting] = useState<string | null>(null);
  const [previewExpanded, setPreviewExpanded] = useState(false);

  const atsChecks = useMemo(() => runATSChecks(editor.data), [editor.data]);
  const score = atsScore(atsChecks);

  const refreshResumes = useCallback(() => {
    repository.list().then(setResumes).catch(() => setResumes([]));
  }, [repository]);

  useEffect(() => {
    refreshResumes();
  }, [editor.saved, editor.resumeId, refreshResumes]);

  const handleDeletedResume = useCallback((id: string) => {
    setResumes((prev) => prev.filter((r) => r.id !== id));
    if (editor.resumeId === id) {
      editor.newResume();
      setActiveSectionId('sec-personal');
    }
    setToast({ message: 'Resume deleted', type: 'success' });
  }, [editor]);

  const handleExport = async (format: 'pdf' | 'docx') => {
    setExporting(format);
    try {
      const name = editor.data.personalInfo.fullName || editor.title || 'resume';
      if (format === 'pdf') {
        if (!exportPDF) throw new Error('PDF export is not configured');
        const html = buildResumePrintHtml(editor.data);
        await exportPDF(editor.data, html, name);
      } else {
        if (!exportDOCX) throw new Error('DOCX export is not available');
        await exportDOCX(editor.data, name);
      }
      setToast({
        message: format === 'pdf' ? exportPdfSuccessMessage : exportDocxSuccessMessage,
        type: 'success',
      });
    } catch (e) {
      setToast({ message: e instanceof Error ? e.message : 'Export failed', type: 'error' });
    } finally {
      setExporting(null);
    }
  };

  const dismissToast = useCallback(() => setToast(null), []);

  const sidebarTabs = [
    { id: 'sections', label: 'Sections', icon: <IconLayers /> },
    { id: 'design', label: 'Design', icon: <IconPalette /> },
    { id: 'ats', label: 'ATS', icon: <IconShield /> },
    { id: 'saved', label: 'Saved', icon: <IconFolder /> },
  ];

  return (
    <div className="app">
      <Header
        title={editor.title}
        onTitleChange={editor.setTitle}
        saved={editor.saved}
        saving={editor.saving}
        onNew={editor.newResume}
        onSave={() => editor.save(false)}
        onExportPDF={() => handleExport('pdf')}
        onExportDOCX={showDocxExport && exportDOCX ? () => handleExport('docx') : undefined}
        exporting={exporting}
        tagline={tagline}
      />

      {editor.error && <div className="error-banner">{editor.error}</div>}

      <div className="mobile-tabs">
        <button type="button" className={mobileView === 'edit' ? 'active' : ''} onClick={() => setMobileView('edit')}>Edit</button>
        <button type="button" className={mobileView === 'preview' ? 'active' : ''} onClick={() => setMobileView('preview')}>Preview</button>
      </div>

      <div className={`workspace ${previewExpanded ? 'preview-expanded' : 'preview-collapsed'}`}>
        <aside className={`sidebar-left ${mobileView === 'edit' ? '' : 'mobile-hidden'}`}>
          <SidebarTabs activeTab={sidebarTab} onTabChange={(id) => setSidebarTab(id as SidebarTab)} tabs={sidebarTabs} />

          <div className="sidebar-content">
            {sidebarTab === 'sections' && (
              <SectionManager
                sections={editor.data.sections}
                availableToAdd={editor.availableToAdd}
                onAdd={editor.addSection}
                onRemove={editor.removeSection}
                onReorder={editor.reorderSection}
                onMoveSection={editor.moveSection}
                onUpdate={editor.updateSection}
                activeSectionId={activeSectionId}
                onSelect={setActiveSectionId}
              />
            )}
            {sidebarTab === 'design' && (
              <CustomizationPanel
                customization={editor.data.customization}
                onChange={(patch) => editor.setData((prev) => ({
                  ...prev,
                  customization: { ...prev.customization, ...patch },
                }))}
              />
            )}
            {sidebarTab === 'ats' && <ATSPanel checks={atsChecks} />}
            {sidebarTab === 'saved' && (
              <SavedResumesPanel
                resumes={resumes}
                activeResumeId={editor.resumeId}
                repository={repository}
                onLoad={(r) => { editor.loadResume(r); setActiveSectionId('sec-personal'); }}
                onDeleted={handleDeletedResume}
                onError={(msg) => setToast({ message: msg, type: 'error' })}
              />
            )}
          </div>

          {sidebarTab !== 'ats' && (
            <div className="sidebar-ats-mini" onClick={() => setSidebarTab('ats')} role="button" tabIndex={0} onKeyDown={(e) => e.key === 'Enter' && setSidebarTab('ats')}>
              <IconShield />
              <span>ATS Score</span>
              <strong className={score >= 80 ? 'good' : score >= 50 ? 'warn' : 'bad'}>{score}%</strong>
            </div>
          )}
        </aside>

        <main className={`editor-main ${mobileView === 'edit' ? '' : 'mobile-hidden'}`}>
          <SectionEditor
            data={editor.data}
            activeSectionId={activeSectionId}
            onChange={editor.setData}
          />
        </main>

        <div className={`preview-pane-wrapper ${mobileView === 'preview' ? 'mobile-preview-active' : ''}`}>
          <PreviewPanel
            data={editor.data}
            expanded={previewExpanded}
            onToggleExpand={() => setPreviewExpanded((v) => !v)}
          />
        </div>
      </div>

      {toast && <Toast message={toast.message} type={toast.type} onClose={dismissToast} />}
    </div>
  );
}
