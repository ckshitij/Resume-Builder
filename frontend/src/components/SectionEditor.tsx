import { v4 as uuid } from 'uuid';
import type { ResumeData } from '../types/resume';

interface Props {
  data: ResumeData;
  activeSectionId: string | null;
  onChange: (updater: (prev: ResumeData) => ResumeData) => void;
}

export function SectionEditor({ data, activeSectionId, onChange }: Props) {
  const section = data.sections.find((s) => s.id === activeSectionId);
  if (!section) {
    return (
      <div className="panel editor-panel">
        <p className="placeholder">Select a section to edit its content.</p>
      </div>
    );
  }

  const pi = data.personalInfo;

  const updatePI = (patch: Partial<typeof pi>) =>
    onChange((prev) => ({ ...prev, personalInfo: { ...prev.personalInfo, ...patch } }));

  switch (section.type) {
    case 'personal':
      return (
        <div className="panel editor-panel">
          <h3>Contact Information</h3>
          <Field label="Full name" value={pi.fullName} onChange={(v) => updatePI({ fullName: v })} />
          <Field label="Email" value={pi.email} onChange={(v) => updatePI({ email: v })} />
          <Field label="Phone" value={pi.phone} onChange={(v) => updatePI({ phone: v })} />
          <Field label="Location" value={pi.location} onChange={(v) => updatePI({ location: v })} />
          <Field label="Website" value={pi.website} onChange={(v) => updatePI({ website: v })} />
          <Field label="LinkedIn" value={pi.linkedIn} onChange={(v) => updatePI({ linkedIn: v })} />
          <Field label="GitHub" value={pi.github} onChange={(v) => updatePI({ github: v })} />
        </div>
      );

    case 'summary':
      return (
        <div className="panel editor-panel">
          <h3>Professional Summary</h3>
          <label>
            Summary
            <textarea
              rows={6}
              value={pi.summary}
              onChange={(e) => updatePI({ summary: e.target.value })}
              placeholder="2-4 sentences about your experience and goals"
            />
          </label>
        </div>
      );

    case 'experience':
      return (
        <div className="panel editor-panel">
          <div className="editor-header">
            <h3>Work Experience</h3>
            <button type="button" onClick={() => onChange((prev) => ({
              ...prev,
              experience: [...prev.experience, {
                id: uuid(), company: '', position: '', location: '',
                startDate: '', endDate: '', current: false, description: '',
              }],
            }))}>+ Add job</button>
          </div>
          {data.experience.map((exp, idx) => (
            <div key={exp.id} className="entry-card">
              <div className="entry-card-header">
                <strong>Position {idx + 1}</strong>
                <button type="button" onClick={() => onChange((prev) => ({
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
        </div>
      );

    case 'education':
      return (
        <div className="panel editor-panel">
          <div className="editor-header">
            <h3>Education</h3>
            <button type="button" onClick={() => onChange((prev) => ({
              ...prev,
              education: [...prev.education, {
                id: uuid(), institution: '', degree: '', field: '',
                startDate: '', endDate: '', gpa: '',
              }],
            }))}>+ Add education</button>
          </div>
          {data.education.map((edu, idx) => (
            <div key={edu.id} className="entry-card">
              <div className="entry-card-header">
                <strong>Entry {idx + 1}</strong>
                <button type="button" onClick={() => onChange((prev) => ({
                  ...prev,
                  education: prev.education.filter((e) => e.id !== edu.id),
                }))}>Remove</button>
              </div>
              <Field label="Institution" value={edu.institution} onChange={(v) => updateList('education', edu.id, { institution: v }, onChange)} />
              <div className="row">
                <Field label="Degree" value={edu.degree} onChange={(v) => updateList('education', edu.id, { degree: v }, onChange)} />
                <Field label="Field" value={edu.field} onChange={(v) => updateList('education', edu.id, { field: v }, onChange)} />
              </div>
              <div className="row">
                <Field label="Start" value={edu.startDate} onChange={(v) => updateList('education', edu.id, { startDate: v }, onChange)} />
                <Field label="End" value={edu.endDate} onChange={(v) => updateList('education', edu.id, { endDate: v }, onChange)} />
                <Field label="GPA" value={edu.gpa} onChange={(v) => updateList('education', edu.id, { gpa: v }, onChange)} />
              </div>
            </div>
          ))}
        </div>
      );

    case 'skills':
      return (
        <div className="panel editor-panel">
          <h3>Skills</h3>
          <label>
            Skills (comma-separated)
            <input
              value={data.skills.join(', ')}
              onChange={(e) => onChange((prev) => ({
                ...prev,
                skills: e.target.value.split(',').map((s) => s.trim()).filter(Boolean),
              }))}
            />
          </label>
        </div>
      );

    case 'projects':
      return (
        <div className="panel editor-panel">
          <div className="editor-header">
            <h3>Projects</h3>
            <button type="button" onClick={() => onChange((prev) => ({
              ...prev,
              projects: [...prev.projects, { id: uuid(), name: '', url: '', description: '', technologies: '' }],
            }))}>+ Add project</button>
          </div>
          {data.projects.map((proj, idx) => (
            <div key={proj.id} className="entry-card">
              <div className="entry-card-header">
                <strong>Project {idx + 1}</strong>
                <button type="button" onClick={() => onChange((prev) => ({
                  ...prev,
                  projects: prev.projects.filter((p) => p.id !== proj.id),
                }))}>Remove</button>
              </div>
              <Field label="Name" value={proj.name} onChange={(v) => updateList('projects', proj.id, { name: v }, onChange)} />
              <Field label="URL" value={proj.url} onChange={(v) => updateList('projects', proj.id, { url: v }, onChange)} />
              <Field label="Technologies" value={proj.technologies} onChange={(v) => updateList('projects', proj.id, { technologies: v }, onChange)} />
              <label>Description<textarea rows={3} value={proj.description} onChange={(e) => updateList('projects', proj.id, { description: e.target.value }, onChange)} /></label>
            </div>
          ))}
        </div>
      );

    case 'certifications':
      return (
        <div className="panel editor-panel">
          <div className="editor-header">
            <h3>Certifications</h3>
            <button type="button" onClick={() => onChange((prev) => ({
              ...prev,
              certifications: [...prev.certifications, { id: uuid(), name: '', issuer: '', date: '', url: '' }],
            }))}>+ Add certification</button>
          </div>
          {data.certifications.map((cert, idx) => (
            <div key={cert.id} className="entry-card">
              <div className="entry-card-header">
                <strong>Certification {idx + 1}</strong>
                <button type="button" onClick={() => onChange((prev) => ({
                  ...prev,
                  certifications: prev.certifications.filter((c) => c.id !== cert.id),
                }))}>Remove</button>
              </div>
              <Field label="Name" value={cert.name} onChange={(v) => updateList('certifications', cert.id, { name: v }, onChange)} />
              <Field label="Issuer" value={cert.issuer} onChange={(v) => updateList('certifications', cert.id, { issuer: v }, onChange)} />
              <Field label="Date" value={cert.date} onChange={(v) => updateList('certifications', cert.id, { date: v }, onChange)} />
            </div>
          ))}
        </div>
      );

    case 'languages':
      return (
        <div className="panel editor-panel">
          <div className="editor-header">
            <h3>Languages</h3>
            <button type="button" onClick={() => onChange((prev) => ({
              ...prev,
              languages: [...prev.languages, { id: uuid(), name: '', proficiency: 'Professional' }],
            }))}>+ Add language</button>
          </div>
          {data.languages.map((lang, idx) => (
            <div key={lang.id} className="entry-card">
              <div className="entry-card-header">
                <strong>Language {idx + 1}</strong>
                <button type="button" onClick={() => onChange((prev) => ({
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
        </div>
      );

    case 'custom': {
      const block = data.customSections.find((c) => c.sectionId === section.id);
      return (
        <div className="panel editor-panel">
          <h3>Custom Section</h3>
          <label>
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
            />
          </label>
        </div>
      );
    }

    default:
      return null;
  }
}

function Field({
  label, value, onChange, placeholder, disabled,
}: {
  label: string; value: string; onChange: (v: string) => void;
  placeholder?: string; disabled?: boolean;
}) {
  return (
    <label>
      {label}
      <input value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} disabled={disabled} />
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
