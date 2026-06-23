import type { ResumeData } from '../types/resume';
import { effectiveTemplate } from '../utils/defaults';
import { ATSTemplate, ClassicTemplate, MinimalTemplate, ModernTemplate } from '../templates/ResumeTemplates';

export function ResumePreview({ data }: { data: ResumeData }) {
  const template = effectiveTemplate(data);

  switch (template) {
    case 'modern':
      return <ModernTemplate data={data} />;
    case 'minimal':
      return <MinimalTemplate data={data} />;
    case 'classic':
      return <ClassicTemplate data={data} />;
    default:
      return <ATSTemplate data={data} />;
  }
}
