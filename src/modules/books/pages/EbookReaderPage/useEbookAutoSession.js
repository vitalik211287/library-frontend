import { useCallback, useEffect, useRef, useState } from "react";
import { apiFetch } from "../../../../shared/api/apiClient.js";

import {
  finishReadingSession,
  getActiveReadingSession,
  pauseReadingSession,
  resumeReadingSession,
  startReadingSession,
} from "../../../reading/components/ReadingModal/api/readingSessionApi.js";

const clamp = (n) => Math.max(0, Math.min(100, Math.round(n)));

/** Uses the SAME user-book sessions and statistics as the manual reading modal. */
const useEbookAutoSession = ({ bookId, fileId, userId, ready, initialPercent, finished, percent, onSaved }) => {
  const [notice, setNotice] = useState("");
  const sessionRef = useRef(null);
  const ownedRef = useRef(false);
  const closedRef = useRef(false);
  const initializingRef = useRef(null);
  const pendingRef = useRef(Promise.resolve());
  const progressRef = useRef(clamp(initialPercent || 0));
  const startRef = useRef(clamp(initialPercent || 0));
  const onSavedRef = useRef(onSaved);
  onSavedRef.current = onSaved;

  const ownershipKey = `ebook-active-session:${userId || "unknown"}:${bookId}:${fileId}`;

  if (Number.isFinite(percent)) {
    progressRef.current = Math.max(progressRef.current, clamp(percent));
  }

  const queue = useCallback((action) => {
    const request = pendingRef.current.catch(() => {}).then(action);
    pendingRef.current = request;
    return request;
  }, []);

  const init = useCallback(() => {
    if (!ready || !userId || finished || closedRef.current || initializingRef.current) {
      return initializingRef.current || Promise.resolve();
    }

    initializingRef.current = (async () => {
      try {
        const { session: active } = await getActiveReadingSession(bookId);
        if (closedRef.current) return;

        if (active) {
          if (active.id !== localStorage.getItem(ownershipKey) || active.progressMode !== "PERCENT") {
            setNotice("Існує інша активна сесія цієї книги. Автоматичний облік вимкнено, щоб не дублювати статистику.");
            return;
          }
          sessionRef.current = active;
          ownedRef.current = true;
          startRef.current = clamp(active.startPercent ?? 0);
          progressRef.current = Math.max(startRef.current, progressRef.current);
          if (active.pausedAt && !document.hidden) {
            await queue(async () => {
              const response = await resumeReadingSession(bookId);
              sessionRef.current = response.session;
            });
          }
          return;
        }

        if (document.hidden) return;
        const start = clamp(initialPercent || 0);
        const response = await startReadingSession(bookId, {
          progressMode: "PERCENT",
          startPercent: start,
          source: "EBOOK",
        });
        sessionRef.current = response.session;
        ownedRef.current = true;
        startRef.current = start;
        progressRef.current = Math.max(start, progressRef.current);
        localStorage.setItem(ownershipKey, response.session.id);
      } catch (error) {
        setNotice(error?.message || "Не вдалося запустити облік часу читання");
      }
    })().finally(() => {
      initializingRef.current = null;
    });

    return initializingRef.current;
  }, [ready, userId, finished, bookId, ownershipKey, initialPercent, queue]);

  useEffect(() => {
    if (ready && !finished) void init();
  }, [ready, finished, init]);

  const pause = useCallback(() => queue(async () => {
    if (!ownedRef.current || !sessionRef.current || sessionRef.current.pausedAt || closedRef.current) return;
    try {
      const response = await pauseReadingSession(bookId);
      sessionRef.current = response.session;
    } catch (error) {
      console.warn("Unable to pause ebook reading session", error);
    }
  }), [bookId, queue]);

  const resume = useCallback(() => queue(async () => {
    if (!ownedRef.current || !sessionRef.current || !sessionRef.current.pausedAt || closedRef.current) return;
    try {
      const response = await resumeReadingSession(bookId);
      sessionRef.current = response.session;
    } catch (error) {
      console.warn("Unable to resume ebook reading session", error);
    }
  }), [bookId, queue]);

  useEffect(() => {
    const handleVisibility = () => {
      if (document.hidden) {
        void pause();
      } else if (ownedRef.current) {
        void resume();
      } else if (ready && !finished) {
        void init();
      }
    };
    // Best effort: mobile browsers may terminate a background tab without unmounting React.
    const handlePageHide = () => {
      if (!closedRef.current && ownedRef.current && sessionRef.current && !sessionRef.current.pausedAt) {
        // Best effort when the browser suspends the page before queued React work runs.
        void apiFetch(`/api/user-books/${encodeURIComponent(bookId)}/reading/pause`, {
          method: "POST", keepalive: true,
        }).catch(() => {});
      }
    };
    document.addEventListener("visibilitychange", handleVisibility);
    window.addEventListener("pagehide", handlePageHide);
    return () => {
      document.removeEventListener("visibilitychange", handleVisibility);
      window.removeEventListener("pagehide", handlePageHide);
      if (!closedRef.current && ownedRef.current && !sessionRef.current?.pausedAt) void pause();
    };
  }, [pause, resume, ready, finished, init]);

  const finish = useCallback(async (position = {}) => {
    if (closedRef.current) return false;
    closedRef.current = true;
    try {
      await initializingRef.current;
      await pendingRef.current.catch(() => {});
      if (ownedRef.current && sessionRef.current) {
        const endPercent = Math.max(startRef.current, progressRef.current);
        await finishReadingSession(bookId, {
          endPercent,
          ...(position.epubStartPositionPercent !== undefined && {
            epubStartPositionPercent: position.epubStartPositionPercent,
          }),
          ...(position.epubEndPositionPercent !== undefined && {
            epubEndPositionPercent: position.epubEndPositionPercent,
          }),
        });
        ownedRef.current = false;
        sessionRef.current = null;
        localStorage.removeItem(ownershipKey);
        try {
          await onSavedRef.current?.();
        } catch (error) {
          console.warn("Reading statistics refresh failed after saving session", error);
        }
      }
      return true;
    } catch (error) {
      setNotice(error?.message || "Не вдалося зберегти сесію — спробуйте закрити ще раз");
      return false;
    } finally {
      closedRef.current = false;
    }
  }, [bookId, ownershipKey]);

  return { finish, notice };
};

export default useEbookAutoSession;
