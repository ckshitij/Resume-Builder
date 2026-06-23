import { useState } from 'react';
import { api } from '../api/client';
import type { Resume } from '../types/resume';

interface Props {
  resumes: Resume[];
  activeResumeId: string | null;
  onLoad: (resume: Resume) => void;
  onDeleted: (id: string) => void;
  onError: (message: string) => void;
}

export function SavedResumesPanel({
  resumes,
  activeResumeId,
  onLoad,
  onDeleted,
  onError,
}: Props) {
  const [confirmId, setConfirmId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const handleDelete = async (resume: Resume) => {
    setDeletingId(resume.id);
    try {
      await api.deleteResume(resume.id);
      onDeleted(resume.id);
      setConfirmId(null);
    } catch (e) {
      onError(e instanceof Error ? e.message : 'Failed to delete resume');
    } finally {
      setDeletingId(null);
    }
  };

  if (resumes.length === 0) {
    return (
      <div className="saved-panel">
        <h3>Your resumes</h3>
        <p className="panel-hint">No saved resumes yet. Edits are auto-saved after you start editing.</p>
      </div>
    );
  }

  return (
    <div className="saved-panel">
      <h3>Your resumes</h3>
      <p className="panel-hint">Load a resume to edit, or delete ones you no longer need.</p>
      <ul className="resume-list">
        {resumes.map((r) => (
          <li key={r.id} className="resume-list-item">
            <button
              type="button"
              className={`resume-item ${activeResumeId === r.id ? 'active' : ''}`}
              onClick={() => onLoad(r)}
              disabled={deletingId === r.id}
            >
              <span className="resume-item-title">{r.title}</span>
              <span className="resume-item-date">{new Date(r.updatedAt).toLocaleDateString()}</span>
            </button>

            {confirmId === r.id ? (
              <div className="delete-confirm">
                <span>Delete this resume?</span>
                <div className="delete-confirm-actions">
                  <button
                    type="button"
                    className="btn btn-sm btn-danger"
                    onClick={() => handleDelete(r)}
                    disabled={deletingId === r.id}
                  >
                    {deletingId === r.id ? 'Deleting…' : 'Delete'}
                  </button>
                  <button
                    type="button"
                    className="btn btn-sm btn-ghost"
                    onClick={() => setConfirmId(null)}
                    disabled={deletingId === r.id}
                  >
                    Cancel
                  </button>
                </div>
              </div>
            ) : (
              <button
                type="button"
                className="btn-delete-resume"
                title={`Delete ${r.title}`}
                aria-label={`Delete ${r.title}`}
                onClick={() => setConfirmId(r.id)}
                disabled={deletingId !== null}
              >
                ×
              </button>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}
