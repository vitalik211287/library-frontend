// An unfinished offline session is kept separately from the completed-session queue.
// A draft is never sent to the server until the reader explicitly finishes it.
const PREFIX = "library:offline-manual-draft:v1:";
// The UI should checkpoint at least every 10 seconds while the reader is active.
// A long gap is treated as suspended activity, not as reading time.
const MAX_ACTIVE_GAP_SECONDS = 30;

const keyFor = (userId, bookId) => {
  if (!userId || !bookId || typeof userId !== "string" || typeof bookId !== "string") {
    throw new Error("Missing offline draft identity");
  }
  return PREFIX + JSON.stringify([userId, bookId]);
};

export const readOfflineManualDraft = (userId, bookId) => {
  const value = localStorage.getItem(keyFor(userId, bookId));
  if (!value) return null;
  try {
    const draft = JSON.parse(value);
    if (
      draft?.userId !== userId ||
      draft?.bookId !== bookId ||
      draft?.progressMode !== "PAGES" ||
      !/^[0-9a-f-]{36}$/i.test(draft.clientSessionId) ||
      !Number.isSafeInteger(draft.startPage) ||
      draft.startPage < 0 ||
      !Number.isFinite(Date.parse(draft.startedAt)) ||
      !Number.isSafeInteger(draft.accumulatedSeconds) ||
      draft.accumulatedSeconds < 0 ||
      (draft.runningSince !== null && !Number.isFinite(Date.parse(draft.runningSince)))
    ) return null;
    return draft;
  } catch {
    return null;
  }
};

export const startOfflineManualDraft = (userId, bookId, startPage, now = new Date()) => {
  if (!Number.isSafeInteger(startPage) || startPage < 0) {
    throw new Error("Invalid offline start page");
  }
  if (readOfflineManualDraft(userId, bookId)) {
    throw new Error("An unfinished offline session already exists");
  }
  if (typeof crypto?.randomUUID !== "function") {
    throw new Error("Secure UUID generation unavailable");
  }
  const timestamp = now.toISOString();
  const draft = {
    userId, bookId, clientSessionId: crypto.randomUUID(),
    progressMode: "PAGES", startPage, startedAt: timestamp,
    accumulatedSeconds: 0, runningSince: timestamp,
  };
  localStorage.setItem(keyFor(userId, bookId), JSON.stringify(draft));
  return draft;
};

const activeSeconds = (draft, now) => {
  if (!draft.runningSince) return 0;
  const gap = Math.floor((now.getTime() - Date.parse(draft.runningSince)) / 1000);
  return gap >= 0 && gap <= MAX_ACTIVE_GAP_SECONDS ? gap : 0;
};

export const getOfflineManualElapsed = (draft, now = new Date()) =>
  draft.accumulatedSeconds + activeSeconds(draft, now);

/** Persist a reading-time checkpoint. If the tab was suspended, stop the timer. */
export const checkpointOfflineManualDraft = (userId, bookId, now = new Date()) => {
  const draft = readOfflineManualDraft(userId, bookId);
  if (!draft) throw new Error("Offline draft not found");
  if (!draft.runningSince) return draft;
  const gap = (now.getTime() - Date.parse(draft.runningSince)) / 1000;
  const interrupted = !Number.isFinite(gap) || gap < 0 || gap > MAX_ACTIVE_GAP_SECONDS;
  const next = {
    ...draft,
    accumulatedSeconds: draft.accumulatedSeconds + (interrupted ? 0 : Math.floor(gap)),
    runningSince: interrupted ? null : now.toISOString(),
  };
  localStorage.setItem(keyFor(userId, bookId), JSON.stringify(next));
  return next;
};

/** Called when the app reopens; stale sessions remain paused until user resumes. */
export const recoverOfflineManualDraft = (userId, bookId, now = new Date()) =>
  checkpointOfflineManualDraft(userId, bookId, now);

export const setOfflineManualPaused = (userId, bookId, paused, now = new Date()) => {
  const draft = readOfflineManualDraft(userId, bookId);
  if (!draft) throw new Error("Offline draft not found");
  if (paused && !draft.runningSince) return draft;
  if (!paused && draft.runningSince) return draft;
  const next = {
    ...draft,
    accumulatedSeconds: getOfflineManualElapsed(draft, now),
    runningSince: paused ? null : now.toISOString(),
  };
  localStorage.setItem(keyFor(userId, bookId), JSON.stringify(next));
  return next;
};

export const completeOfflineManualDraft = (userId, bookId, endPage, now = new Date()) => {
  const draft = readOfflineManualDraft(userId, bookId);
  if (!draft) throw new Error("Offline draft not found");
  if (!Number.isSafeInteger(endPage) || endPage < draft.startPage) {
    throw new Error("Invalid offline end page");
  }
  const durationSeconds = getOfflineManualElapsed(draft, now);
  if (durationSeconds < 1 || durationSeconds > 12 * 60 * 60) {
    throw new Error("Offline duration must be between 1 second and 12 hours");
  }
  const session = {
    clientSessionId: draft.clientSessionId,
    startedAt: draft.startedAt,
    finishedAt: now.toISOString(),
    startPage: draft.startPage,
    endPage,
    durationSeconds,
  };
  // Caller must enqueue successfully BEFORE clearing this draft.
  return session;
};

export const clearOfflineManualDraft = (userId, bookId, clientSessionId) => {
  const draft = readOfflineManualDraft(userId, bookId);
  if (!draft || draft.clientSessionId !== clientSessionId) {
    throw new Error("Offline draft changed; refusing to clear");
  }
  localStorage.removeItem(keyFor(userId, bookId));
};
