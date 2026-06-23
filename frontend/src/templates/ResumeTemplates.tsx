import type { ResumeData } from '../types/resume';
import { ContactLine } from '../components/ContactLine';
import { ExperienceEntryPreview } from '../components/ExperienceEntryPreview';
import { ExternalLink } from '../components/ExternalLink';
import { SkillsDisplay, TechTags } from '../components/SkillsDisplay';
import { enabledSections } from '../utils/defaults';
import { formatDateRange } from '../utils/dateFormat';

interface TemplateProps {
  data: ResumeData;
}

export function ATSTemplate({ data }: TemplateProps) {
  const pi = data.personalInfo;
  const sections = enabledSections(data);
  const { fontFamily, fontSize, primaryColor } = data.customization;

  return (
    <div
      className="resume-page resume-ats"
      style={{ fontFamily, fontSize: `${fontSize}pt`, color: '#000' }}
    >
      <h1 style={{ color: primaryColor }}>{pi.fullName}</h1>
      <ContactLine info={pi} />

      {sections.map((section) => {
        switch (section.type) {
          case 'summary':
            if (!pi.summary) return null;
            return (
              <section key={section.id}>
                <h2 style={{ borderColor: primaryColor, color: primaryColor }}>{section.title}</h2>
                <p>{pi.summary}</p>
              </section>
            );
          case 'experience':
            if (!data.experience.length) return null;
            return (
              <section key={section.id}>
                <h2 style={{ borderColor: primaryColor, color: primaryColor }}>{section.title}</h2>
                {data.experience.map((exp) => (
                  <ExperienceEntryPreview key={exp.id} exp={exp} />
                ))}
              </section>
            );
          case 'education':
            if (!data.education.length) return null;
            return (
              <section key={section.id}>
                <h2 style={{ borderColor: primaryColor, color: primaryColor }}>{section.title}</h2>
                {data.education.map((edu) => (
                  <div key={edu.id} className="entry">
                    <div className="entry-title">
                      {edu.degree} {edu.field} | {edu.institution}
                    </div>
                    <div className="entry-meta">
                      {[formatDateRange(edu.startDate, edu.endDate, false), edu.location, edu.gpa]
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
              <section key={section.id} className="resume-section-skills">
                <h2 style={{ borderColor: primaryColor, color: primaryColor }}>{section.title}</h2>
                <SkillsDisplay skills={data.skills} primaryColor={primaryColor} />
              </section>
            );
          case 'projects':
            if (!data.projects.length) return null;
            return (
              <section key={section.id}>
                <h2 style={{ borderColor: primaryColor, color: primaryColor }}>{section.title}</h2>
                {data.projects.map((proj) => (
                  <div key={proj.id} className="entry">
                    <div className="entry-title-row">
                      <span className="entry-title">{proj.name}</span>
                      {proj.url && <ExternalLink href={proj.url} />}
                    </div>
                    {proj.technologies && <TechTags value={proj.technologies} primaryColor={primaryColor} />}
                    <p>{proj.description}</p>
                  </div>
                ))}
              </section>
            );
          case 'certifications':
            if (!data.certifications.length) return null;
            return (
              <section key={section.id}>
                <h2 style={{ borderColor: primaryColor, color: primaryColor }}>{section.title}</h2>
                {data.certifications.map((cert) => (
                  <div key={cert.id} className="entry">
                    <div className="entry-title-row">
                      <span className="entry-title">{cert.name}</span>
                      {cert.url && <ExternalLink href={cert.url} />}
                    </div>
                    <div className="entry-meta">
                      {[cert.issuer, cert.date].filter(Boolean).join(' · ')}
                    </div>
                  </div>
                ))}
              </section>
            );
          case 'languages':
            if (!data.languages.length) return null;
            return (
              <section key={section.id}>
                <h2 style={{ borderColor: primaryColor, color: primaryColor }}>{section.title}</h2>
                <p>{data.languages.map((l) => `${l.name} (${l.proficiency})`).join(', ')}</p>
              </section>
            );
          case 'custom': {
            const block = data.customSections.find((c) => c.sectionId === section.id);
            if (!block?.content) return null;
            return (
              <section key={section.id}>
                <h2 style={{ borderColor: primaryColor, color: primaryColor }}>{section.title}</h2>
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
      <ContactLine info={pi} />
      {sections.map((section) => (
        <SectionBlock key={section.id} section={section} data={data} color={color} />
      ))}
    </div>
  );
}

export function ModernTemplate({ data }: TemplateProps) {
  const pi = data.personalInfo;
  const color = data.customization.primaryColor;
  const sections = enabledSections(data).filter((s) => s.type !== 'skills');

  return (
    <div className="resume-page resume-modern" style={{ fontSize: data.customization.fontSize }}>
      <aside className="sidebar" style={{ background: color }}>
        <h1>{pi.fullName}</h1>
        <ContactLine info={pi} vertical light compact />
        {data.skills.length > 0 && isEnabled(data, 'skills') && (
          <>
            <h3>Skills</h3>
            <SkillsDisplay skills={data.skills} variant="sidebar" />
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
      <ContactLine info={pi} centered />
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
            <ExperienceEntryPreview key={exp.id} exp={exp} />
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
              {(edu.location || edu.startDate) && (
                <div className="entry-meta">
                  {[formatDateRange(edu.startDate, edu.endDate, false), edu.location].filter(Boolean).join(' · ')}
                </div>
              )}
            </div>
          ))}
        </section>
      );
    case 'skills':
      if (hideSkills || !data.skills.length) return null;
      return (
        <section key={section.id} className="resume-section-skills">
          {h2}
          <SkillsDisplay skills={data.skills} primaryColor={color} />
        </section>
      );
    case 'projects':
      if (!data.projects.length) return null;
      return (
        <section key={section.id}>
          {h2}
          {data.projects.map((p) => (
            <div key={p.id} className="entry">
              <div className="entry-title-row">
                <span className="entry-title">{p.name}</span>
                {p.url && <ExternalLink href={p.url} />}
              </div>
              {p.technologies && <TechTags value={p.technologies} primaryColor={color} />}
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
              <div className="entry-title-row">
                <span className="entry-title">{c.name}</span>
                {c.url && <ExternalLink href={c.url} />}
              </div>
              <div className="entry-meta">{[c.issuer, c.date].filter(Boolean).join(' · ')}</div>
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
