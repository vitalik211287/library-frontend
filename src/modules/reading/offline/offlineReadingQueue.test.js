import "fake-indexeddb/auto";
import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("../components/ReadingModal/api/readingSessionApi.js", () => ({
  syncOfflineManualSession: vi.fn(),
}));

import { syncOfflineManualSession } from "../components/ReadingModal/api/readingSessionApi.js";
import {
  enqueueOfflineManualSession,
  listOfflineManualSessions,
  syncQueuedOfflineManualSessions,
} from "./offlineReadingQueue.js";

const makeSession = (clientSessionId = "11111111-1111-4111-8111-111111111111") => ({
  clientSessionId,
  startedAt: "2026-10-13T10:00:00.000Z",
  finishedAt: "2026-10-13T10:30:00.000Z",
  startPage: 12,
  endPage: 24,
  durationSeconds: 1800,
});

const add = (userId = "user-a", session = makeSession(), bookId = "book-1") =>
  enqueueOfflineManualSession({ userId, bookId, session });

const resetDatabase = () =>
  new Promise((resolve, reject) => {
    const request = indexedDB.deleteDatabase("library-offline-reading");
    request.onsuccess = () => resolve();
    request.onerror = () => reject(request.error);
    request.onblocked = () => reject(new Error("Offline test database is blocked"));
  });

beforeEach(async () => {
  vi.resetAllMocks();
  await resetDatabase();
});

describe("offline manual reading queue", () => {
  it("persists a completed session across separate database openings", async () => {
    await add();
    const firstRead = await listOfflineManualSessions("user-a");
    const secondRead = await listOfflineManualSessions("user-a");

    expect(firstRead).toHaveLength(1);
    expect(secondRead[0].session).toEqual(makeSession());
    expect(secondRead[0].bookId).toBe("book-1");
  });

  it("does not enqueue the same session twice and rejects conflicting data", async () => {
    await add();
    await add();
    expect(await listOfflineManualSessions("user-a")).toHaveLength(1);

    await expect(add("user-a", { ...makeSession(), endPage: 25 }))
      .rejects.toThrow("different data");
    expect(await listOfflineManualSessions("user-a")).toHaveLength(1);
  });

  it("keeps each user's sessions separate", async () => {
    await add("user-a");
    await add("user-b", makeSession(), "book-2");

    expect((await listOfflineManualSessions("user-a")).map((r) => r.bookId))
      .toEqual(["book-1"]);
    expect((await listOfflineManualSessions("user-b")).map((r) => r.bookId))
      .toEqual(["book-2"]);
  });

  it("removes a session after a successful or idempotent server response", async () => {
    await add();
    syncOfflineManualSession.mockResolvedValue({ alreadySynced: true });

    expect(await syncQueuedOfflineManualSessions("user-a"))
      .toEqual({ synced: 1, pending: 0, errors: [] });
    expect(syncOfflineManualSession).toHaveBeenCalledWith("book-1", makeSession());
    expect(await listOfflineManualSessions("user-a")).toHaveLength(0);
    expect(await syncQueuedOfflineManualSessions("user-a"))
      .toEqual({ synced: 0, pending: 0, errors: [] });
    expect(syncOfflineManualSession).toHaveBeenCalledTimes(1);
  });

  it("preserves a conflicting session after HTTP 409", async () => {
    await add();
    syncOfflineManualSession.mockRejectedValue(
      Object.assign(new Error("Overlapping reading session"), { status: 409 }),
    );

    const result = await syncQueuedOfflineManualSessions("user-a");
    expect(result.synced).toBe(0);
    expect(result.pending).toBe(1);
    expect(result.errors[0]).toMatchObject({
      clientSessionId: makeSession().clientSessionId,
      status: 409,
    });
    expect(await listOfflineManualSessions("user-a")).toHaveLength(1);
  });

  it("keeps pending sessions after a network failure and retries later", async () => {
    await add();
    syncOfflineManualSession.mockRejectedValueOnce(new TypeError("Failed to fetch"));
    const failed = await syncQueuedOfflineManualSessions("user-a");
    expect(failed.pending).toBe(1);
    expect(failed.errors[0].status).toBeNull();

    syncOfflineManualSession.mockResolvedValueOnce({ alreadySynced: false });
    const retried = await syncQueuedOfflineManualSessions("user-a");
    expect(retried.synced).toBe(1);
    expect(retried.pending).toBe(0);
  });
  it("coalesces concurrent sync attempts in the same tab", async () => {
    await add();
    let complete;
    syncOfflineManualSession.mockImplementation(() => new Promise((resolve) => {
      complete = resolve;
    }));
    const first = syncQueuedOfflineManualSessions("user-a");
    const second = syncQueuedOfflineManualSessions("user-a");
    expect(second).toBe(first);
    await vi.waitFor(() => expect(syncOfflineManualSession).toHaveBeenCalledTimes(1));
    complete({ alreadySynced: false });
    expect((await first).pending).toBe(0);
    expect(await second).toEqual({ synced: 1, pending: 0, errors: [] });
  });
});
