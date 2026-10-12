const DB_NAME = "library-offline-catalog";
const STORE = "snapshots";
const MAX_BYTES = 4 * 1024 * 1024;

const makeKey = (userId, libraryId, kind = "catalog") => {
  if (!userId || !libraryId) {
    throw new Error("Missing offline catalog identifier");
  }

  if (kind !== "catalog" && kind !== "current") {
    throw new Error("Invalid offline snapshot type");
  }

  return JSON.stringify(
    kind === "catalog"
      ? [userId, libraryId]
      : [userId, libraryId, kind]
  );
};

const openDatabase = () =>
  new Promise((resolve, reject) => {
    if (typeof indexedDB === "undefined") {
      reject(new Error("IndexedDB unavailable"));
      return;
    }

    const request = indexedDB.open(DB_NAME, 1);

    request.onupgradeneeded = () => {
      const db = request.result;

      if (!db.objectStoreNames.contains(STORE)) {
        db.createObjectStore(STORE, { keyPath: "key" });
      }
    };

    request.onsuccess = () => resolve(request.result);

    request.onerror = () =>
      reject(request.error || new Error("Cannot open catalog cache"));

    request.onblocked = () =>
      reject(new Error("Catalog cache is blocked"));
  });

export const getOfflineLibraryBooks = async (userId, libraryId, kind = "catalog") => {
  const key = makeKey(userId, libraryId, kind);
  const db = await openDatabase();

  try {
    return await new Promise((resolve, reject) => {
      const tx = db.transaction(STORE, "readonly");
      const request = tx.objectStore(STORE).get(key);

      tx.oncomplete = () => {
        const record = request.result;

        if (!record) {
          resolve(null);
          return;
        }

        try {
          const books = JSON.parse(record.data);
          resolve(
            Array.isArray(books)
              ? { books, savedAt: record.savedAt }
              : null
          );
        } catch {
          resolve(null);
        }
      };

      tx.onerror = () => reject(tx.error);
      tx.onabort = () => reject(tx.error);
    });
  } finally {
    db.close();
  }
};

export const saveOfflineLibraryBooks = async (
  userId,
  libraryId,
  books,
  kind = "catalog"
) => {
  const key = makeKey(userId, libraryId, kind);

  if (!Array.isArray(books)) {
    throw new Error("Catalog must be an array");
  }

  const data = JSON.stringify(books);
  const bytes = new Blob([data]).size;

  if (bytes > MAX_BYTES) {
    throw new Error("Catalog exceeds offline cache budget");
  }

  const db = await openDatabase();

  try {
    await new Promise((resolve, reject) => {
      const tx = db.transaction(STORE, "readwrite");
      const store = tx.objectStore(STORE);
      const request = store.getAll();

      request.onsuccess = () => {
        const existing = request.result
          .filter((item) => item.key !== key)
          .sort((a, b) => a.savedAt - b.savedAt);

        let total = bytes + existing.reduce(
          (sum, item) => sum + (item.bytes || 0),
          0
        );

        for (const item of existing) {
          if (total <= MAX_BYTES) break;

          store.delete(item.key);
          total -= item.bytes || 0;
        }

        store.put({
          key,
          data,
          bytes,
          savedAt: Date.now(),
        });
      };

      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error);
      tx.onabort = () => reject(tx.error);
    });
  } finally {
    db.close();
  }
};

export const getOfflineCurrentBooks = (userId, libraryId) =>
  getOfflineLibraryBooks(userId, libraryId, "current");

export const saveOfflineCurrentBooks = (userId, libraryId, books) =>
  saveOfflineLibraryBooks(userId, libraryId, books, "current");
