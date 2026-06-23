export type TemplateId = 'ats' | 'classic' | 'modern' | 'minimal';

export type SectionType =
  | 'personal'
  | 'summary'
  | 'experience'
  | 'education'
  | 'skills'
  | 'projects'
  | 'certifications'
  | 'languages'
  | 'custom';

export interface Section {
  id: string;
  type: SectionType;
  title: string;
  enabled: boolean;
}

export interface Customization {
  templateId: TemplateId;
  primaryColor: string;
  fontFamily: string;
  fontSize: number;
  atsMode: boolean;
}

export interface PersonalInfo {
  fullName: string;
  email: string;
  phone: string;
  location: string;
  website: string;
  linkedIn: string;
  github: string;
  summary: string;
}

export interface Experience {
  id: string;
  company: string;
  position: string;
  location: string;
  startDate: string;
  endDate: string;
  current: boolean;
  description: string;
}

export interface Education {
  id: string;
  institution: string;
  degree: string;
  field: string;
  startDate: string;
  endDate: string;
  gpa: string;
}

export interface Project {
  id: string;
  name: string;
  url: string;
  description: string;
  technologies: string;
}

export interface Certification {
  id: string;
  name: string;
  issuer: string;
  date: string;
  url: string;
}

export interface Language {
  id: string;
  name: string;
  proficiency: string;
}

export interface CustomSection {
  id: string;
  sectionId: string;
  content: string;
}

export interface ResumeData {
  personalInfo: PersonalInfo;
  sections: Section[];
  experience: Experience[];
  education: Education[];
  skills: string[];
  projects: Project[];
  certifications: Certification[];
  languages: Language[];
  customSections: CustomSection[];
  customization: Customization;
}

export interface Resume {
  id: string;
  title: string;
  data: ResumeData;
  createdAt: string;
  updatedAt: string;
}

export interface TemplateMeta {
  id: TemplateId;
  name: string;
  description: string;
  atsFriendly: boolean;
}

export interface ATSCheck {
  id: string;
  label: string;
  passed: boolean;
  tip: string;
}

export const ATS_STANDARD_TITLES: Record<SectionType, string> = {
  personal: 'Contact',
  summary: 'Professional Summary',
  experience: 'Work Experience',
  education: 'Education',
  skills: 'Skills',
  projects: 'Projects',
  certifications: 'Certifications',
  languages: 'Languages',
  custom: 'Additional Information',
};

export const ADDABLE_SECTION_TYPES: SectionType[] = [
  'summary',
  'experience',
  'education',
  'skills',
  'projects',
  'certifications',
  'languages',
  'custom',
];
