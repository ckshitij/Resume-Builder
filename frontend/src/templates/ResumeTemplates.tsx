import type { ResumeData } from '../types/resume';
import { enabledSections } from '../utils/defaults';

function contactLine(data: ResumeData): string {
  const pi = data.personalInfo;
  return [pi.email, pi.phone, pi.location, pi.website, pi.linkedIn, pi.github]
    .filter(Boolean)
    .join(' | ');
}

function formatDateRange(start: string, end: string, current: boolean): string {
  const s = start?.slice(0, 7) ?? '';
  if (current) return s ? `${s} — Present` : 'Present';
  const e = end?.slice(0, 7) ?? '';
  if (s && e) return `${s} — ${e}`;
  return s || e;
}

function bullets(text: string): string[] {
  return text.split('\n').map((l) => l.trim()).filter(Boolean);
}

interface TemplateProps {
  data: ResumeData;
}

export function ATSTemplate({ data }: TemplateProps) {
  const pi = data.personalInfo;
  const sections = enabledSections(data);

  return (
    <div className="resume-page resume-ats">
      <h1>{pi.fullName}</h1>
      <div className="contact-line">{contactLine(data)}</div>

      {sections.map((section) => {
        switch (section.type) {
          case 'summary':
            if (!pi.summary) return null;
            return (
              <section key={section.id}>
                <h2>{section.title}</h2>
                <p>{pi.summary}</p>
              </section>
            );
          case 'experience':
            if (!data.experience.length) return null;
            return (
              <section key={section.id}>
                <h2>{section.title}</h2>
                {data.experience.map((exp) => (
                  <div key={exp.id} className="entry">
                    <div className="entry-title">
                      {exp.position} | {exp.company}
                    </div>
                    <div className="entry-meta">
                      {[formatDateRange(exp.startDate, exp.endDate, exp.current), exp.location]
                        .filter(Boolean)
                        .join(' | ')}
                    </div>
                    <ul>
                      {bullets(exp.description).map((b, i) => (
                        <li key={i}>{b}</li>
                      ))}
                    </ul>
                  </div>
                ))}
              </section>
            );
          case 'education':
            if (!data.education.length) return null;
            return (
              <section key={section.id}>
                <h2>{section.title}</h2>
                {data.education.map((edu) => (
                  <div key={edu.id} className="entry">
                    <div className="entry-title">
                      {edu.degree} {edu.field} | {edu.institution}
                    </div>
                    <div className="entry-meta">
                      {[formatDateRange(edu.startDate, edu.endDate, false), edu.gpa]
                        .filter(Boolean)
                        .join(' | ')}
                    </div>
                  </div>
                ))}
              </section>
            );
          case 'skills':
            if (!data.skills.length) return null;
            return (
              <section key={section.id}>
                <h2>{section.title}</h2>
                <p>{data.skills.join(', ')}</p>
              </section>
            );
          case 'projects':
            if (!data.projects.length) return null;
            return (
              <section key={section.id}>
                <h2>{section.title}</h2>
                {data.projects.map((proj) => (
                  <div key={proj.id} className="entry">
                    <div className="entry-title">
                      {proj.name}
                      {proj.url ? ` | ${proj.url}` : ''}
                    </div>
                    {proj.technologies && <div className="entry-meta">{proj.technologies}</div>}
                    <p>{proj.description}</p>
                  </div>
                ))}
              </section>
            );
          case 'certifications':
            if (!data.certifications.length) return null;
            return (
              <section key={section.id}>
                <h2>{section.title}</h2>
                {data.certifications.map((cert) => (
                  <div key={cert.id} className="entry">
                    <div className="entry-title">
                      {cert.name} | {cert.issuer}
                    </div>
                    {cert.date && <div className="entry-meta">{cert.date}</div>}
                  </div>
                ))}
              </section>
            );
          case 'languages':
            if (!data.languages.length) return null;
            return (
              <section key={section.id}>
                <h2>{section.title}</h2>
                <p>{data.languages.map((l) => `${l.name} (${l.proficiency})`).join(', ')}</p>
              </section>
            );
          case 'custom': {
            const block = data.customSections.find((c) => c.sectionId === section.id);
            if (!block?.content) return null;
            return (
              <section key={section.id}>
                <h2>{section.title}</h2>
                <p>{block.content}</p>
              </section>
            );
          }
          default:
            return null;
        }
      })}
    </div>
  );
}

export function ClassicTemplate({ data }: TemplateProps) {
  const pi = data.personalInfo;
  const color = data.customization.primaryColor;
  const sections = enabledSections(data);

  return (
    <div className="resume-page resume-classic" style={{ fontFamily: data.customization.fontFamily, fontSize: data.customization.fontSize }}>
      <h1 style={{ color }}>{pi.fullName}</h1>
      <div className="contact-line">{contactLine(data)}</div>
      {sections.map((section) => (
        <SectionBlock key={section.id} section={section} data={data} color={color} />
      ))}
    </div>
  );
}

export function ModernTemplate({ data }: TemplateProps) {
  const pi = data.personalInfo;
  const color = data.customization.primaryColor;
  const contactItems = [pi.email, pi.phone, pi.location, pi.website].filter(Boolean);
  const sections = enabledSections(data).filter((s) => s.type !== 'skills');

  return (
    <div className="resume-page resume-modern" style={{ fontSize: data.customization.fontSize }}>
      <aside className="sidebar" style={{ background: color }}>
        <h1>{pi.fullName}</h1>
        {contactItems.map((item) => (
          <div key={item} className="sidebar-item">{item}</div>
        ))}
        {data.skills.length > 0 && isEnabled(data, 'skills') && (
          <>
            <h3>Skills</h3>
            <ul>{data.skills.map((s) => <li key={s}>{s}</li>)}</ul>
          </>
        )}
      </aside>
      <main>
        {isEnabled(data, 'summary') && pi.summary && (
          <section>
            <h2 style={{ color }}>{sectionTitle(data, 'summary')}</h2>
            <p>{pi.summary}</p>
          </section>
        )}
        {sections.map((section) => (
          <SectionBlock key={section.id} section={section} data={data} color={color} hideSkills />
        ))}
      </main>
    </div>
  );
}

export function MinimalTemplate({ data }: TemplateProps) {
  const pi = data.personalInfo;
  const sections = enabledSections(data);

  return (
    <div className="resume-page resume-minimal" style={{ fontFamily: data.customization.fontFamily, fontSize: data.customization.fontSize }}>
      <h1>{pi.fullName}</h1>
      <div className="contact-line centered">{contactLine(data)}</div>
      <hr />
      {isEnabled(data, 'summary') && pi.summary && <p className="centered">{pi.summary}</p>}
      {sections.filter((s) => s.type !== 'summary').map((section) => (
        <div key={section.id} className="minimal-section">
          <div className="minimal-label">{section.title.toUpperCase()}</div>
          <SectionBlock section={section} data={data} minimal />
        </div>
      ))}
    </div>
  );
}

function isEnabled(data: ResumeData, type: string) {
  return data.sections.some((s) => s.type === type && s.enabled);
}

function sectionTitle(data: ResumeData, type: string) {
  return data.sections.find((s) => s.type === type)?.title ?? type;
}

function SectionBlock({
  section,
  data,
  color,
  hideSkills,
  minimal,
}: {
  section: { id: string; type: string; title: string };
  data: ResumeData;
  color?: string;
  hideSkills?: boolean;
  minimal?: boolean;
}) {
  const pi = data.personalInfo;
  const h2 = minimal ? null : <h2 style={color ? { color, borderColor: color } : undefined}>{section.title}</h2>;

  switch (section.type) {
    case 'summary':
      if (!pi.summary) return null;
      return <section key={section.id}>{h2}<p>{pi.summary}</p></section>;
    case 'experience':
      if (!data.experience.length) return null;
      return (
        <section key={section.id}>
          {h2}
          {data.experience.map((exp) => (
            <div key={exp.id} className="entry">
              <div className="entry-title">{exp.position} — {exp.company}</div>
              <div className="entry-meta">{formatDateRange(exp.startDate, exp.endDate, exp.current)}</div>
              <p className="pre-line">{exp.description}</p>
            </div>
          ))}
        </section>
      );
    case 'education':
      if (!data.education.length) return null;
      return (
        <section key={section.id}>
          {h2}
          {data.education.map((edu) => (
            <div key={edu.id} className="entry">
              <div className="entry-title">{edu.degree} {edu.field} — {edu.institution}</div>
            </div>
          ))}
        </section>
      );
    case 'skills':
      if (hideSkills || !data.skills.length) return null;
      return <section key={section.id}>{h2}<p>{data.skills.join(', ')}</p></section>;
    case 'projects':
      if (!data.projects.length) return null;
      return (
        <section key={section.id}>
          {h2}
          {data.projects.map((p) => (
            <div key={p.id} className="entry">
              <div className="entry-title">{p.name}</div>
              <p>{p.description}</p>
            </div>
          ))}
        </section>
      );
    case 'certifications':
      if (!data.certifications.length) return null;
      return (
        <section key={section.id}>
          {h2}
          {data.certifications.map((c) => (
            <div key={c.id} className="entry">
              <div className="entry-title">{c.name} — {c.issuer}</div>
            </div>
          ))}
        </section>
      );
    case 'languages':
      if (!data.languages.length) return null;
      return (
        <section key={section.id}>
          {h2}
          <p>{data.languages.map((l) => `${l.name} (${l.proficiency})`).join(', ')}</p>
        </section>
      );
    case 'custom': {
      const block = data.customSections.find((c) => c.sectionId === section.id);
      if (!block?.content) return null;
      return <section key={section.id}>{h2}<p>{block.content}</p></section>;
    }
    default:
      return null;
  }
}
