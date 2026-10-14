import { withIndexedStore } from "../../../shared/storage/indexedDb.js";
import { syncOfflineManualSession } from "../components/ReadingModal/api/readingSessionApi.js";

// Intentionally separate from EPUB blobs and the catalog snapshot eviction budget.
const config = {
  name: "library-offline-reading",
  version: 1,
  storeName: "sessions",
  upgrade(database) {
    if (!database.objectStoreNames.contains("sessions")) {
      const store = database.createObjectStore("sessions", { keyPath: "key" });
      store.createIndex("userId", "userId", { unique: false });
    }
  },
};

const requireId = (value, name) => {
  if (typeof value !== "string" || !value.trim()) {
    throw new Error(`Missing ${name}`);
  }
  return value;
};

const keyFor = (userId, clientSessionId) =>
  JSON.stringify([requireId(userId, "userId"), requireId(clientSessionId, "clientSessionId")]);

/** Queue only fully completed MANUAL/PAGES sessions; the server validates the payload. */
export const enqueueOfflineManualSession = async ({ userId, bookId, session }) => {
  requireId(bookId, "bookId");
  if (!session || typeof session !== "object") throw new Error("Missing session");
  const key = keyFor(userId, session.clientSessionId);
  const existing = await withIndexedStore(config, "readonly", (store) => store.get(key));
  if (existing) {
    if (existing.bookId !== bookId || JSON.stringify(existing.session) !== JSON.stringify(session)) {
      throw new Error("Offline session ID already queued with different data");
    }
    return existing;
  }
  const record = {
    key,
    userId,
    bookId,
    session: structuredClone(session),
    enqueuedAt: Date.now(),
  };
  await withIndexedStore(config, "readwrite", (store) => store.add(record));
  return record;
};

export const listOfflineManualSessions = async (userId) => {
  requireId(userId, "userId");
  const records = await withIndexedStore(
    config, "readonly", (store) => store.index("userId").getAll(userId),
  );
  return records.sort((a, b) => a.enqueuedAt - b.enqueuedAt);
};

// Successful responses (including server idempotency) are the ONLY reason to delete.
// Conflicts and validation errors remain visible to future conflict-resolution UI.
const running = new Map();

const syncRecords = async (userId) => {
  const records = await listOfflineManualSessions(userId);
  const result = { synced: 0, pending: records.length, errors: [] };
  for (const record of records) {
    try {
      await syncOfflineManualSession(record.bookId, record.session);
      // Do not delete a record that another tab has replaced meanwhile.
      const current = await withIndexedStore(config, "readonly", (store) => store.get(record.key));
      if (current && JSON.stringify(current.session) === JSON.stringify(record.session)) {
        await withIndexedStore(config, "readwrite", (store) => store.delete(record.key));
        result.synced += 1;
      }
    } catch (error) {
      result.errors.push({ clientSessionId: record.session.clientSessionId, status: error?.status ?? null, message: error?.message ?? "Sync failed" });
      // Stop retrying when offline, unauthenticated, or the server is unavailable.
      if (!error?.status || error.status === 401 || error.status >= 500) break;
    }
  }
  result.pending = (await listOfflineManualSessions(userId)).length;
  return result;
};

/** Serialize attempts across tabs when Web Locks is available. Always use
 * the server's idempotency key as the final cross-tab safety guarantee. */
export const syncQueuedOfflineManualSessions = (userId) => {
  requireId(userId, "userId");
  if (running.has(userId)) return running.get(userId);

  const run = async () => {
    const locks = globalThis.navigator?.locks;
    if (locks?.request) {
      return locks.request(`library-reading-sync:${userId}`, { mode: "exclusive" },
        () => syncRecords(userId));
    }
    // Older browsers: single-flight in this tab; cross-tab duplicate POSTs
    // are harmless because the server uses clientSessionId idempotently.
    return syncRecords(userId);
  };

  const promise = run();
  running.set(userId, promise);
  void promise.finally(() => {
    if (running.get(userId) === promise) running.delete(userId);
  }).catch(() => {});
  return promise;
};
