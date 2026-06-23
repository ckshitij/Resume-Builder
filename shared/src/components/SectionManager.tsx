import type { Section, SectionType } from '../types/resume';
import { ATS_STANDARD_TITLES } from '../types/resume';
import { useListDragReorder } from '../hooks/useListDragReorder';
import {
  IconAward,
  IconBriefcase,
  IconChevronDown,
  IconChevronUp,
  IconEdit,
  IconFolder,
  IconGlobe,
  IconGraduation,
  IconGrip,
  IconLayers,
  IconPlus,
  IconStar,
  IconUser,
} from './Icons';

interface Props {
  sections: Section[];
  availableToAdd: SectionType[];
  onAdd: (type: SectionType) => void;
  onRemove: (id: string) => void;
  onReorder: (id: string, direction: 'up' | 'down') => void;
  onMoveSection: (fromIndex: number, toIndex: number) => void;
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

const SECTION_ICONS: Record<SectionType, React.ReactNode> = {
  personal: <IconUser />,
  summary: <IconEdit />,
  experience: <IconBriefcase />,
  education: <IconGraduation />,
  skills: <IconStar />,
  projects: <IconFolder />,
  certifications: <IconAward />,
  languages: <IconGlobe />,
  custom: <IconLayers />,
};

export function SectionManager({
  sections,
  availableToAdd,
  onAdd,
  onRemove,
  onReorder,
  onMoveSection,
  onUpdate,
  activeSectionId,
  onSelect,
}: Props) {
  const drag = useListDragReorder(onMoveSection);

  return (
    <div className="section-manager">
      <p className="panel-hint">Click a section to edit. Drag the handle to reorder.</p>
      <ul className="section-list">
        {sections.map((section, idx) => {
          const canDrag = section.type !== 'personal';
          return (
            <li
              key={section.id}
              className={drag.itemClassName(
                idx,
                `section-item ${section.enabled ? '' : 'disabled'} ${activeSectionId === section.id ? 'active' : ''}`,
              )}
              {...drag.getItemProps(idx)}
            >
              {canDrag ? (
                <button
                  type="button"
                  className="drag-handle"
                  aria-label={`Drag to reorder ${TYPE_LABELS[section.type]}`}
                  {...drag.getHandleProps(idx)}
                >
                  <IconGrip />
                </button>
              ) : (
                <span className="drag-handle drag-handle-spacer" aria-hidden="true" />
              )}
              <button type="button" className="section-select" onClick={() => onSelect(section.id)}>
                <span className="section-icon">{SECTION_ICONS[section.type]}</span>
                <span className="section-label">
                  {TYPE_LABELS[section.type]}
                  {!section.enabled && <span className="hidden-badge">Hidden</span>}
                </span>
              </button>
              {section.type !== 'personal' && (
                <div className="section-actions">
                  <button type="button" className="btn-icon-sm" title="Move up" disabled={idx === 0 || sections[idx - 1]?.type === 'personal'} onClick={() => onReorder(section.id, 'up')}>
                    <IconChevronUp />
                  </button>
                  <button type="button" className="btn-icon-sm" title="Move down" disabled={idx === sections.length - 1} onClick={() => onReorder(section.id, 'down')}>
                    <IconChevronDown />
                  </button>
                  {section.enabled ? (
                    <button type="button" className="btn-icon-sm danger" title="Hide section" onClick={() => onRemove(section.id)}>−</button>
                  ) : (
                    <button type="button" className="btn-icon-sm success" title="Show section" onClick={() => onUpdate(section.id, { enabled: true })}>
                      <IconPlus />
                    </button>
                  )}
                </div>
              )}
            </li>
          );
        })}
      </ul>

      {availableToAdd.length > 0 && (
        <div className="add-section-bar">
          {availableToAdd.map((type) => (
            <button key={type} type="button" className="add-section-chip" onClick={() => onAdd(type)}>
              <IconPlus />
              {TYPE_LABELS[type]}
            </button>
          ))}
        </div>
      )}

      <div className="section-headings">
        <h4 className="subsection-title">Section headings</h4>
        {sections.filter((s) => s.enabled && s.type !== 'personal').map((section) => (
          <div key={`title-${section.id}`} className="section-title-edit">
            <label htmlFor={`title-${section.id}`}>
              <span className="label-icon">{SECTION_ICONS[section.type]}</span>
              {TYPE_LABELS[section.type]}
            </label>
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
    </div>
  );
}
