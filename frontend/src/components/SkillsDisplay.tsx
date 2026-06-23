interface Props {
  skills: string[];
  primaryColor?: string;
  variant?: 'default' | 'sidebar';
}

export function SkillsDisplay({ skills, primaryColor = '#2563eb', variant = 'default' }: Props) {
  if (!skills.length) return null;
  const sidebar = variant === 'sidebar';

  return (
    <div className={`resume-skills ${sidebar ? 'resume-skills-sidebar' : ''}`}>
      {skills.map((skill) => (
        <span
          key={skill}
          className="resume-skill-pill"
          style={sidebar ? {
            borderColor: 'rgba(255,255,255,0.55)',
            color: '#fff',
            backgroundColor: 'rgba(255,255,255,0.18)',
          } : {
            borderColor: primaryColor,
            color: primaryColor,
            backgroundColor: `${primaryColor}14`,
          }}
        >
          {skill}
        </span>
      ))}
    </div>
  );
}

export function TechTags({ value, primaryColor = '#2563eb' }: { value: string; primaryColor?: string }) {
  const tags = value.split(',').map((t) => t.trim()).filter(Boolean);
  if (!tags.length) return null;

  return (
    <div className="resume-tech-tags">
      {tags.map((tag) => (
        <span
          key={tag}
          className="resume-tech-tag"
          style={{ backgroundColor: `${primaryColor}10`, color: primaryColor }}
        >
          {tag}
        </span>
      ))}
    </div>
  );
}
