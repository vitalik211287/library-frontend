import { act, cleanup, renderHook } from "@testing-library/react";
import { afterEach, beforeEach, expect, it, vi } from "vitest";

vi.mock("../../../reading/offline/offlineReadingQueue.js", () => ({
  enqueueOfflineEbookSession: vi.fn(),
  syncQueuedOfflineReadingSessions: vi.fn(),
}));

import {
  enqueueOfflineEbookSession,
  syncQueuedOfflineReadingSessions,
} from "../../../reading/offline/offlineReadingQueue.js";
import {
  getOfflineEbookElapsed,
  readOfflineEbookDraft,
} from "../../../reading/offline/offlineEbookDraft.js";
import useOfflineEbookSession from "./useOfflineEbookSession.js";

const NOW = "2026-10-17T10:00:00.000Z";
const UUID = "a7b82d34-0c5e-47ff-bff0-82aa55921ab2";
const args = { enabled: true, userId: "u", bookId: "b", fileId: "f", startPercent: 12 };

beforeEach(() => {
  localStorage.clear();
  vi.resetAllMocks();
  vi.useFakeTimers();
  vi.setSystemTime(new Date(NOW));
  vi.stubGlobal("crypto", { randomUUID: () => UUID });
  enqueueOfflineEbookSession.mockResolvedValue(undefined);
  syncQueuedOfflineReadingSessions.mockResolvedValue({ synced: 1, pending: 0, errors: [] });
});
afterEach(() => {
  cleanup();
  vi.unstubAllGlobals();
  vi.useRealTimers();
});

it("starts local time, records page turns and safely queues on close", async () => {
  const { result } = renderHook(() => useOfflineEbookSession(args));
  expect(result.current.tracking).toBe(true);
  act(() => {
    vi.advanceTimersByTime(10000);
    result.current.position(61);
    result.current.advance(1.9);
    result.current.position(5);
  });
  expect(getOfflineEbookElapsed(readOfflineEbookDraft("u", "b"))).toBe(10);
  let closed;
  await act(async () => { closed = await result.current.finish(6); });
  expect(closed).toBe(true);
  expect(enqueueOfflineEbookSession).toHaveBeenCalledWith({
    userId: "u", bookId: "b",
    session: expect.objectContaining({
      source: "EBOOK", progressMode: "PERCENT",
      startPercent: 12, endPercent: 14, durationSeconds: 10,
      epubStartPositionPercent: 61, epubEndPositionPercent: 6,
      clientSessionId: UUID,
    }),
  });
  expect(readOfflineEbookDraft("u", "b")).toBe(null);
});

it("refuses a second offline session while an online one is unresolved", () => {
  localStorage.setItem("ebook-active-session:u:b:another-file", "server-id");
  const { result } = renderHook(() => useOfflineEbookSession(args));
  expect(result.current.tracking).toBe(false);
  expect(result.current.notice).toMatch(/онлайн-сесія/);
  expect(readOfflineEbookDraft("u", "b")).toBe(null);
  expect(enqueueOfflineEbookSession).not.toHaveBeenCalled();
});

it("pauses on hidden and never counts time spent in the background", async () => {
  const hidden = vi.spyOn(document, "hidden", "get");
  hidden.mockReturnValue(false);
  const { result } = renderHook(() => useOfflineEbookSession(args));
  act(() => vi.advanceTimersByTime(10000));
  hidden.mockReturnValue(true);
  act(() => document.dispatchEvent(new Event("visibilitychange")));
  act(() => vi.advanceTimersByTime(60000));
  hidden.mockReturnValue(false);
  act(() => document.dispatchEvent(new Event("visibilitychange")));
  act(() => vi.advanceTimersByTime(10000));
  expect(getOfflineEbookElapsed(readOfflineEbookDraft("u", "b"))).toBe(20);
  await act(async () => { await result.current.finish(); });
  expect(enqueueOfflineEbookSession.mock.calls[0][0].session.durationSeconds).toBe(20);
  hidden.mockRestore();
});

it("keeps the draft if IndexedDB enqueue fails and allows retry", async () => {
  enqueueOfflineEbookSession.mockRejectedValueOnce(new Error("IndexedDB unavailable"));
  const { result } = renderHook(() => useOfflineEbookSession(args));
  act(() => vi.advanceTimersByTime(10000));
  let closed;
  await act(async () => { closed = await result.current.finish(); });
  expect(closed).toBe(false);
  expect(readOfflineEbookDraft("u", "b")).not.toBe(null);
  await act(async () => { closed = await result.current.finish(); });
  expect(closed).toBe(true);
  expect(readOfflineEbookDraft("u", "b")).toBe(null);
});
