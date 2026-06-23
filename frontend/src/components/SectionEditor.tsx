import { useEffect, useState } from 'react';
import { v4 as uuid } from 'uuid';
import type { ResumeData, SectionType } from '../types/resume';
import { Checkbox } from './Checkbox';
import { DateField } from './DateField';
import { LocationPicker } from './LocationPicker';
import { IconPlus } from './Icons';
import { SortableEntryList } from './SortableEntryList';
import { UrlField } from './UrlField';
import { IconGitHub, IconLink, IconLinkedIn, IconMail, IconPhone } from './SocialIcons';

interface Props {
  data: ResumeData;
  activeSectionId: string | null;
  onChange: (updater: (prev: ResumeData) => ResumeData) => void;
}

function parseSkills(value: string): string[] {
  return value.split(',').map((s) => s.trim()).filter(Boolean);
}

function SkillsInput({
  skills,
  onChange,
}: {
  skills: string[];
  onChange: (skills: string[]) => void;
}) {
  const normalized = skills.join(', ');
  const [text, setText] = useState(normalized);

  useEffect(() => {
    setText((prev) => (parseSkills(prev).join(', ') === normalized ? prev : normalized));
  }, [normalized]);

  return (
    <input
      value={text}
      onChange={(e) => {
        const value = e.target.value;
        setText(value);
        onChange(parseSkills(value));
      }}
      onBlur={() => setText(normalized)}
      placeholder="e.g. Go, React, PostgreSQL, AWS"
    />
  );
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
            <Field label="Email" value={pi.email} onChange={(v) => updatePI({ email: v })} type="email" icon={<IconMail />} />
            <Field label="Phone" value={pi.phone} onChange={(v) => updatePI({ phone: v })} type="tel" icon={<IconPhone />} />
            <Field label="Website" value={pi.website} onChange={(v) => updatePI({ website: v })} icon={<IconLink />} placeholder="yoursite.com" />
            <div className="form-grid-span">
              <LocationPicker
                label="Location"
                value={pi.location}
                onChange={(v) => updatePI({ location: v })}
                fullWidth
                idSuffix="contact"
              />
            </div>
            <Field label="LinkedIn" value={pi.linkedIn} onChange={(v) => updatePI({ linkedIn: v })} icon={<IconLinkedIn size={15} />} placeholder="linkedin.com/in/username" />
            <Field label="GitHub" value={pi.github} onChange={(v) => updatePI({ github: v })} icon={<IconGitHub size={15} />} placeholder="github.com/username" />
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
              startDate: '', endDate: '', current: false,
              companyDescription: '', description: '',
            }],
          })))}
        >
          <SortableEntryList
            items={data.experience}
            labelPrefix="Position"
            emptyHint={<p className="empty-hint">No positions yet. Add your first role.</p>}
            onReorder={(experience) => onChange((prev) => ({ ...prev, experience }))}
            onRemove={(id) => onChange((prev) => ({
              ...prev,
              experience: prev.experience.filter((e) => e.id !== id),
            }))}
            renderFields={(exp) => (
              <>
                <Field label="Position" value={exp.position} onChange={(v) => updateList('experience', exp.id, { position: v }, onChange)} />
                <Field label="Company" value={exp.company} onChange={(v) => updateList('experience', exp.id, { company: v }, onChange)} />
                <LocationPicker label="Location" value={exp.location} onChange={(v) => updateList('experience', exp.id, { location: v }, onChange)} compact idSuffix={exp.id} allowRemote fullWidth />
                <div className="row">
                  <DateField label="Start" value={exp.startDate} onChange={(v) => updateList('experience', exp.id, { startDate: v }, onChange)} />
                  <DateField label="End" value={exp.endDate} onChange={(v) => updateList('experience', exp.id, { endDate: v }, onChange)} disabled={exp.current} />
                </div>
                <Checkbox
                  className="entry-checkbox"
                  label="Currently working here"
                  checked={exp.current}
                  onChange={(checked) => updateList('experience', exp.id, { current: checked, endDate: '' }, onChange)}
                />
                <label className="field-full">
                  Company description
                  <textarea
                    rows={2}
                    value={exp.companyDescription ?? ''}
                    onChange={(e) => updateList('experience', exp.id, { companyDescription: e.target.value }, onChange)}
                    placeholder="One line about the company — shown in small italics (supports *italic* and **bold**)"
                  />
                </label>
                <label className="field-full">
                  Description (one bullet per line)
                  <textarea
                    rows={4}
                    value={exp.description}
                    onChange={(e) => updateList('experience', exp.id, { description: e.target.value }, onChange)}
                    placeholder="Use *italic* and **bold** for emphasis"
                  />
                  <span className="field-hint">Wrap text in *asterisks* for italics, **double asterisks** for bold.</span>
                </label>
              </>
            )}
          />
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
              id: uuid(), institution: '', degree: '', field: '', location: '',
              startDate: '', endDate: '', gpa: '',
            }],
          })))}
        >
          <SortableEntryList
            items={data.education}
            labelPrefix="Entry"
            emptyHint={<p className="empty-hint">No education entries yet.</p>}
            onReorder={(education) => onChange((prev) => ({ ...prev, education }))}
            onRemove={(id) => onChange((prev) => ({
              ...prev,
              education: prev.education.filter((e) => e.id !== id),
            }))}
            renderFields={(edu) => (
              <>
                <Field label="Institution" value={edu.institution} onChange={(v) => updateList('education', edu.id, { institution: v }, onChange)} />
                <LocationPicker label="Location" value={edu.location ?? ''} onChange={(v) => updateList('education', edu.id, { location: v }, onChange)} compact idSuffix={edu.id} fullWidth />
                <div className="row">
                  <Field label="Degree" value={edu.degree} onChange={(v) => updateList('education', edu.id, { degree: v }, onChange)} />
                  <Field label="Field" value={edu.field} onChange={(v) => updateList('education', edu.id, { field: v }, onChange)} />
                </div>
                <div className="row row-3">
                  <DateField label="Start" value={edu.startDate} onChange={(v) => updateList('education', edu.id, { startDate: v }, onChange)} precision="year" />
                  <DateField label="End" value={edu.endDate} onChange={(v) => updateList('education', edu.id, { endDate: v }, onChange)} precision="year" />
                  <Field label="GPA" value={edu.gpa} onChange={(v) => updateList('education', edu.id, { gpa: v }, onChange)} />
                </div>
              </>
            )}
          />
        </EditorShell>
      );

    case 'skills':
      return (
        <EditorShell title="Skills" description={desc}>
          <label className="field-full">
            Skills (comma-separated)
            <SkillsInput
              skills={data.skills}
              onChange={(skills) => onChange((prev) => ({ ...prev, skills }))}
            />
          </label>
          {data.skills.length > 0 && (
            <div className="skills-editor-preview">
              <p className="skills-editor-label">Preview — how skills appear on your resume</p>
              <div className="skill-chips skill-chips-highlight">
                {data.skills.map((s) => <span key={s} className="skill-chip">{s}</span>)}
              </div>
            </div>
          )}
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
          <SortableEntryList
            items={data.projects}
            labelPrefix="Project"
            emptyHint={<p className="empty-hint">No projects yet.</p>}
            onReorder={(projects) => onChange((prev) => ({ ...prev, projects }))}
            onRemove={(id) => onChange((prev) => ({
              ...prev,
              projects: prev.projects.filter((p) => p.id !== id),
            }))}
            renderFields={(proj) => (
              <>
                <Field label="Name" value={proj.name} onChange={(v) => updateList('projects', proj.id, { name: v }, onChange)} />
                <UrlField label="URL" value={proj.url} onChange={(v) => updateList('projects', proj.id, { url: v }, onChange)} placeholder="github.com/username/project" />
                <Field label="Technologies" value={proj.technologies} onChange={(v) => updateList('projects', proj.id, { technologies: v }, onChange)} />
                <label className="field-full">Description<textarea rows={3} value={proj.description} onChange={(e) => updateList('projects', proj.id, { description: e.target.value }, onChange)} /></label>
              </>
            )}
          />
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
          <SortableEntryList
            items={data.certifications}
            labelPrefix="Certification"
            emptyHint={<p className="empty-hint">No certifications yet.</p>}
            onReorder={(certifications) => onChange((prev) => ({ ...prev, certifications }))}
            onRemove={(id) => onChange((prev) => ({
              ...prev,
              certifications: prev.certifications.filter((c) => c.id !== id),
            }))}
            renderFields={(cert) => (
              <>
                <Field label="Name" value={cert.name} onChange={(v) => updateList('certifications', cert.id, { name: v }, onChange)} />
                <Field label="Issuer" value={cert.issuer} onChange={(v) => updateList('certifications', cert.id, { issuer: v }, onChange)} />
                <DateField label="Date" value={cert.date} onChange={(v) => updateList('certifications', cert.id, { date: v }, onChange)} />
                <UrlField label="Certificate URL" value={cert.url} onChange={(v) => updateList('certifications', cert.id, { url: v }, onChange)} placeholder="credly.com/badges/…" />
              </>
            )}
          />
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
          <SortableEntryList
            items={data.languages}
            labelPrefix="Language"
            emptyHint={<p className="empty-hint">No languages yet.</p>}
            onReorder={(languages) => onChange((prev) => ({ ...prev, languages }))}
            onRemove={(id) => onChange((prev) => ({
              ...prev,
              languages: prev.languages.filter((l) => l.id !== id),
            }))}
            renderFields={(lang) => (
              <>
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
              </>
            )}
          />
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
  label, value, onChange, placeholder, disabled, type = 'text', icon,
}: {
  label: string; value: string; onChange: (v: string) => void;
  placeholder?: string; disabled?: boolean; type?: string;
  icon?: React.ReactNode;
}) {
  return (
    <label className={icon ? 'field-with-icon' : undefined}>
      <span className="field-label-row">
        {icon && <span className="field-icon">{icon}</span>}
        {label}
      </span>
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
