const DB_NAME = "library-offline-epubs";
const STORE_NAME = "books";
const DB_VERSION = 1;

const makeKey = ({ userId, libraryId, bookId, fileId }) => {
  const ids = [userId, libraryId, bookId, fileId];

  if (ids.some((id) => typeof id !== "string" || !id.trim())) {
    throw new Error("Missing offline EPUB identifier");
  }

  return JSON.stringify(ids);
};

const openDatabase = () =>
  new Promise((resolve, reject) => {
    if (typeof indexedDB === "undefined") {
      reject(new Error("Offline storage is unavailable"));
      return;
    }

    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onupgradeneeded = () => {
      const database = request.result;

      if (!database.objectStoreNames.contains(STORE_NAME)) {
        const store = database.createObjectStore(STORE_NAME, {
          keyPath: "key",
        });

        store.createIndex("userId", "userId", { unique: false });
      }
    };

    request.onsuccess = () => resolve(request.result);

    request.onerror = () =>
      reject(request.error || new Error("Cannot open offline storage"));

    request.onblocked = () =>
      reject(new Error("Offline storage is blocked by another tab"));
  });

const transact = async (mode, action) => {
  const database = await openDatabase();

  try {
    return await new Promise((resolve, reject) => {
      try {
        const transaction = database.transaction(STORE_NAME, mode);
        const request = action(transaction.objectStore(STORE_NAME));

        transaction.oncomplete = () => resolve(request.result);

        transaction.onerror = () =>
          reject(transaction.error || new Error("Offline storage failed"));

        transaction.onabort = () =>
          reject(transaction.error || new Error("Offline storage aborted"));
      } catch (error) {
        reject(error);
      }
    });
  } finally {
    database.close();
  }
};

export const saveOfflineEpub = async ({
  userId,
  libraryId,
  bookId,
  fileId,
  title,
  blob,
  book,
  file,
  savedAt = Date.now(),
}) => {
  const key = makeKey({ userId, libraryId, bookId, fileId });

  if (!(blob instanceof Blob) || blob.size === 0) {
    throw new Error("Cannot cache an empty EPUB file");
  }

  const record = {
    key,
    userId,
    libraryId,
    bookId,
    fileId,
    title: title || "",
    blob,
    book: book ? {
      id: bookId,
      title: String(book.title ?? title ?? ""),
      status: typeof book.status === "string" ? book.status : null,
      pages: book.pages != null && Number.isFinite(Number(book.pages))
        ? Number(book.pages)
        : null,
      currentPercent: book.currentPercent != null &&
        Number.isFinite(Number(book.currentPercent))
          ? Math.max(0, Math.min(100, Number(book.currentPercent)))
          : 0,
    } : null,
    file: file ? {
      id: fileId,
      format: "EPUB",
      fileName: typeof file.fileName === "string" ? file.fileName : "",
    } : null,
    savedAt: Number.isFinite(savedAt) ? savedAt : Date.now(),
  };

  await transact("readwrite", (store) => store.put(record));

  return record.savedAt;
};

export const getOfflineEpub = async (ids) => {
  const key = makeKey(ids);
  return (await transact("readonly", (store) => store.get(key))) ?? null;
};


export const getOfflineEpubsForBook = async ({
  userId,
  libraryId,
  bookId,
}) => {
  if ([userId, libraryId, bookId].some(
    (id) => typeof id !== "string" || !id.trim()
  )) {
    throw new Error("Missing offline book identifier");
  }

  // Query keys first, so blobs from other books stay unloaded.
  const keys = await transact(
    "readonly",
    (store) => store.index("userId").getAllKeys(userId)
  );

  const matchingKeys = keys.filter((key) => {
    try {
      const ids = JSON.parse(key);
      return Array.isArray(ids) &&
        ids[0] === userId &&
        ids[1] === libraryId &&
        ids[2] === bookId;
    } catch {
      return false;
    }
  });

  const records = await Promise.all(
    matchingKeys.map((key) =>
      transact("readonly", (store) => store.get(key))
    )
  );

  return records
    .filter((record) =>
      record &&
      record.blob instanceof Blob &&
      record.blob.size > 0 &&
      record.book?.id === bookId &&
      record.file?.id === record.fileId &&
      record.file?.format === "EPUB"
    )
    .sort((a, b) => (b.savedAt || 0) - (a.savedAt || 0));
};

export const deleteOfflineEpub = async (ids) => {
  const key = makeKey(ids);
  await transact("readwrite", (store) => store.delete(key));
};
