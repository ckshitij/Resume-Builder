import type { ATSCheck, ResumeData, SectionType } from '../types/resume';
import { ATS_STANDARD_TITLES } from '../types/resume';
import { effectiveTemplate } from './defaults';

const ATS_FRIENDLY_TEMPLATES = new Set(['ats', 'classic']);

export function runATSChecks(data: ResumeData): ATSCheck[] {
  const template = effectiveTemplate(data);
  const pi = data.personalInfo;

  const checks: ATSCheck[] = [
    {
      id: 'template',
      label: 'ATS-friendly layout',
      passed: ATS_FRIENDLY_TEMPLATES.has(template),
      tip: 'Use the ATS Optimized or Classic template. Multi-column layouts are harder for parsers to read.',
    },
    {
      id: 'contact',
      label: 'Contact information',
      passed: !!(pi.fullName && pi.email && pi.phone),
      tip: 'Include your full name, email, and phone number in plain text.',
    },
    {
      id: 'standard-headings',
      label: 'Standard section headings',
      passed: data.sections
        .filter((s) => s.enabled && s.type !== 'personal' && s.type !== 'custom')
        .every((s) => {
          const standard = ATS_STANDARD_TITLES[s.type as SectionType];
          return !standard || s.title === standard;
        }),
      tip: 'Use standard headings like "Work Experience" and "Education" so ATS software can categorize content.',
    },
    {
      id: 'dates',
      label: 'Consistent date format',
      passed: data.experience.every((e) => !e.startDate || /^\d{4}(-\d{2})?$/.test(e.startDate)),
      tip: 'Use YYYY or YYYY-MM format for dates (e.g. 2021-01).',
    },
    {
      id: 'skills-format',
      label: 'Skills as plain text',
      passed: data.skills.length === 0 || data.skills.every((s) => s.trim().length > 0),
      tip: 'List skills as comma-separated plain text, not icons or graphics.',
    },
    {
      id: 'no-empty-sections',
      label: 'No empty enabled sections',
      passed: !hasEmptyEnabledSection(data),
      tip: 'Disable or fill sections that have no content.',
    },
    {
      id: 'summary-length',
      label: 'Concise summary',
      passed: !pi.summary || (pi.summary.length >= 50 && pi.summary.length <= 600),
      tip: 'Keep your professional summary between 50 and 600 characters.',
    },
    {
      id: 'bullet-points',
      label: 'Experience uses bullet points',
      passed:
        data.experience.length === 0 ||
        data.experience.every((e) => e.description.includes('\n') || e.description.length > 40),
      tip: 'Break experience into short bullet points, one achievement per line.',
    },
  ];

  return checks;
}

function hasEmptyEnabledSection(data: ResumeData): boolean {
  for (const section of data.sections) {
    if (!section.enabled || section.type === 'personal') continue;
    switch (section.type) {
      case 'summary':
        if (!data.personalInfo.summary.trim()) return true;
        break;
      case 'experience':
        if (data.experience.length === 0) return true;
        break;
      case 'education':
        if (data.education.length === 0) return true;
        break;
      case 'skills':
        if (data.skills.length === 0) return true;
        break;
      case 'projects':
        if (data.projects.length === 0) return true;
        break;
      case 'certifications':
        if (data.certifications.length === 0) return true;
        break;
      case 'languages':
        if (data.languages.length === 0) return true;
        break;
      case 'custom': {
        const block = data.customSections.find((c) => c.sectionId === section.id);
        if (!block?.content.trim()) return true;
        break;
      }
    }
  }
  return false;
}

export function atsScore(checks: ATSCheck[]): number {
  if (checks.length === 0) return 0;
  return Math.round((checks.filter((c) => c.passed).length / checks.length) * 100);
}
