import { api } from '../api/client';
import type { ResumeRepository } from '@shared/storage/repository';
import type { ResumeData } from '@shared/types/resume';

export const httpResumeRepository: ResumeRepository = {
  list: () => api.listResumes(),
  get: (id) => api.getResume(id),
  create: (title, data) => api.createResume(title, data),
  update: (id, title, data) => api.updateResume(id, title, data),
  delete: (id) => api.deleteResume(id),
};

export async function exportPdfViaApi(data: ResumeData, html: string, filename: string) {
  await api.exportPDF(data, html, filename);
}

export async function exportDocxViaApi(data: ResumeData, filename: string) {
  await api.exportDOCX(data, filename);
}
