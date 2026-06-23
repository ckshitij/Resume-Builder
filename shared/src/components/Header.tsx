import { IconDocument, IconDownload } from './Icons';

interface HeaderProps {
  title: string;
  onTitleChange: (title: string) => void;
  saved: boolean;
  saving: boolean;
  onNew: () => void;
  onSave: () => void;
  onExportPDF: () => void;
  onExportDOCX?: () => void;
  exporting: string | null;
  tagline?: string;
  showTitleLabel?: boolean;
}

export function Header({
  title,
  onTitleChange,
  saved,
  saving,
  onNew,
  onSave,
  onExportPDF,
  onExportDOCX,
  exporting,
  tagline = 'ATS-ready · Live preview',
  showTitleLabel = false,
}: HeaderProps) {
  return (
    <header className="app-header">
      <div className="header-brand">
        <div className="brand-icon">
          <IconDocument />
        </div>
        <div>
          <h1>Resume Builder</h1>
          <p className="brand-tagline">{tagline}</p>
        </div>
      </div>

      <div className="header-center">
        <label className="title-field">
          {showTitleLabel ? (
            <span className="title-field-label">Resume name</span>
          ) : (
            <span className="sr-only">Resume title</span>
          )}
          <input
            className="title-input"
            value={title}
            onChange={(e) => onTitleChange(e.target.value)}
            placeholder="e.g. Software Engineer 2026"
          />
        </label>
        <div className={`save-pill ${saving ? 'saving' : saved ? 'saved' : 'unsaved'}`}>
          <span className="save-dot" />
          {saving ? 'Saving…' : saved ? 'All changes saved' : 'Unsaved changes'}
        </div>
      </div>

      <div className="header-actions">
        <button type="button" className="btn btn-ghost" onClick={onNew}>New</button>
        <button type="button" className="btn btn-secondary" onClick={onSave} disabled={saving}>
          Save
        </button>
        <div className="btn-group">
          <button
            type="button"
            className="btn btn-primary"
            onClick={onExportPDF}
            disabled={!!exporting}
          >
            <IconDownload />
            {exporting === 'pdf' ? 'Exporting…' : 'PDF'}
          </button>
          {onExportDOCX && (
            <button
              type="button"
              className="btn btn-primary"
              onClick={onExportDOCX}
              disabled={!!exporting}
            >
              <IconDownload />
              {exporting === 'docx' ? 'Exporting…' : 'DOCX'}
            </button>
          )}
        </div>
      </div>
    </header>
  );
}
