import type { Experience } from '../types/resume';
import { formatDateRange } from '../utils/dateFormat';
import { RichText } from './RichText';

function bullets(text: string): string[] {
  return text.split('\n').map((l) => l.trim()).filter(Boolean);
}

interface Props {
  exp: Experience;
}

export function ExperienceEntryPreview({ exp }: Props) {
  const meta = [formatDateRange(exp.startDate, exp.endDate, exp.current), exp.location]
    .filter(Boolean)
    .join(' · ');

  return (
    <div className="entry">
      <div className="entry-role-line">
        {exp.position && <span className="entry-position">{exp.position}</span>}
        {exp.position && exp.company && <span className="entry-dot"> · </span>}
        {exp.company && <span className="entry-company">{exp.company}</span>}
      </div>
      {meta && <div className="entry-meta">{meta}</div>}
      {exp.companyDescription?.trim() && (
        <p className="entry-company-desc">
          <RichText text={exp.companyDescription} />
        </p>
      )}
      {exp.description.trim() && (
        <ul className="entry-bullets">
          {bullets(exp.description).map((b, i) => (
            <li key={i}><RichText text={b} /></li>
          ))}
        </ul>
      )}
    </div>
  );
}
