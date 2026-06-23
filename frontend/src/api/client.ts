const API_BASE = import.meta.env.VITE_API_URL ?? '';

async function request<T>(path: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, {
    headers: { 'Content-Type': 'application/json', ...options?.headers },
    ...options,
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: res.statusText }));
    throw new Error(err.error ?? 'Request failed');
  }
  if (res.status === 204) return undefined as T;
  return res.json();
}

import type { Resume, ResumeData, TemplateMeta } from '../types/resume';

export const api = {
  listResumes: () => request<Resume[]>('/api/resumes'),
  getResume: (id: string) => request<Resume>(`/api/resumes/${id}`),
  createResume: (title: string, data: ResumeData) =>
    request<Resume>('/api/resumes', { method: 'POST', body: JSON.stringify({ title, data }) }),
  updateResume: (id: string, title: string, data: ResumeData) =>
    request<Resume>(`/api/resumes/${id}`, { method: 'PUT', body: JSON.stringify({ title, data }) }),
  deleteResume: (id: string) => request<void>(`/api/resumes/${id}`, { method: 'DELETE' }),
  getTemplates: () => request<TemplateMeta[]>('/api/templates'),
  exportPDF: async (data: ResumeData, filename: string) => {
    const res = await fetch(`${API_BASE}/api/resumes/export/pdf`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error('PDF export failed');
    const blob = await res.blob();
    downloadBlob(blob, `${filename}.pdf`);
  },
  exportDOCX: async (data: ResumeData, filename: string) => {
    const res = await fetch(`${API_BASE}/api/resumes/export/docx`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error('DOCX export failed');
    const blob = await res.blob();
    downloadBlob(blob, `${filename}.docx`);
  },
};

function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}
