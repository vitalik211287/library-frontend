import { useCallback, useEffect, useRef, useState } from "react";

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
} from "../../../reading/offline/offlineEbookDraft.js";
import {
  enqueueOfflineEbookSession,
  syncQueuedOfflineReadingSessions,
} from "../../../reading/offline/offlineReadingQueue.js";

const clamp = (value) => Math.max(0, Math.min(100, Math.round(Number(value) || 0)));

/** A local-only timer for EPUBs opened from the cached copy.
 * Connected sessions stay exclusively owned by useEbookAutoSession. */
const useOfflineEbookSession = ({ enabled, userId, bookId, fileId, startPercent }) => {
  const [notice, setNotice] = useState("");
  const [tracking, setTracking] = useState(false);
  const activeRef = useRef(false);
  const finishingRef = useRef(null);

  // Offline session initialization must remain synchronous.
  /* eslint-disable react-hooks/set-state-in-effect -- Synchronous initialization is required for offline session ownership and timing. */
  useEffect(() => {
    activeRef.current = false;
    setTracking(false);
    setNotice("");
    if (!enabled || !userId || !bookId || !fileId) return undefined;

    try {
      const existing = readOfflineEbookDraft(userId, bookId);
      // The server would reject an overlapping imported session. In particular,
      // an interrupted heartbeat session must be recovered ONLINE, not duplicated.
      const onlinePrefix = `ebook-active-session:${userId}:${bookId}:`;
      const hasOnlineSession = Array.from({ length: localStorage.length }, (_, i) =>
        localStorage.key(i),
      ).some((key) => key?.startsWith(onlinePrefix) && !key.endsWith(":lease"));
      if (hasOnlineSession) {
        setNotice("Є незавершена онлайн-сесія. Офлайн-час не записується, щоб уникнути дублювання. Віднови її після підключення.");
        return undefined;
      }
      if (existing && existing.fileId !== fileId) {
        setNotice("Для цієї книги збережена офлайн-сесія іншого EPUB-файлу. Відкрий його для завершення читання.");
        return undefined;
      }
      if (existing) {
        recoverOfflineEbookDraft(userId, bookId);
      } else {
        startOfflineEbookDraft(userId, bookId, fileId, clamp(startPercent));
      }
      if (document.hidden) {
        setOfflineEbookPaused(userId, bookId, true);
      } else {
        setOfflineEbookPaused(userId, bookId, false);
      }
      activeRef.current = true;
      setTracking(true);
    } catch (error) {
      setNotice(error?.message || "Не вдалося запустити офлайн-облік EPUB");
      return undefined;
    }

    const guard = (action) => {
      if (!activeRef.current || finishingRef.current) return;
      try {
        action();
      } catch (error) {
        activeRef.current = false;
        setTracking(false);
        setNotice(error?.message || "Не вдалося зберегти офлайн-час EPUB");
      }
    };
    const checkpoint = () => guard(() => checkpointOfflineEbookDraft(userId, bookId));
    const onVisibility = () => guard(() => setOfflineEbookPaused(userId, bookId, document.hidden));
    const onPageHide = () => guard(() => setOfflineEbookPaused(userId, bookId, true));
    const timer = window.setInterval(checkpoint, 10000);
    document.addEventListener("visibilitychange", onVisibility);
    window.addEventListener("pagehide", onPageHide);
    return () => {
      window.clearInterval(timer);
      document.removeEventListener("visibilitychange", onVisibility);
      window.removeEventListener("pagehide", onPageHide);
      if (activeRef.current && !finishingRef.current) {
        try {
          setOfflineEbookPaused(userId, bookId, true);
        } catch (error) {
          console.warn("Could not pause offline EPUB on unmount", error);
        }
      }
      activeRef.current = false;
    };
  }, [enabled, userId, bookId, fileId, startPercent]);
  /* eslint-enable react-hooks/set-state-in-effect */

  const advance = useCallback((delta) => {
    if (!activeRef.current || finishingRef.current) return;
    try {
      recordOfflineEbookAdvance(userId, bookId, delta);
    } catch (error) {
      setNotice(error?.message || "Не вдалося зберегти прогрес EPUB");
    }
  }, [userId, bookId]);

  const position = useCallback((percent) => {
    if (!activeRef.current || finishingRef.current || !Number.isFinite(percent)) return;
    try {
      recordOfflineEbookPosition(userId, bookId, clamp(percent));
    } catch (error) {
      setNotice(error?.message || "Не вдалося зберегти позицію EPUB");
    }
  }, [userId, bookId]);

  const finish = useCallback((lastPosition) => {
    if (!activeRef.current) return Promise.resolve(true);
    if (finishingRef.current) return finishingRef.current;
    const job = (async () => {
      try {
        if (Number.isFinite(lastPosition)) {
          recordOfflineEbookPosition(userId, bookId, clamp(lastPosition));
        }
        const draft = readOfflineEbookDraft(userId, bookId);
        if (!draft) throw new Error("Не знайдено офлайн-сесію EPUB");
        if (getOfflineEbookElapsed(draft) < 1) {
          // Short visits remain resumable; never enqueue a zero-second session.
          return true;
        }
        const now = new Date();
        checkpointOfflineEbookDraft(userId, bookId, now);
        setOfflineEbookPaused(userId, bookId, true, now);
        const session = completeOfflineEbookDraft(userId, bookId, now);
        // Store durably first. If IndexedDB fails, the original draft survives.
        await enqueueOfflineEbookSession({ userId, bookId, session });
        clearOfflineEbookDraft(userId, bookId, session.clientSessionId);
        activeRef.current = false;
        setTracking(false);
        if (navigator.onLine !== false) {
          void syncQueuedOfflineReadingSessions(userId).catch((error) => {
            console.warn("Offline EPUB queued; sync will retry", error);
          });
        }
        return true;
      } catch (error) {
        try {
          setOfflineEbookPaused(userId, bookId, false);
        } catch { /* Preserve the draft for another retry. */ }
        setNotice(error?.message || "Не вдалося зберегти офлайн-сесію EPUB");
        return false;
      }
    })();
    finishingRef.current = job;
    void job.finally(() => {
      if (finishingRef.current === job) finishingRef.current = null;
    });
    return job;
  }, [userId, bookId]);

  return { tracking, notice, advance, position, finish };
};

export default useOfflineEbookSession;
