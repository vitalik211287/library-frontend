/** Shared IndexedDB transaction helper. Existing caches keep their own databases. */
export const openIndexedDatabase = (name, version, upgrade) =>
  new Promise((resolve, reject) => {
    if (typeof indexedDB === "undefined") {
      reject(new Error("IndexedDB unavailable"));
      return;
    }
    const request = indexedDB.open(name, version);
    request.onupgradeneeded = (event) => upgrade(request.result, event.oldVersion);
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error || new Error("Cannot open IndexedDB"));
    request.onblocked = () => reject(new Error("IndexedDB upgrade blocked by another tab"));
  });

export const withIndexedStore = async ({ name, version, storeName, upgrade }, mode, action) => {
  const db = await openIndexedDatabase(name, version, upgrade);
  try {
    return await new Promise((resolve, reject) => {
      let result;
      let transaction;
      try {
        transaction = db.transaction(storeName, mode);
        const request = action(transaction.objectStore(storeName));
        if (request) {
          request.onsuccess = () => { result = request.result; };
        }
      } catch (error) {
        reject(error);
        return;
      }
      transaction.oncomplete = () => resolve(result);
      transaction.onerror = () => reject(transaction.error || new Error("IndexedDB transaction failed"));
      transaction.onabort = () => reject(transaction.error || new Error("IndexedDB transaction aborted"));
    });
  } finally {
    db.close();
  }
};
