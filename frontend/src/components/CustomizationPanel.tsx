import type { Customization, TemplateId } from '../types/resume';

interface Props {
  customization: Customization;
  onChange: (patch: Partial<Customization>) => void;
}

const TEMPLATES: { id: TemplateId; name: string; atsFriendly: boolean }[] = [
  { id: 'ats', name: 'ATS Optimized', atsFriendly: true },
  { id: 'classic', name: 'Classic', atsFriendly: true },
  { id: 'modern', name: 'Modern', atsFriendly: false },
  { id: 'minimal', name: 'Minimal', atsFriendly: false },
];

const FONTS = [
  'Arial, Helvetica, sans-serif',
  'Georgia, serif',
  'Times New Roman, serif',
  'Calibri, sans-serif',
];

export function CustomizationPanel({ customization, onChange }: Props) {
  const setTemplate = (id: TemplateId) => {
    const atsFriendly = id === 'ats' || id === 'classic';
    onChange({
      templateId: id,
      atsMode: atsFriendly,
      ...(id === 'ats' ? { fontFamily: 'Arial, Helvetica, sans-serif', primaryColor: '#1a1a1a' } : {}),
    });
  };

  return (
    <div className="panel customization-panel">
      <h3>Design</h3>
      <label>
        Template
        <div className="template-grid">
          {TEMPLATES.map((t) => (
            <button
              key={t.id}
              type="button"
              className={`template-btn ${customization.templateId === t.id ? 'active' : ''}`}
              onClick={() => setTemplate(t.id)}
            >
              {t.name}
              {t.atsFriendly && <span className="badge">ATS</span>}
            </button>
          ))}
        </div>
      </label>
      <label className="checkbox">
        <input
          type="checkbox"
          checked={customization.atsMode}
          onChange={(e) => onChange({ atsMode: e.target.checked, templateId: e.target.checked ? 'ats' : customization.templateId })}
        />
        Force ATS-safe export (single column, standard fonts)
      </label>
      {!customization.atsMode && (customization.templateId === 'modern' || customization.templateId === 'minimal') && (
        <p className="warning">This template may not parse well in ATS systems.</p>
      )}
      <label>
        Accent color
        <input type="color" value={customization.primaryColor} onChange={(e) => onChange({ primaryColor: e.target.value })} disabled={customization.atsMode} />
      </label>
      <label>
        Font
        <select value={customization.fontFamily} onChange={(e) => onChange({ fontFamily: e.target.value })} disabled={customization.atsMode}>
          {FONTS.map((f) => <option key={f} value={f}>{f.split(',')[0]}</option>)}
        </select>
      </label>
      <label>
        Font size ({customization.fontSize}pt)
        <input type="range" min={9} max={14} value={customization.fontSize} onChange={(e) => onChange({ fontSize: Number(e.target.value) })} />
      </label>
    </div>
  );
}
