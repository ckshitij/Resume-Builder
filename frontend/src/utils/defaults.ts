import { v4 as uuid } from 'uuid';
import type { ResumeData, Section, SectionType } from '../types/resume';
import { ATS_STANDARD_TITLES } from '../types/resume';

export function defaultSections(): Section[] {
  return [
    { id: 'sec-personal', type: 'personal', title: 'Contact', enabled: true },
    { id: 'sec-summary', type: 'summary', title: ATS_STANDARD_TITLES.summary, enabled: true },
    { id: 'sec-experience', type: 'experience', title: ATS_STANDARD_TITLES.experience, enabled: true },
    { id: 'sec-education', type: 'education', title: ATS_STANDARD_TITLES.education, enabled: true },
    { id: 'sec-skills', type: 'skills', title: ATS_STANDARD_TITLES.skills, enabled: true },
    { id: 'sec-projects', type: 'projects', title: ATS_STANDARD_TITLES.projects, enabled: true },
    { id: 'sec-certifications', type: 'certifications', title: ATS_STANDARD_TITLES.certifications, enabled: false },
    { id: 'sec-languages', type: 'languages', title: ATS_STANDARD_TITLES.languages, enabled: false },
  ];
}

export function defaultResumeData(): ResumeData {
  return {
    personalInfo: {
      fullName: 'Jane Doe',
      email: 'jane.doe@email.com',
      phone: '+1 (555) 123-4567',
      location: 'San Francisco, CA',
      website: '',
      linkedIn: '',
      github: '',
      summary:
        'Experienced software engineer with a passion for building elegant, user-focused applications.',
    },
    sections: defaultSections(),
    experience: [
      {
        id: uuid(),
        company: 'Tech Corp',
        position: 'Senior Software Engineer',
        location: 'San Francisco, CA',
        startDate: '2021-01',
        endDate: '',
        current: true,
        description:
          'Led development of microservices architecture serving 1M+ users.\nImproved system performance by 40% through optimization.',
      },
    ],
    education: [
      {
        id: uuid(),
        institution: 'University of California',
        degree: 'B.S.',
        field: 'Computer Science',
        startDate: '2015-09',
        endDate: '2019-05',
        gpa: '3.8',
      },
    ],
    skills: ['Go', 'TypeScript', 'React', 'PostgreSQL', 'Docker', 'AWS'],
    projects: [
      {
        id: uuid(),
        name: 'Resume Builder',
        url: 'https://github.com/example/resume-builder',
        description: 'Full-stack resume builder with PDF and DOCX export.',
        technologies: 'React, Go, PostgreSQL',
      },
    ],
    certifications: [],
    languages: [],
    customSections: [],
    customization: {
      templateId: 'ats',
      primaryColor: '#1a1a1a',
      fontFamily: 'Arial, Helvetica, sans-serif',
      fontSize: 11,
      atsMode: true,
    },
  };
}

export function createSection(type: SectionType, title?: string): Section {
  return {
    id: `sec-${uuid()}`,
    type,
    title: title ?? ATS_STANDARD_TITLES[type],
    enabled: true,
  };
}

export function enabledSections(data: ResumeData): Section[] {
  return data.sections.filter((s) => s.enabled && s.type !== 'personal');
}

export function isSectionEnabled(data: ResumeData, type: SectionType): boolean {
  return data.sections.some((s) => s.type === type && s.enabled);
}

export function effectiveTemplate(data: ResumeData): string {
  if (data.customization.atsMode || data.customization.templateId === 'ats') {
    return 'ats';
  }
  return data.customization.templateId;
}
