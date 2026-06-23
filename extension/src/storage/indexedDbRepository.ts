import { v4 as uuid } from 'uuid';
import type { ResumeRepository } from '@shared/storage/repository';
import type { Resume, ResumeData } from '@shared/types/resume';

const DB_NAME = 'resume-builder-extension';
const STORE = 'resumes';
const DB_VERSION = 1;

function openDb(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);
    request.onerror = () => reject(request.error ?? new Error('Failed to open database'));
    request.onsuccess = () => resolve(request.result);
    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains(STORE)) {
        const store = db.createObjectStore(STORE, { keyPath: 'id' });
        store.createIndex('updatedAt', 'updatedAt', { unique: false });
      }
    };
  });
}

function withStore<T>(mode: IDBTransactionMode, fn: (store: IDBObjectStore) => IDBRequest<T>): Promise<T> {
  return openDb().then(
    (db) =>
      new Promise<T>((resolve, reject) => {
        const tx = db.transaction(STORE, mode);
        const store = tx.objectStore(STORE);
        const request = fn(store);
        request.onerror = () => reject(request.error ?? new Error('Database request failed'));
        request.onsuccess = () => resolve(request.result);
        tx.oncomplete = () => db.close();
        tx.onerror = () => reject(tx.error ?? new Error('Database transaction failed'));
      }),
  );
}

function nowIso() {
  return new Date().toISOString();
}

function sortByUpdated(resumes: Resume[]) {
  return [...resumes].sort(
    (a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime(),
  );
}

export const indexedDbRepository: ResumeRepository = {
  async list() {
    const rows = await withStore<Resume[]>('readonly', (store) => store.getAll());
    return sortByUpdated(rows);
  },

  async get(id) {
    const row = await withStore<Resume | undefined>('readonly', (store) => store.get(id));
    if (!row) throw new Error('Resume not found');
    return row;
  },

  async create(title, data) {
    const resume: Resume = {
      id: uuid(),
      title,
      data,
      createdAt: nowIso(),
      updatedAt: nowIso(),
    };
    await withStore<IDBValidKey>('readwrite', (store) => store.add(resume));
    return resume;
  },

  async update(id, title, data) {
    const existing = await indexedDbRepository.get(id);
    const resume: Resume = {
      ...existing,
      title,
      data,
      updatedAt: nowIso(),
    };
    await withStore<IDBValidKey>('readwrite', (store) => store.put(resume));
    return resume;
  },

  async delete(id) {
    await withStore<undefined>('readwrite', (store) => store.delete(id));
  },
};

export async function exportPdfViaPrint(_data: ResumeData, html: string, filename: string) {
  const safeName = filename.replace(/[^\w\s-]/g, '').trim() || 'resume';
  const doc = html.includes('<title>')
    ? html.replace(/<title>[^<]*<\/title>/, `<title>${safeName}</title>`)
    : html;

  const blob = new Blob([doc], { type: 'text/html;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const win = window.open(url, '_blank');

  if (!win) {
    URL.revokeObjectURL(url);
    throw new Error('Allow pop-ups to export PDF');
  }

  const cleanup = () => {
    URL.revokeObjectURL(url);
    if (!win.closed) win.close();
  };

  try {
    await new Promise<void>((resolve, reject) => {
      const timeout = window.setTimeout(() => reject(new Error('Print window timed out')), 30000);
      win.onload = () => {
        window.clearTimeout(timeout);
        resolve();
      };
    });

    if (win.document.fonts) {
      await win.document.fonts.ready;
    }
    await new Promise((resolve) => window.setTimeout(resolve, 300));

    win.focus();
    win.print();

    win.addEventListener('afterprint', cleanup, { once: true });
    // Fallback if afterprint never fires (some browsers)
    window.setTimeout(cleanup, 120_000);
  } catch (e) {
    cleanup();
    throw e;
  }
}
