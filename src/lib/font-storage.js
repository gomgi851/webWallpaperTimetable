const DB_NAME = 'timetable_fonts_v1';
const DB_VERSION = 1;
const STORE_NAME = 'fonts';

export const DEFAULT_FONT_ID = '__default__';
export const DEFAULT_FONT_FAMILY = 'Cafe24 Surround';
export const DEFAULT_FONT_NAME = 'Cafe24 Surround (기본)';

const ALLOWED_EXTENSIONS = ['.ttf', '.otf', '.woff', '.woff2'];

function openDB() {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, DB_VERSION);
    req.onupgradeneeded = (e) => {
      const db = e.target.result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME, { keyPath: 'id' });
      }
    };
    req.onsuccess = (e) => resolve(e.target.result);
    req.onerror = (e) => reject(e.target.error);
  });
}

export async function saveFontToIDB({ id, name, blob }) {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, 'readwrite');
    tx.objectStore(STORE_NAME).put({ id, name, blob });
    tx.oncomplete = () => resolve();
    tx.onerror = (e) => reject(e.target.error);
  });
}

export async function getAllFontsFromIDB() {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, 'readonly');
    const req = tx.objectStore(STORE_NAME).getAll();
    req.onsuccess = (e) => resolve(e.target.result || []);
    req.onerror = (e) => reject(e.target.error);
  });
}

export async function getFontFromIDB(id) {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, 'readonly');
    const req = tx.objectStore(STORE_NAME).get(id);
    req.onsuccess = (e) => resolve(e.target.result || null);
    req.onerror = (e) => reject(e.target.error);
  });
}

export async function deleteFontFromIDB(id) {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, 'readwrite');
    tx.objectStore(STORE_NAME).delete(id);
    tx.oncomplete = () => resolve();
    tx.onerror = (e) => reject(e.target.error);
  });
}

export function isValidFontFile(file) {
  const lower = file.name.toLowerCase();
  return ALLOWED_EXTENSIONS.some((ext) => lower.endsWith(ext));
}

export async function registerFontFromIDB(fontId) {
  const record = await getFontFromIDB(fontId);
  if (!record) throw new Error(`Font not found in storage: ${fontId}`);
  const blobUrl = URL.createObjectURL(record.blob);
  const face = new FontFace(fontId, `url(${blobUrl})`);
  await face.load();
  document.fonts.add(face);
  return fontId;
}

export async function ensureFontLoaded(fontId) {
  if (fontId === DEFAULT_FONT_ID) {
    try {
      await Promise.race([
        document.fonts.load(`16px '${DEFAULT_FONT_FAMILY}'`),
        new Promise((_, rej) => setTimeout(() => rej(new Error('timeout')), 5000)),
      ]);
    } catch (_) {}
    return DEFAULT_FONT_FAMILY;
  }

  if (!document.fonts.check(`16px "${fontId}"`)) {
    await registerFontFromIDB(fontId);
  }
  return fontId;
}
