import { v4 as uuid } from 'uuid';
import type { ResumeData, SectionType } from '../types/resume';
import { IconPlus } from './Icons';

interface Props {
  data: ResumeData;
  activeSectionId: string | null;
  onChange: (updater: (prev: ResumeData) => ResumeData) => void;
}

const SECTION_DESCRIPTIONS: Record<SectionType, string> = {
  personal: 'Name, email, phone, and links recruiters need to reach you.',
  summary: 'A brief overview of your experience and career goals.',
  experience: 'Roles, companies, dates, and achievements.',
  education: 'Degrees, schools, and graduation dates.',
  skills: 'Technical and soft skills, comma-separated.',
  projects: 'Personal or professional projects worth highlighting.',
  certifications: 'Licenses, certificates, and credentials.',
  languages: 'Languages and proficiency levels.',
  custom: 'Any additional section you want on your resume.',
};

function EditorShell({
  title,
  description,
  action,
  children,
}: {
  title: string;
  description: string;
  action?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <div className="editor-shell">
      <div className="editor-shell-header">
        <div>
          <h2>{title}</h2>
          <p>{description}</p>
        </div>
        {action}
      </div>
      <div className="editor-shell-body">{children}</div>
    </div>
  );
}

export function SectionEditor({ data, activeSectionId, onChange }: Props) {
  const section = data.sections.find((s) => s.id === activeSectionId);
  if (!section) {
    return (
      <div className="editor-empty">
        <div className="editor-empty-icon">✎</div>
        <h2>Select a section</h2>
        <p>Choose a section from the sidebar to start editing your resume content.</p>
      </div>
    );
  }

  const pi = data.personalInfo;
  const desc = SECTION_DESCRIPTIONS[section.type];

  const updatePI = (patch: Partial<typeof pi>) =>
    onChange((prev) => ({ ...prev, personalInfo: { ...prev.personalInfo, ...patch } }));

  const addBtn = (label: string, onClick: () => void) => (
    <button type="button" className="btn btn-secondary btn-sm" onClick={onClick}>
      <IconPlus /> {label}
    </button>
  );

  switch (section.type) {
    case 'personal':
      return (
        <EditorShell title="Contact Information" description={desc}>
          <div className="form-grid">
            <Field label="Full name" value={pi.fullName} onChange={(v) => updatePI({ fullName: v })} />
            <Field label="Email" value={pi.email} onChange={(v) => updatePI({ email: v })} type="email" />
            <Field label="Phone" value={pi.phone} onChange={(v) => updatePI({ phone: v })} type="tel" />
            <Field label="Location" value={pi.location} onChange={(v) => updatePI({ location: v })} />
            <Field label="Website" value={pi.website} onChange={(v) => updatePI({ website: v })} />
            <Field label="LinkedIn" value={pi.linkedIn} onChange={(v) => updatePI({ linkedIn: v })} />
            <Field label="GitHub" value={pi.github} onChange={(v) => updatePI({ github: v })} />
          </div>
        </EditorShell>
      );

    case 'summary':
      return (
        <EditorShell title="Professional Summary" description={desc}>
          <label className="field-full">
            Summary
            <textarea
              rows={6}
              value={pi.summary}
              onChange={(e) => updatePI({ summary: e.target.value })}
              placeholder="2-4 sentences about your experience and goals"
            />
            <span className="char-count">{pi.summary.length} characters</span>
          </label>
        </EditorShell>
      );

    case 'experience':
      return (
        <EditorShell
          title="Work Experience"
          description={desc}
          action={addBtn('Add position', () => onChange((prev) => ({
            ...prev,
            experience: [...prev.experience, {
              id: uuid(), company: '', position: '', location: '',
              startDate: '', endDate: '', current: false, description: '',
            }],
          })))}
        >
          {data.experience.length === 0 && <p className="empty-hint">No positions yet. Add your first role.</p>}
          {data.experience.map((exp, idx) => (
            <div key={exp.id} className="entry-card">
              <div className="entry-card-header">
                <strong>Position {idx + 1}</strong>
                <button type="button" className="btn-text danger" onClick={() => onChange((prev) => ({
                  ...prev,
                  experience: prev.experience.filter((e) => e.id !== exp.id),
                }))}>Remove</button>
              </div>
              <Field label="Position" value={exp.position} onChange={(v) => updateList('experience', exp.id, { position: v }, onChange)} />
              <Field label="Company" value={exp.company} onChange={(v) => updateList('experience', exp.id, { company: v }, onChange)} />
              <Field label="Location" value={exp.location} onChange={(v) => updateList('experience', exp.id, { location: v }, onChange)} />
              <div className="row">
                <Field label="Start" value={exp.startDate} onChange={(v) => updateList('experience', exp.id, { startDate: v }, onChange)} placeholder="YYYY-MM" />
                <Field label="End" value={exp.endDate} onChange={(v) => updateList('experience', exp.id, { endDate: v }, onChange)} placeholder="YYYY-MM" disabled={exp.current} />
              </div>
              <label className="checkbox">
                <input type="checkbox" checked={exp.current} onChange={(e) => updateList('experience', exp.id, { current: e.target.checked, endDate: '' }, onChange)} />
                Currently working here
              </label>
              <label>
                Description (one bullet per line)
                <textarea rows={4} value={exp.description} onChange={(e) => updateList('experience', exp.id, { description: e.target.value }, onChange)} />
              </label>
            </div>
          ))}
        </EditorShell>
      );

    case 'education':
      return (
        <EditorShell
          title="Education"
          description={desc}
          action={addBtn('Add education', () => onChange((prev) => ({
            ...prev,
            education: [...prev.education, {
              id: uuid(), institution: '', degree: '', field: '',
              startDate: '', endDate: '', gpa: '',
            }],
          })))}
        >
          {data.education.length === 0 && <p className="empty-hint">No education entries yet.</p>}
          {data.education.map((edu, idx) => (
            <div key={edu.id} className="entry-card">
              <div className="entry-card-header">
                <strong>Entry {idx + 1}</strong>
                <button type="button" className="btn-text danger" onClick={() => onChange((prev) => ({
                  ...prev,
                  education: prev.education.filter((e) => e.id !== edu.id),
                }))}>Remove</button>
              </div>
              <Field label="Institution" value={edu.institution} onChange={(v) => updateList('education', edu.id, { institution: v }, onChange)} />
              <div className="row">
                <Field label="Degree" value={edu.degree} onChange={(v) => updateList('education', edu.id, { degree: v }, onChange)} />
                <Field label="Field" value={edu.field} onChange={(v) => updateList('education', edu.id, { field: v }, onChange)} />
              </div>
              <div className="row row-3">
                <Field label="Start" value={edu.startDate} onChange={(v) => updateList('education', edu.id, { startDate: v }, onChange)} placeholder="YYYY-MM" />
                <Field label="End" value={edu.endDate} onChange={(v) => updateList('education', edu.id, { endDate: v }, onChange)} placeholder="YYYY-MM" />
                <Field label="GPA" value={edu.gpa} onChange={(v) => updateList('education', edu.id, { gpa: v }, onChange)} />
              </div>
            </div>
          ))}
        </EditorShell>
      );

    case 'skills':
      return (
        <EditorShell title="Skills" description={desc}>
          <label className="field-full">
            Skills (comma-separated)
            <input
              value={data.skills.join(', ')}
              onChange={(e) => onChange((prev) => ({
                ...prev,
                skills: e.target.value.split(',').map((s) => s.trim()).filter(Boolean),
              }))}
              placeholder="e.g. Go, React, PostgreSQL, AWS"
            />
            {data.skills.length > 0 && (
              <div className="skill-chips">
                {data.skills.map((s) => <span key={s} className="skill-chip">{s}</span>)}
              </div>
            )}
          </label>
        </EditorShell>
      );

    case 'projects':
      return (
        <EditorShell
          title="Projects"
          description={desc}
          action={addBtn('Add project', () => onChange((prev) => ({
            ...prev,
            projects: [...prev.projects, { id: uuid(), name: '', url: '', description: '', technologies: '' }],
          })))}
        >
          {data.projects.length === 0 && <p className="empty-hint">No projects yet.</p>}
          {data.projects.map((proj, idx) => (
            <div key={proj.id} className="entry-card">
              <div className="entry-card-header">
                <strong>Project {idx + 1}</strong>
                <button type="button" className="btn-text danger" onClick={() => onChange((prev) => ({
                  ...prev,
                  projects: prev.projects.filter((p) => p.id !== proj.id),
                }))}>Remove</button>
              </div>
              <Field label="Name" value={proj.name} onChange={(v) => updateList('projects', proj.id, { name: v }, onChange)} />
              <Field label="URL" value={proj.url} onChange={(v) => updateList('projects', proj.id, { url: v }, onChange)} />
              <Field label="Technologies" value={proj.technologies} onChange={(v) => updateList('projects', proj.id, { technologies: v }, onChange)} />
              <label className="field-full">Description<textarea rows={3} value={proj.description} onChange={(e) => updateList('projects', proj.id, { description: e.target.value }, onChange)} /></label>
            </div>
          ))}
        </EditorShell>
      );

    case 'certifications':
      return (
        <EditorShell
          title="Certifications"
          description={desc}
          action={addBtn('Add certification', () => onChange((prev) => ({
            ...prev,
            certifications: [...prev.certifications, { id: uuid(), name: '', issuer: '', date: '', url: '' }],
          })))}
        >
          {data.certifications.length === 0 && <p className="empty-hint">No certifications yet.</p>}
          {data.certifications.map((cert, idx) => (
            <div key={cert.id} className="entry-card">
              <div className="entry-card-header">
                <strong>Certification {idx + 1}</strong>
                <button type="button" className="btn-text danger" onClick={() => onChange((prev) => ({
                  ...prev,
                  certifications: prev.certifications.filter((c) => c.id !== cert.id),
                }))}>Remove</button>
              </div>
              <Field label="Name" value={cert.name} onChange={(v) => updateList('certifications', cert.id, { name: v }, onChange)} />
              <Field label="Issuer" value={cert.issuer} onChange={(v) => updateList('certifications', cert.id, { issuer: v }, onChange)} />
              <Field label="Date" value={cert.date} onChange={(v) => updateList('certifications', cert.id, { date: v }, onChange)} placeholder="YYYY-MM" />
            </div>
          ))}
        </EditorShell>
      );

    case 'languages':
      return (
        <EditorShell
          title="Languages"
          description={desc}
          action={addBtn('Add language', () => onChange((prev) => ({
            ...prev,
            languages: [...prev.languages, { id: uuid(), name: '', proficiency: 'Professional' }],
          })))}
        >
          {data.languages.length === 0 && <p className="empty-hint">No languages yet.</p>}
          {data.languages.map((lang, idx) => (
            <div key={lang.id} className="entry-card">
              <div className="entry-card-header">
                <strong>Language {idx + 1}</strong>
                <button type="button" className="btn-text danger" onClick={() => onChange((prev) => ({
                  ...prev,
                  languages: prev.languages.filter((l) => l.id !== lang.id),
                }))}>Remove</button>
              </div>
              <Field label="Language" value={lang.name} onChange={(v) => updateList('languages', lang.id, { name: v }, onChange)} />
              <label>Proficiency
                <select value={lang.proficiency} onChange={(e) => updateList('languages', lang.id, { proficiency: e.target.value }, onChange)}>
                  <option>Native</option>
                  <option>Fluent</option>
                  <option>Professional</option>
                  <option>Intermediate</option>
                  <option>Basic</option>
                </select>
              </label>
            </div>
          ))}
        </EditorShell>
      );

    case 'custom': {
      const block = data.customSections.find((c) => c.sectionId === section.id);
      return (
        <EditorShell title="Custom Section" description={desc}>
          <label className="field-full">
            Content
            <textarea
              rows={8}
              value={block?.content ?? ''}
              onChange={(e) => onChange((prev) => ({
                ...prev,
                customSections: prev.customSections.some((c) => c.sectionId === section.id)
                  ? prev.customSections.map((c) => c.sectionId === section.id ? { ...c, content: e.target.value } : c)
                  : [...prev.customSections, { id: uuid(), sectionId: section.id, content: e.target.value }],
              }))}
              placeholder="Write any additional information for this section…"
            />
          </label>
        </EditorShell>
      );
    }

    default:
      return null;
  }
}

function Field({
  label, value, onChange, placeholder, disabled, type = 'text',
}: {
  label: string; value: string; onChange: (v: string) => void;
  placeholder?: string; disabled?: boolean; type?: string;
}) {
  return (
    <label>
      {label}
      <input type={type} value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} disabled={disabled} />
    </label>
  );
}

function updateList<K extends 'experience' | 'education' | 'projects' | 'certifications' | 'languages'>(
  key: K,
  id: string,
  patch: Record<string, unknown>,
  onChange: (updater: (prev: ResumeData) => ResumeData) => void,
) {
  onChange((prev) => ({
    ...prev,
    [key]: (prev[key] as { id: string }[]).map((item) =>
      item.id === id ? { ...item, ...patch } : item
    ),
  }));
}
