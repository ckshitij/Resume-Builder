import type { Resume, ResumeData } from '../types/resume';

export interface ResumeRepository {
  list(): Promise<Resume[]>;
  get(id: string): Promise<Resume>;
  create(title: string, data: ResumeData): Promise<Resume>;
  update(id: string, title: string, data: ResumeData): Promise<Resume>;
  delete(id: string): Promise<void>;
}
