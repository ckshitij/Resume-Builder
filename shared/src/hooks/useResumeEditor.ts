import { useCallback, useEffect, useRef, useState } from 'react';
import { v4 as uuid } from 'uuid';
import type { ResumeRepository } from '../storage/repository';
import type { Resume, ResumeData, Section, SectionType } from '../types/resume';
import { ADDABLE_SECTION_TYPES } from '../types/resume';
import { createSection, defaultResumeData } from '../utils/defaults';
import { moveItem } from '../utils/reorder';

export interface SaveEvent {
  title: string;
  auto: boolean;
  resumeId: string | null;
}

interface Options {
  repository: ResumeRepository;
  onSaved?: (event: SaveEvent) => void;
}

export function useResumeEditor({ repository, onSaved }: Options) {
  const [resumeId, setResumeId] = useState<string | null>(null);
  const [title, setTitle] = useState('My Resume');
  const [data, setData] = useState<ResumeData>(defaultResumeData);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const onSavedRef = useRef(onSaved);
  onSavedRef.current = onSaved;

  const updateData = useCallback((updater: (prev: ResumeData) => ResumeData) => {
    setData((prev) => updater(prev));
    setSaved(false);
  }, []);

  const save = useCallback(async (auto = false): Promise<boolean> => {
    setSaving(true);
    setError(null);
    try {
      let id = resumeId;
      if (resumeId) {
        const res = await repository.update(resumeId, title, data);
        setData(res.data);
        id = res.id;
      } else {
        const res = await repository.create(title, data);
        setResumeId(res.id);
        setData(res.data);
        id = res.id;
      }
      setSaved(true);
      onSavedRef.current?.({ title, auto, resumeId: id });
      return true;
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Save failed');
      return false;
    } finally {
      setSaving(false);
    }
  }, [repository, resumeId, title, data]);

  useEffect(() => {
    const timer = setTimeout(() => {
      if (!saved && !saving) save(true);
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

  const moveSection = (fromIndex: number, toIndex: number) => {
    updateData((prev) => {
      const from = prev.sections[fromIndex];
      const to = prev.sections[toIndex];
      if (!from || !to) return prev;
      if (from.type === 'personal' || to.type === 'personal') return prev;
      return { ...prev, sections: moveItem(prev.sections, fromIndex, toIndex) };
    });
  };

  const reorderSection = (sectionId: string, direction: 'up' | 'down') => {
    updateData((prev) => {
      const idx = prev.sections.findIndex((s) => s.id === sectionId);
      if (idx < 0) return prev;
      const toIndex = direction === 'up' ? idx - 1 : idx + 1;
      if (toIndex < 0 || toIndex >= prev.sections.length) return prev;
      const from = prev.sections[idx];
      const to = prev.sections[toIndex];
      if (from.type === 'personal' || to.type === 'personal') return prev;
      return { ...prev, sections: moveItem(prev.sections, idx, toIndex) };
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
    moveSection,
    updateSection,
    loadResume,
    newResume,
    availableToAdd,
  };
}
