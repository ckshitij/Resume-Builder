import type { Section, SectionType } from '../types/resume';
import { ATS_STANDARD_TITLES } from '../types/resume';

interface Props {
  sections: Section[];
  availableToAdd: SectionType[];
  onAdd: (type: SectionType) => void;
  onRemove: (id: string) => void;
  onReorder: (id: string, direction: 'up' | 'down') => void;
  onUpdate: (id: string, patch: Partial<Section>) => void;
  activeSectionId: string | null;
  onSelect: (id: string) => void;
}

const TYPE_LABELS: Record<SectionType, string> = {
  personal: 'Contact',
  summary: 'Summary',
  experience: 'Experience',
  education: 'Education',
  skills: 'Skills',
  projects: 'Projects',
  certifications: 'Certifications',
  languages: 'Languages',
  custom: 'Custom',
};

export function SectionManager({
  sections,
  availableToAdd,
  onAdd,
  onRemove,
  onReorder,
  onUpdate,
  activeSectionId,
  onSelect,
}: Props) {
  return (
    <div className="panel section-manager">
      <div className="panel-header">
        <h3>Sections</h3>
      </div>
      <ul className="section-list">
        {sections.map((section, idx) => (
          <li
            key={section.id}
            className={`section-item ${section.enabled ? '' : 'disabled'} ${activeSectionId === section.id ? 'active' : ''}`}
          >
            <button type="button" className="section-select" onClick={() => onSelect(section.id)}>
              {TYPE_LABELS[section.type]}
              {!section.enabled && ' (hidden)'}
            </button>
            <div className="section-actions">
              {section.type !== 'personal' && (
                <>
                  <button type="button" title="Move up" disabled={idx === 0} onClick={() => onReorder(section.id, 'up')}>↑</button>
                  <button type="button" title="Move down" disabled={idx === sections.length - 1} onClick={() => onReorder(section.id, 'down')}>↓</button>
                  {section.enabled ? (
                    <button type="button" title="Remove section" onClick={() => onRemove(section.id)}>−</button>
                  ) : (
                    <button type="button" title="Restore section" onClick={() => onUpdate(section.id, { enabled: true })}>+</button>
                  )}
                </>
              )}
            </div>
          </li>
        ))}
      </ul>
      {availableToAdd.length > 0 && (
        <div className="add-section">
          <select
            id="add-section-select"
            defaultValue=""
            onChange={(e) => {
              const type = e.target.value as SectionType;
              if (type) {
                onAdd(type);
                e.target.value = '';
              }
            }}
          >
            <option value="" disabled>Add section…</option>
            {availableToAdd.map((type) => (
              <option key={type} value={type}>{TYPE_LABELS[type]}</option>
            ))}
          </select>
        </div>
      )}
      {sections.filter((s) => s.enabled && s.type !== 'personal').map((section) => (
        <div key={`title-${section.id}`} className="section-title-edit">
          <label htmlFor={`title-${section.id}`}>{TYPE_LABELS[section.type]} heading</label>
          <input
            id={`title-${section.id}`}
            value={section.title}
            onChange={(e) => onUpdate(section.id, { title: e.target.value })}
            placeholder={ATS_STANDARD_TITLES[section.type]}
          />
          {section.title !== ATS_STANDARD_TITLES[section.type] && section.type !== 'custom' && (
            <small className="ats-hint">Non-standard heading may reduce ATS score</small>
          )}
        </div>
      ))}
    </div>
  );
}
