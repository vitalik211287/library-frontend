import { afterEach, beforeEach, expect, it, vi } from "vitest";
import {
  checkpointOfflineEbookDraft,
  clearOfflineEbookDraft,
  completeOfflineEbookDraft,
  getOfflineEbookElapsed,
  readOfflineEbookDraft,
  recordOfflineEbookAdvance,
  recordOfflineEbookPosition,
  recoverOfflineEbookDraft,
  setOfflineEbookPaused,
  startOfflineEbookDraft,
} from "./offlineEbookDraft.js";

const at = (seconds) => new Date(Date.UTC(2026, 9, 17, 10, 0, seconds));
const ID = "a7b82d34-0c5e-47ff-bff0-82aa55921ab2";
const start = () => startOfflineEbookDraft("reader", "book", "file", 10, at(0));

beforeEach(() => {
  localStorage.clear();
  vi.stubGlobal("crypto", { randomUUID: () => ID });
});
afterEach(() => vi.unstubAllGlobals());

it("creates an EBOOK/PERCENT draft scoped to user and book", () => {
  const draft = start();
  expect(draft.clientSessionId).toBe(ID);
  expect(draft.fileId).toBe("file");
  expect(readOfflineEbookDraft("reader", "book")).toMatchObject({
    source: "EBOOK", progressMode: "PERCENT", startPercent: 10,
  });
  expect(readOfflineEbookDraft("other", "book")).toBe(null);
  expect(() => start()).toThrow(/already exists/);
});

it("counts only foreground checkpoints and excludes time while paused", () => {
  start();
  checkpointOfflineEbookDraft("reader", "book", at(10));
  setOfflineEbookPaused("reader", "book", true, at(16));
  expect(getOfflineEbookElapsed(readOfflineEbookDraft("reader", "book"), at(45))).toBe(16);
  setOfflineEbookPaused("reader", "book", false, at(50));
  checkpointOfflineEbookDraft("reader", "book", at(59));
  expect(getOfflineEbookElapsed(readOfflineEbookDraft("reader", "book"), at(59))).toBe(25);
});

it("recovers a suspended PWA without counting a long background gap", () => {
  start();
  checkpointOfflineEbookDraft("reader", "book", at(10));
  const recovered = recoverOfflineEbookDraft("reader", "book", at(59));
  expect(recovered.accumulatedSeconds).toBe(10);
  expect(recovered.runningSince).toBe(null);
  expect(getOfflineEbookElapsed(recovered, at(59))).toBe(10);
});

it("keeps navigation separate from cumulative progress", () => {
  start();
  recordOfflineEbookPosition("reader", "book", 62);
  recordOfflineEbookAdvance("reader", "book", 1.3);
  recordOfflineEbookAdvance("reader", "book", 0.8);
  const updated = recordOfflineEbookPosition("reader", "book", 7);
  expect(updated.endPercent).toBe(12);
  expect(updated.epubStartPositionPercent).toBe(62);
  expect(updated.epubEndPositionPercent).toBe(7);
});

it("produces the exact server payload and retains the draft until enqueued", () => {
  start();
  recordOfflineEbookPosition("reader", "book", 40);
  recordOfflineEbookAdvance("reader", "book", 1.4);
  checkpointOfflineEbookDraft("reader", "book", at(10));
  setOfflineEbookPaused("reader", "book", true, at(11));
  const payload = completeOfflineEbookDraft("reader", "book", at(59));
  expect(payload).toEqual({
    source: "EBOOK", progressMode: "PERCENT", clientSessionId: ID,
    startedAt: at(0).toISOString(), finishedAt: at(59).toISOString(),
    startPercent: 10, endPercent: 11, durationSeconds: 11,
    epubStartPositionPercent: 40, epubEndPositionPercent: 40,
  });
  expect(readOfflineEbookDraft("reader", "book")).not.toBe(null);
  expect(() => clearOfflineEbookDraft("reader", "book", "another-id")).toThrow();
  clearOfflineEbookDraft("reader", "book", ID);
  expect(readOfflineEbookDraft("reader", "book")).toBe(null);
});

it("rejects invalid progress and refuses to complete a zero-time session", () => {
  start();
  expect(() => recordOfflineEbookAdvance("reader", "book", -1)).toThrow();
  expect(() => recordOfflineEbookPosition("reader", "book", 101)).toThrow();
  expect(() => completeOfflineEbookDraft("reader", "book", at(0))).toThrow();
});
