import { useMemo, useState } from 'react';
import type { Customization, TemplateId } from '../types/resume';
import {
  COLOR_GROUPS,
  FONT_CATEGORIES,
  colorsForMode,
  findFontByFamily,
  fontsForMode,
  isValidHex,
  normalizeHex,
} from '../utils/customizationOptions';

interface Props {
  customization: Customization;
  onChange: (patch: Partial<Customization>) => void;
}

const TEMPLATES: { id: TemplateId; name: string; desc: string; atsFriendly: boolean; preview: string }[] = [
  { id: 'ats', name: 'ATS Optimized', desc: 'Single column, standard fonts', atsFriendly: true, preview: 'ats' },
  { id: 'classic', name: 'Classic', desc: 'Traditional with dividers', atsFriendly: true, preview: 'classic' },
  { id: 'modern', name: 'Modern', desc: 'Sidebar layout', atsFriendly: false, preview: 'modern' },
  { id: 'minimal', name: 'Minimal', desc: 'Centered typography', atsFriendly: false, preview: 'minimal' },
];

export function CustomizationPanel({ customization, onChange }: Props) {
  const [customHex, setCustomHex] = useState(customization.primaryColor);
  const [fontFilter, setFontFilter] = useState<string>('all');

  const availableFonts = useMemo(() => fontsForMode(customization.atsMode), [customization.atsMode]);
  const availableColors = useMemo(() => colorsForMode(customization.atsMode), [customization.atsMode]);

  const filteredFonts = useMemo(() => {
    if (fontFilter === 'all') return availableFonts;
    return availableFonts.filter((f) => f.category === fontFilter);
  }, [availableFonts, fontFilter]);

  const setTemplate = (id: TemplateId) => {
    const atsFriendly = id === 'ats' || id === 'classic';
    onChange({
      templateId: id,
      atsMode: atsFriendly,
      ...(id === 'ats' ? { fontFamily: 'Arial, Helvetica, sans-serif', primaryColor: '#1a1a1a' } : {}),
    });
    if (id === 'ats') setCustomHex('#1a1a1a');
  };

  const selectColor = (hex: string) => {
    setCustomHex(hex);
    onChange({ primaryColor: hex });
  };

  const applyCustomHex = () => {
    const hex = normalizeHex(customHex);
    if (isValidHex(hex)) {
      onChange({ primaryColor: hex });
      setCustomHex(hex);
    }
  };

  const activeFont = findFontByFamily(customization.fontFamily);

  return (
    <div className="customization-panel">
      <section className="custom-section">
        <h4 className="custom-section-title">Template</h4>
        <div className="template-picker">
          {TEMPLATES.map((t) => (
            <button
              key={t.id}
              type="button"
              className={`template-card ${customization.templateId === t.id ? 'active' : ''}`}
              onClick={() => setTemplate(t.id)}
            >
              <div className={`template-preview template-preview-${t.preview}`}>
                <div className="tp-bar" style={t.preview === 'modern' ? { background: customization.primaryColor } : undefined} />
                <div className="tp-lines"><span /><span /><span /></div>
              </div>
              <div className="template-card-info">
                <span className="template-name">{t.name}</span>
                <span className="template-desc">{t.desc}</span>
                {t.atsFriendly && <span className="badge-ats">ATS</span>}
              </div>
            </button>
          ))}
        </div>
      </section>

      <label className="toggle-row">
        <input
          type="checkbox"
          checked={customization.atsMode}
          onChange={(e) => onChange({
            atsMode: e.target.checked,
            templateId: e.target.checked ? 'ats' : customization.templateId,
          })}
        />
        <span className="toggle-slider" />
        <span className="toggle-label">ATS-safe mode</span>
      </label>

      {customization.atsMode && (
        <p className="panel-hint">Only ATS-friendly fonts and dark accent colors are shown.</p>
      )}

      {!customization.atsMode && (customization.templateId === 'modern' || customization.templateId === 'minimal') && (
        <div className="alert alert-warn">Multi-column layouts may not parse correctly in ATS systems.</div>
      )}

      <section className="custom-section">
        <h4 className="custom-section-title">Accent color</h4>
        {COLOR_GROUPS.map((group) => {
          const colors = availableColors.filter((c) => c.group === group.id);
          if (colors.length === 0) return null;
          return (
            <div key={group.id} className="color-group">
              <span className="color-group-label">{group.label}</span>
              <div className="color-swatches">
                {colors.map((c) => (
                  <button
                    key={c.id}
                    type="button"
                    className={`color-swatch ${customization.primaryColor.toLowerCase() === c.hex ? 'active' : ''}`}
                    style={{ background: c.hex }}
                    title={c.label}
                    onClick={() => selectColor(c.hex)}
                  >
                    {customization.primaryColor.toLowerCase() === c.hex && <span className="swatch-check">✓</span>}
                  </button>
                ))}
              </div>
            </div>
          );
        })}

        <div className="custom-color-row">
          <input
            type="color"
            className="color-picker-native"
            value={customization.primaryColor}
            onChange={(e) => selectColor(e.target.value)}
            disabled={customization.atsMode}
            title="Color picker"
          />
          <input
            type="text"
            className="hex-input"
            value={customHex}
            onChange={(e) => setCustomHex(e.target.value)}
            onBlur={applyCustomHex}
            onKeyDown={(e) => e.key === 'Enter' && applyCustomHex()}
            placeholder="#2563eb"
            disabled={customization.atsMode}
            spellCheck={false}
          />
          <button type="button" className="btn btn-secondary btn-sm" onClick={applyCustomHex} disabled={customization.atsMode}>
            Apply
          </button>
        </div>
        <div className="color-preview-bar" style={{ background: customization.primaryColor }}>
          <span>Preview accent</span>
        </div>
      </section>

      <section className="custom-section">
        <h4 className="custom-section-title">Font family</h4>
        <div className="font-filters">
          <button
            type="button"
            className={`font-filter ${fontFilter === 'all' ? 'active' : ''}`}
            onClick={() => setFontFilter('all')}
          >
            All
          </button>
          {FONT_CATEGORIES.map((cat) => {
            const count = availableFonts.filter((f) => f.category === cat.id).length;
            if (count === 0) return null;
            return (
              <button
                key={cat.id}
                type="button"
                className={`font-filter ${fontFilter === cat.id ? 'active' : ''}`}
                onClick={() => setFontFilter(cat.id)}
              >
                {cat.label}
              </button>
            );
          })}
        </div>

        <div className="font-grid">
          {filteredFonts.map((font) => (
            <button
              key={font.id}
              type="button"
              className={`font-card ${customization.fontFamily === font.family ? 'active' : ''}`}
              onClick={() => onChange({ fontFamily: font.family })}
              disabled={customization.atsMode && !font.atsSafe}
            >
              <span className="font-preview-text" style={{ fontFamily: font.family }}>Aa Bb 123</span>
              <span className="font-card-label">{font.label}</span>
              {font.atsSafe && <span className="font-ats-badge">ATS</span>}
            </button>
          ))}
        </div>
        {activeFont && (
          <p className="panel-hint">Selected: <strong style={{ fontFamily: activeFont.family }}>{activeFont.label}</strong></p>
        )}
      </section>

      <section className="custom-section">
        <h4 className="custom-section-title">Font size</h4>
        <div className="size-control">
          <input
            type="range"
            min={9}
            max={14}
            step={1}
            value={customization.fontSize}
            onChange={(e) => onChange({ fontSize: Number(e.target.value) })}
          />
          <div className="size-labels">
            <span>9pt</span>
            <strong>{customization.fontSize}pt</strong>
            <span>14pt</span>
          </div>
        </div>
        <div
          className="size-preview"
          style={{ fontFamily: customization.fontFamily, fontSize: `${customization.fontSize}pt` }}
        >
          The quick brown fox jumps over the lazy dog.
        </div>
      </section>
    </div>
  );
}
