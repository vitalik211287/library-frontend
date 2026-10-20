import {
  checkpointOfflineReadingClock,
  getOfflineReadingElapsed,
  setOfflineReadingClockPaused,
} from "./offlineReadingClock.js";

// This is an unfinished session, NOT the completed-session IndexedDB queue.
// The EPUB file itself lives in the separate library-offline-epubs IndexedDB.
const PREFIX = "library:offline-ebook-draft:v1:";
const UUID_V4 = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const MAX_SESSION_SECONDS = 12 * 60 * 60;

const requireId = (value) => {
  if (typeof value !== "string" || !value.trim()) {
    throw new Error("Missing EPUB draft identity");
  }
  return value;
};
const keyFor = (userId, bookId) =>
  PREFIX + JSON.stringify([requireId(userId), requireId(bookId)]);
const validPercent = (value) =>
  Number.isSafeInteger(value) && value >= 0 && value <= 100;
const validPosition = (value) => value === null || validPercent(value);
const validTimestamp = (value) =>
  typeof value === "string" && Number.isFinite(Date.parse(value));

const isValidDraft = (draft, userId, bookId) =>
  draft?.userId === userId &&
  draft?.bookId === bookId &&
  typeof draft.fileId === "string" && draft.fileId.length > 0 &&
  draft.source === "EBOOK" && draft.progressMode === "PERCENT" &&
  typeof draft.clientSessionId === "string" && UUID_V4.test(draft.clientSessionId) &&
  validTimestamp(draft.startedAt) &&
  (draft.runningSince === null || validTimestamp(draft.runningSince)) &&
  Number.isSafeInteger(draft.accumulatedSeconds) &&
  draft.accumulatedSeconds >= 0 && draft.accumulatedSeconds <= MAX_SESSION_SECONDS &&
  validPercent(draft.startPercent) && validPercent(draft.endPercent) &&
  draft.endPercent >= draft.startPercent &&
  typeof draft.advancedPercent === "number" &&
  Number.isFinite(draft.advancedPercent) &&
  draft.advancedPercent >= 0 && draft.advancedPercent <= 100 &&
  validPosition(draft.epubStartPositionPercent) &&
  validPosition(draft.epubEndPositionPercent);

export const readOfflineEbookDraft = (userId, bookId) => {
  const json = localStorage.getItem(keyFor(userId, bookId));
  if (!json) return null;
  try {
    const draft = JSON.parse(json);
    return isValidDraft(draft, userId, bookId) ? draft : null;
  } catch {
    return null;
  }
};

const saveDraft = (draft) => {
  localStorage.setItem(keyFor(draft.userId, draft.bookId), JSON.stringify(draft));
  return draft;
};
const requireDraft = (userId, bookId) => {
  const draft = readOfflineEbookDraft(userId, bookId);
  if (!draft) throw new Error("Offline EPUB draft not found");
  return draft;
};

export const startOfflineEbookDraft = (
  userId, bookId, fileId, startPercent, now = new Date(),
) => {
  requireId(fileId);
  if (!validPercent(startPercent)) throw new Error("Invalid EPUB start percentage");
  if (readOfflineEbookDraft(userId, bookId)) {
    throw new Error("An unfinished EPUB session already exists for this book");
  }
  if (typeof crypto?.randomUUID !== "function") {
    throw new Error("Secure UUID generation unavailable");
  }
  const timestamp = now.toISOString();
  return saveDraft({
    userId, bookId, fileId,
    source: "EBOOK", progressMode: "PERCENT",
    clientSessionId: crypto.randomUUID(),
    startedAt: timestamp,
    accumulatedSeconds: 0, runningSince: timestamp,
    startPercent, endPercent: startPercent,
    advancedPercent: 0,
    epubStartPositionPercent: null, epubEndPositionPercent: null,
  });
};

export const checkpointOfflineEbookDraft = (userId, bookId, now = new Date()) =>
  saveDraft(checkpointOfflineReadingClock(requireDraft(userId, bookId), now));

// A stale foreground timestamp is paused on reopening, not resumed silently.
export const recoverOfflineEbookDraft = (userId, bookId, now = new Date()) =>
  checkpointOfflineEbookDraft(userId, bookId, now);

export const setOfflineEbookPaused = (userId, bookId, paused, now = new Date()) =>
  saveDraft(setOfflineReadingClockPaused(requireDraft(userId, bookId), paused, now));

export const getOfflineEbookElapsed = (draft, now = new Date()) =>
  getOfflineReadingElapsed(draft, now);

// Only genuine forward page-turns count towards cumulative reading progress.
// Navigation is stored separately, so seeking backwards never rewinds progress.
export const recordOfflineEbookAdvance = (userId, bookId, deltaPercent) => {
  if (typeof deltaPercent !== "number" || !Number.isFinite(deltaPercent) ||
      deltaPercent < 0 || deltaPercent > 100) {
    throw new Error("Invalid EPUB reading advance");
  }
  const draft = requireDraft(userId, bookId);
  const advancedPercent = Math.min(100 - draft.startPercent,
    draft.advancedPercent + deltaPercent);
  return saveDraft({
    ...draft,
    advancedPercent,
    endPercent: Math.max(draft.endPercent,
      Math.min(100, Math.round(draft.startPercent + advancedPercent))),
  });
};

export const recordOfflineEbookPosition = (userId, bookId, positionPercent) => {
  if (!validPercent(positionPercent)) throw new Error("Invalid EPUB position");
  const draft = requireDraft(userId, bookId);
  return saveDraft({
    ...draft,
    epubStartPositionPercent: draft.epubStartPositionPercent ?? positionPercent,
    epubEndPositionPercent: positionPercent,
  });
};

// Does not delete the draft. The caller must enqueue the resulting payload
// durably in IndexedDB BEFORE clearOfflineEbookDraft is called.
export const completeOfflineEbookDraft = (userId, bookId, now = new Date()) => {
  const draft = requireDraft(userId, bookId);
  const durationSeconds = getOfflineEbookElapsed(draft, now);
  const elapsedSeconds = (now.getTime() - Date.parse(draft.startedAt)) / 1000;
  if (!Number.isSafeInteger(durationSeconds) || durationSeconds < 1 ||
      durationSeconds > MAX_SESSION_SECONDS || durationSeconds > Math.ceil(elapsedSeconds)) {
    throw new Error("Offline EPUB duration must be between 1 second and 12 hours");
  }
  return {
    source: "EBOOK", progressMode: "PERCENT",
    clientSessionId: draft.clientSessionId,
    startedAt: draft.startedAt, finishedAt: now.toISOString(),
    startPercent: draft.startPercent, endPercent: draft.endPercent,
    durationSeconds,
    ...(draft.epubStartPositionPercent !== null && {
      epubStartPositionPercent: draft.epubStartPositionPercent,
    }),
    ...(draft.epubEndPositionPercent !== null && {
      epubEndPositionPercent: draft.epubEndPositionPercent,
    }),
  };
};

export const clearOfflineEbookDraft = (userId, bookId, clientSessionId) => {
  const draft = requireDraft(userId, bookId);
  if (draft.clientSessionId !== clientSessionId) {
    throw new Error("Offline EPUB draft changed; refusing to clear");
  }
  localStorage.removeItem(keyFor(userId, bookId));
};
