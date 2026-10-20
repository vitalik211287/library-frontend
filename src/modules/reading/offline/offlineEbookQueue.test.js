import "fake-indexeddb/auto";
import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("../components/ReadingModal/api/readingSessionApi.js", () => ({
  syncOfflineManualSession: vi.fn(),
  syncOfflineEbookSession: vi.fn(),
}));

import {
  syncOfflineManualSession,
  syncOfflineEbookSession,
} from "../components/ReadingModal/api/readingSessionApi.js";
import {
  enqueueOfflineManualSession,
  enqueueOfflineEbookSession,
  listOfflineManualSessions,
  listOfflineEbookSessions,
  listOfflineReadingSessions,
  syncQueuedOfflineReadingSessions,
  syncQueuedOfflineManualSessions,
} from "./offlineReadingQueue.js";

const manual = {
  clientSessionId: "11111111-1111-4111-8111-111111111111",
  startedAt: "2026-10-17T10:00:00.000Z",
  finishedAt: "2026-10-17T10:05:00.000Z",
  startPage: 5, endPage: 8, durationSeconds: 280,
};
const ebook = {
  clientSessionId: "22222222-2222-4222-8222-222222222222",
  source: "EBOOK", progressMode: "PERCENT",
  startedAt: "2026-10-17T10:10:00.000Z",
  finishedAt: "2026-10-17T10:15:00.000Z",
  startPercent: 12, endPercent: 14, durationSeconds: 250,
  epubStartPositionPercent: 12, epubEndPositionPercent: 25,
};
const resetDatabase = () =>
  new Promise((resolve, reject) => {
    const request = indexedDB.deleteDatabase("library-offline-reading");
    request.onsuccess = () => resolve();
    request.onerror = () => reject(request.error);
    request.onblocked = () => reject(new Error("Offline database is blocked"));
  });

beforeEach(async () => {
  vi.resetAllMocks();
  await resetDatabase();
});

describe("shared offline reading queue", () => {
  it("stores EPUB and legacy manual sessions separately without a schema migration", async () => {
    await enqueueOfflineManualSession({ userId: "reader", bookId: "book", session: manual });
    await enqueueOfflineEbookSession({ userId: "reader", bookId: "book", session: ebook });

    expect((await listOfflineManualSessions("reader")).map((r) => r.session))
      .toEqual([manual]);
    expect((await listOfflineEbookSessions("reader")).map((r) => r.session))
      .toEqual([ebook]);
    expect(await listOfflineReadingSessions("reader")).toHaveLength(2);
    expect(await listOfflineReadingSessions("other")).toHaveLength(0);
  });

  it("dispatches each session to its own endpoint and deletes only successful records", async () => {
    await enqueueOfflineManualSession({ userId: "reader", bookId: "book", session: manual });
    await enqueueOfflineEbookSession({ userId: "reader", bookId: "book", session: ebook });
    syncOfflineManualSession.mockResolvedValue({ alreadySynced: true });
    syncOfflineEbookSession.mockResolvedValue({ alreadySynced: false });

    const result = await syncQueuedOfflineReadingSessions("reader");
    expect(result).toEqual({ synced: 2, pending: 0, errors: [] });
    expect(syncOfflineManualSession).toHaveBeenCalledWith("book", manual);
    expect(syncOfflineEbookSession).toHaveBeenCalledWith("book", ebook);
    expect(await listOfflineReadingSessions("reader")).toHaveLength(0);
  });

  it("retains rejected EPUB uploads for later resolution and allows an idempotent retry", async () => {
    await enqueueOfflineEbookSession({ userId: "reader", bookId: "book", session: ebook });
    syncOfflineEbookSession.mockRejectedValueOnce(
      Object.assign(new Error("Overlapping reading session"), { status: 409 }),
    );
    const rejected = await syncQueuedOfflineManualSessions("reader");
    expect(rejected).toMatchObject({ synced: 0, pending: 1 });
    expect(rejected.errors[0].status).toBe(409);
    expect(await listOfflineEbookSessions("reader")).toHaveLength(1);

    syncOfflineEbookSession.mockResolvedValueOnce({ alreadySynced: true });
    expect(await syncQueuedOfflineReadingSessions("reader"))
      .toEqual({ synced: 1, pending: 0, errors: [] });
  });

  it("rejects wrong session types and conflicting client IDs without losing the record", async () => {
    expect(() => enqueueOfflineEbookSession({ userId: "reader", bookId: "book", session: manual }))
      .toThrow(/EBOOK\/PERCENT/);
    await enqueueOfflineEbookSession({ userId: "reader", bookId: "book", session: ebook });
    await expect(enqueueOfflineEbookSession({ userId: "reader", bookId: "book", session: ebook }))
      .resolves.toMatchObject({ kind: "EBOOK" });
    await expect(enqueueOfflineEbookSession({ userId: "reader", bookId: "book", session: {
      ...ebook, durationSeconds: 100,
    } })).rejects.toThrow(/different data/);
    await expect(enqueueOfflineManualSession({ userId: "reader", bookId: "book", session: {
      ...manual, clientSessionId: ebook.clientSessionId,
    } })).rejects.toThrow(/different data/);
    expect(await listOfflineEbookSessions("reader")).toHaveLength(1);
  });
});
