// Shared, pure timing rules for locally recorded reading sessions.
// Call checkpoint at least every 10 seconds while the reader is visible.
// If a browser was suspended, do not count the entire background gap as reading.
export const MAX_ACTIVE_GAP_SECONDS = 30;

export const getOfflineReadingElapsed = (draft, now = new Date()) => {
  if (!draft.runningSince) return draft.accumulatedSeconds;
  const gap = Math.floor((now.getTime() - Date.parse(draft.runningSince)) / 1000);
  return draft.accumulatedSeconds + (
    Number.isFinite(gap) && gap >= 0 && gap <= MAX_ACTIVE_GAP_SECONDS ? gap : 0
  );
};

export const checkpointOfflineReadingClock = (draft, now = new Date()) => {
  if (!draft.runningSince) return draft;
  const gap = (now.getTime() - Date.parse(draft.runningSince)) / 1000;
  const interrupted = !Number.isFinite(gap) || gap < 0 || gap > MAX_ACTIVE_GAP_SECONDS;
  return {
    ...draft,
    accumulatedSeconds: draft.accumulatedSeconds + (interrupted ? 0 : Math.floor(gap)),
    runningSince: interrupted ? null : now.toISOString(),
  };
};

export const setOfflineReadingClockPaused = (draft, paused, now = new Date()) => {
  if (paused ? !draft.runningSince : Boolean(draft.runningSince)) return draft;
  return {
    ...draft,
    accumulatedSeconds: getOfflineReadingElapsed(draft, now),
    runningSince: paused ? null : now.toISOString(),
  };
};
