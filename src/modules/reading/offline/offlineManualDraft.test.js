import { beforeEach, describe, expect, it, vi } from "vitest";
import {
  clearOfflineManualDraft, completeOfflineManualDraft, getOfflineManualElapsed,
  checkpointOfflineManualDraft, recoverOfflineManualDraft,
  readOfflineManualDraft, setOfflineManualPaused, startOfflineManualDraft,
} from "./offlineManualDraft.js";

beforeEach(() => {
  localStorage.clear();
  vi.stubGlobal("crypto", { randomUUID: () => "11111111-1111-4111-8111-111111111111" });
});
const at = (seconds) => new Date(1770000000000 + seconds * 1000);

describe("unfinished offline reading draft", () => {
  it("persists and restores independently by user and book", () => {
    startOfflineManualDraft("alice", "book-1", 10, at(0));
    expect(readOfflineManualDraft("alice", "book-1")?.startPage).toBe(10);
    expect(readOfflineManualDraft("bob", "book-1")).toBeNull();
    expect(readOfflineManualDraft("alice", "book-2")).toBeNull();
  });
  it("rejects overwriting an unfinished session", () => {
    startOfflineManualDraft("alice", "book-1", 10, at(0));
    expect(() => startOfflineManualDraft("alice", "book-1", 15, at(2))).toThrow();
  });
  it("subtracts paused time", () => {
    startOfflineManualDraft("alice", "book-1", 10, at(0));
    setOfflineManualPaused("alice", "book-1", true, at(20));
    expect(getOfflineManualElapsed(readOfflineManualDraft("alice", "book-1"), at(70))).toBe(20);
    setOfflineManualPaused("alice", "book-1", false, at(70));
    expect(getOfflineManualElapsed(readOfflineManualDraft("alice", "book-1"), at(85))).toBe(35);
  });
  it("builds a compatible payload but keeps the draft until explicitly cleared", () => {
    startOfflineManualDraft("alice", "book-1", 10, at(0));
    const session = completeOfflineManualDraft("alice", "book-1", 20, at(30));
    expect(session).toMatchObject({ startPage: 10, endPage: 20, durationSeconds: 30 });
    expect(readOfflineManualDraft("alice", "book-1")).not.toBeNull();
    clearOfflineManualDraft("alice", "book-1", session.clientSessionId);
    expect(readOfflineManualDraft("alice", "book-1")).toBeNull();
  });
  it("credits regular checkpoints without counting a long suspension", () => {
    startOfflineManualDraft("alice", "book-1", 10, at(0));
    checkpointOfflineManualDraft("alice", "book-1", at(10));
    checkpointOfflineManualDraft("alice", "book-1", at(20));
    const recovered = recoverOfflineManualDraft("alice", "book-1", at(3600));
    expect(recovered.runningSince).toBeNull();
    expect(recovered.accumulatedSeconds).toBe(20);
    setOfflineManualPaused("alice", "book-1", false, at(3610));
    expect(completeOfflineManualDraft("alice", "book-1", 20, at(3620)).durationSeconds).toBe(30);
  });
  it("does not count a long inactivity gap when finishing without checkpoints", () => {
    startOfflineManualDraft("alice", "book-1", 10, at(0));
    expect(() => completeOfflineManualDraft("alice", "book-1", 20, at(3600))).toThrow();
    expect(readOfflineManualDraft("alice", "book-1")).not.toBeNull();
  });
  it("rejects invalid or interrupted sessions without losing the draft", () => {
    startOfflineManualDraft("alice", "book-1", 10, at(0));
    expect(() => completeOfflineManualDraft("alice", "book-1", 9, at(30))).toThrow();
    expect(() => completeOfflineManualDraft("alice", "book-1", 20, at(13 * 3600))).toThrow();
    expect(readOfflineManualDraft("alice", "book-1")).not.toBeNull();
  });
});
