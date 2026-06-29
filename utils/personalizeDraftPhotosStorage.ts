const DB_NAME = 'dreamaze-personalize-draft';
const DB_VERSION = 1;
const PHOTOS_STORE = 'photos';

type PhotosRecord = {
  bookId: string;
  photos: string[];
  savedAt: number;
};

function openPhotosDb(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    if (typeof window === 'undefined' || !window.indexedDB) {
      reject(new Error('IndexedDB unavailable'));
      return;
    }
    const request = indexedDB.open(DB_NAME, DB_VERSION);
    request.onerror = () => reject(request.error ?? new Error('Failed to open IndexedDB'));
    request.onsuccess = () => resolve(request.result);
    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains(PHOTOS_STORE)) {
        db.createObjectStore(PHOTOS_STORE, { keyPath: 'bookId' });
      }
    };
  });
}

function collectPhotoUrls(formData: Record<string, unknown>): string[] {
  const urls = new Set<string>();
  if (Array.isArray(formData.photos)) {
    for (const photo of formData.photos) {
      if (typeof photo === 'string' && photo.trim()) urls.add(photo);
    }
  }
  const photo = formData.photo;
  if (photo && typeof photo === 'object' && photo !== null && 'path' in photo) {
    const path = String((photo as { path?: unknown }).path || '').trim();
    if (path) urls.add(path);
  }
  return Array.from(urls);
}

export async function savePersonalizeDraftPhotos(bookId: string, photos: string[]): Promise<void> {
  if (typeof window === 'undefined' || !bookId) return;
  try {
    const db = await openPhotosDb();
    await new Promise<void>((resolve, reject) => {
      const tx = db.transaction(PHOTOS_STORE, 'readwrite');
      const store = tx.objectStore(PHOTOS_STORE);
      if (photos.length === 0) {
        store.delete(bookId);
      } else {
        const record: PhotosRecord = { bookId, photos, savedAt: Date.now() };
        store.put(record);
      }
      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error ?? new Error('Failed to save draft photos'));
    });
    db.close();
  } catch (error) {
    console.warn('[personalizeDraft] Failed to save photos to IndexedDB:', error);
  }
}

export async function loadPersonalizeDraftPhotos(bookId: string): Promise<string[] | null> {
  if (typeof window === 'undefined' || !bookId) return null;
  try {
    const db = await openPhotosDb();
    const photos = await new Promise<string[] | null>((resolve, reject) => {
      const tx = db.transaction(PHOTOS_STORE, 'readonly');
      const request = tx.objectStore(PHOTOS_STORE).get(bookId);
      request.onsuccess = () => {
        const record = request.result as PhotosRecord | undefined;
        resolve(Array.isArray(record?.photos) ? record!.photos : null);
      };
      request.onerror = () => reject(request.error ?? new Error('Failed to load draft photos'));
    });
    db.close();
    return photos;
  } catch (error) {
    console.warn('[personalizeDraft] Failed to load photos from IndexedDB:', error);
    return null;
  }
}

export async function clearPersonalizeDraftPhotos(bookId: string): Promise<void> {
  await savePersonalizeDraftPhotos(bookId, []);
}

export async function hydratePersonalizeDraftFormData(
  bookId: string,
  formData: Record<string, unknown>,
): Promise<Record<string, unknown>> {
  const storedPhotos = await loadPersonalizeDraftPhotos(bookId);
  if (!storedPhotos?.length) return formData;

  return {
    ...formData,
    photos: storedPhotos,
    photo: storedPhotos[0] ? { path: storedPhotos[0] } : formData.photo ?? null,
  };
}

export { collectPhotoUrls };
