import { useCallback, useEffect, useState } from 'react';
import { v4 as uuid } from 'uuid';
import { api } from '../api/client';
import type { Resume, ResumeData, Section, SectionType } from '../types/resume';
import { ADDABLE_SECTION_TYPES } from '../types/resume';
import { createSection, defaultResumeData } from '../utils/defaults';

export function useResumeEditor() {
  const [resumeId, setResumeId] = useState<string | null>(null);
  const [title, setTitle] = useState('My Resume');
  const [data, setData] = useState<ResumeData>(defaultResumeData);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const updateData = useCallback((updater: (prev: ResumeData) => ResumeData) => {
    setData((prev) => updater(prev));
    setSaved(false);
  }, []);

  const save = useCallback(async () => {
    setSaving(true);
    setError(null);
    try {
      if (resumeId) {
        const res = await api.updateResume(resumeId, title, data);
        setData(res.data);
      } else {
        const res = await api.createResume(title, data);
        setResumeId(res.id);
        setData(res.data);
      }
      setSaved(true);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Save failed');
    } finally {
      setSaving(false);
    }
  }, [resumeId, title, data]);

  useEffect(() => {
    const timer = setTimeout(() => {
      if (!saved && !saving) save();
    }, 2000);
    return () => clearTimeout(timer);
  }, [data, saved, saving, save]);

  const addSection = (type: SectionType) => {
    if (type === 'personal') return;
    updateData((prev) => {
      const exists = prev.sections.some((s) => s.type === type && type !== 'custom');
      if (exists && type !== 'custom') {
        return {
          ...prev,
          sections: prev.sections.map((s) => (s.type === type ? { ...s, enabled: true } : s)),
        };
      }
      const section = createSection(type);
      const next = { ...prev, sections: [...prev.sections, section] };
      if (type === 'custom') {
        next.customSections = [
          ...prev.customSections,
          { id: uuid(), sectionId: section.id, content: '' },
        ];
      }
      return next;
    });
  };

  const removeSection = (sectionId: string) => {
    updateData((prev) => ({
      ...prev,
      sections: prev.sections.map((s) =>
        s.id === sectionId ? { ...s, enabled: false } : s
      ),
    }));
  };

  const reorderSection = (sectionId: string, direction: 'up' | 'down') => {
    updateData((prev) => {
      const sections = [...prev.sections];
      const idx = sections.findIndex((s) => s.id === sectionId);
      if (idx < 0) return prev;
      const swap = direction === 'up' ? idx - 1 : idx + 1;
      if (swap < 0 || swap >= sections.length) return prev;
      [sections[idx], sections[swap]] = [sections[swap], sections[idx]];
      return { ...prev, sections };
    });
  };

  const updateSection = (sectionId: string, patch: Partial<Section>) => {
    updateData((prev) => ({
      ...prev,
      sections: prev.sections.map((s) => (s.id === sectionId ? { ...s, ...patch } : s)),
    }));
  };

  const loadResume = (resume: Resume) => {
    setResumeId(resume.id);
    setTitle(resume.title);
    setData(resume.data);
    setSaved(true);
  };

  const newResume = () => {
    setResumeId(null);
    setTitle('My Resume');
    setData(defaultResumeData());
    setSaved(false);
  };

  const availableToAdd = ADDABLE_SECTION_TYPES.filter((type) => {
    if (type === 'custom') return true;
    return !data.sections.some((s) => s.type === type && s.enabled);
  });

  return {
    resumeId,
    title,
    setTitle,
    data,
    setData: updateData,
    saving,
    saved,
    error,
    save,
    addSection,
    removeSection,
    reorderSection,
    updateSection,
    loadResume,
    newResume,
    availableToAdd,
  };
}
