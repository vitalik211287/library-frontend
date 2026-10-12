import { useCallback, useEffect, useRef, useState } from "react";
import { apiFetch } from "../../../../shared/api/apiClient.js";

import {
  finishReadingSession,
  claimEbookReadingSession,
  heartbeatReadingSession,
  getActiveReadingSession,
  pauseReadingSession,
  resumeReadingSession,
  startReadingSession,
} from "../../../reading/components/ReadingModal/api/readingSessionApi.js";

const clamp = (n) => Math.max(0, Math.min(100, Math.round(n)));

const isReaderLeaseRejection = (error) =>
  /ownership has changed|reader lease|heartbeat-enabled EPUB session|heartbeat conflict/i.test(
    String(error?.message ?? ""),
  );

/** Uses the SAME user-book sessions and statistics as the manual reading modal. */
const useEbookAutoSession = ({ bookId, fileId, userId, ready, initialPercent, finished, percent, onSaved }) => {
  const [notice, setNotice] = useState("");
  const [recoveryCandidate, setRecoveryCandidate] = useState(null);
  const [isRecovering, setIsRecovering] = useState(false);
  const recoveringRef = useRef(false);
  const sessionRef = useRef(null);
  const readerLeaseRef = useRef(null);
  const ownershipRevokedRef = useRef(false);
  const ownedRef = useRef(false);
  const closedRef = useRef(false);
  const initializingRef = useRef(null);
  const pendingRef = useRef(Promise.resolve());
  const heartbeatInFlightRef = useRef(false);
  const progressRef = useRef(clamp(initialPercent || 0));
  const startRef = useRef(clamp(initialPercent || 0));
  const onSavedRef = useRef(onSaved);
  onSavedRef.current = onSaved;

  const ownershipKey = `ebook-active-session:${userId || "unknown"}:${bookId}:${fileId}`;
  const leaseKey = `${ownershipKey}:lease`;

  if (Number.isFinite(percent)) {
    progressRef.current = Math.max(progressRef.current, clamp(percent));
  }

  const queue = useCallback((action) => {
    const request = pendingRef.current.catch(() => {}).then(action);
    pendingRef.current = request;
    return request;
  }, []);

  const revokeOwnership = useCallback(() => {
    if (ownershipRevokedRef.current) return;

    ownershipRevokedRef.current = true;
    ownedRef.current = false;
    sessionRef.current = null;
    readerLeaseRef.current = null;

    sessionStorage.removeItem(leaseKey);
    setRecoveryCandidate(null);

    setNotice(
      "\u0421\u0435\u0441\u0456\u0454\u044e \u043a\u0435\u0440\u0443\u0454 \u0456\u043d\u0448\u0430 \u0432\u043a\u043b\u0430\u0434\u043a\u0430 \u0430\u0431\u043e \u043f\u0440\u0438\u0441\u0442\u0440\u0456\u0439. \u041e\u0431\u043b\u0456\u043a \u0447\u0430\u0441\u0443 \u0442\u0443\u0442 \u0437\u0443\u043f\u0438\u043d\u0435\u043d\u043e."
    );
  }, [leaseKey]);

  const init = useCallback(() => {
    if (!ready || !userId || finished || closedRef.current || ownershipRevokedRef.current || initializingRef.current) {
      return initializingRef.current || Promise.resolve();
    }

    initializingRef.current = (async () => {
      try {
        const { session: active } = await getActiveReadingSession(bookId);
        if (closedRef.current || ownershipRevokedRef.current) return;

        if (active) {
          if (
            active.id !== localStorage.getItem(ownershipKey) ||
            active.progressMode !== "PERCENT" ||
            (active.verifiedSeconds !== null && !sessionStorage.getItem(leaseKey))
          ) {
          const recoverable =
            active.source === "EBOOK" &&
            active.progressMode === "PERCENT" &&
            active.verifiedSeconds !== null &&
            Number.isFinite(Date.parse(active.lastHeartbeatAt));

          setRecoveryCandidate(recoverable ? {
            id: active.id,
            lastHeartbeatAt: active.lastHeartbeatAt,
            pausedAt: active.pausedAt,
          } : null);

          if (recoverable) {
            setNotice("");
            return;
          }
            setNotice("Існує інша активна сесія цієї книги. Автоматичний облік вимкнено, щоб не дублювати статистику.");
            return;
          }
          setRecoveryCandidate(null);
          setNotice("");
          sessionRef.current = active;
          readerLeaseRef.current = sessionStorage.getItem(leaseKey);
          ownedRef.current = true;
          startRef.current = clamp(active.startPercent ?? 0);
          progressRef.current = Math.max(startRef.current, progressRef.current);
          if (active.pausedAt && !document.hidden) {
            await queue(async () => {
              const response = await resumeReadingSession(bookId, readerLeaseRef.current);
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
        const lease = response.session?.readerLeaseId ?? null;

        if (response.session?.verifiedSeconds !== null && !lease) {
          throw new Error("EPUB reader lease was not returned");
        }

        sessionRef.current = response.session;
        readerLeaseRef.current = lease;
        ownedRef.current = true;
        startRef.current = start;
        progressRef.current = Math.max(start, progressRef.current);
        localStorage.setItem(ownershipKey, response.session.id);
        if (readerLeaseRef.current) {
          sessionStorage.setItem(leaseKey, readerLeaseRef.current);
        } else {
          sessionStorage.removeItem(leaseKey);
        }
      } catch (error) {
        if (isReaderLeaseRejection(error)) {
          revokeOwnership();
          return;
        }
        setNotice(error?.message || "Не вдалося запустити облік часу читання");
      }
    })().finally(() => {
      initializingRef.current = null;
    });

    return initializingRef.current;
  }, [ready, userId, finished, bookId, ownershipKey, leaseKey, initialPercent, queue, revokeOwnership]);

  useEffect(() => {
    const retryInitialization = () => {
      if (
        !ready ||
        finished ||
        document.hidden ||
        navigator.onLine === false ||
        ownedRef.current ||
        ownershipRevokedRef.current ||
        closedRef.current ||
        recoveringRef.current ||
        recoveryCandidate ||
        initializingRef.current
      ) {
        return;
      }

      void init();
    };

    retryInitialization();

    window.addEventListener("online", retryInitialization);
    window.addEventListener("focus", retryInitialization);
    document.addEventListener("visibilitychange", retryInitialization);

    const retryTimer = window.setInterval(
      retryInitialization,
      15000,
    );

    return () => {
      window.clearInterval(retryTimer);
      window.removeEventListener("online", retryInitialization);
      window.removeEventListener("focus", retryInitialization);
      document.removeEventListener(
        "visibilitychange",
        retryInitialization,
      );
    };
  }, [ready, finished, init, recoveryCandidate]);

  // Heartbeats use the same request queue as pause, resume and finish.
  useEffect(() => {
    if (!ready || finished || !userId) return undefined;

    const timer = window.setInterval(() => {
      const session = sessionRef.current;

      if (
        heartbeatInFlightRef.current ||
        closedRef.current ||
        document.hidden ||
        !ownedRef.current ||
        !session ||
        session.pausedAt ||
        session.source !== "EBOOK" ||
        session.verifiedSeconds == null
      ) {
        return;
      }

      heartbeatInFlightRef.current = true;

      void queue(async () => {
        const current = sessionRef.current;

        // Recheck after previous requests have finished.
        if (
          closedRef.current ||
          document.hidden ||
          !ownedRef.current ||
          !current ||
          current.pausedAt ||
          current.id !== session.id
        ) {
          return;
        }

        const response = await heartbeatReadingSession(
          bookId,
          current.id,
          readerLeaseRef.current,
        );

        if (
          response?.heartbeat &&
          sessionRef.current?.id === current.id
        ) {
          sessionRef.current = {
            ...sessionRef.current,
            verifiedSeconds: response.heartbeat.verifiedSeconds,
            lastHeartbeatAt: response.heartbeat.lastHeartbeatAt,
          };
        }
      })
        .catch((error) => {
          if (isReaderLeaseRejection(error)) {
            revokeOwnership();
          } else {
            console.warn("EPUB heartbeat failed", error);
          }
        })
        .finally(() => {
          heartbeatInFlightRef.current = false;
        });
    }, 30000);

    return () => window.clearInterval(timer);
  }, [ready, finished, userId, bookId, queue, revokeOwnership]);

  const dismissRecovery = useCallback(() => {
    setRecoveryCandidate(null);
    setNotice("");
  }, []);

  const recover = useCallback(async (automatic = false) => {
    if (recoveringRef.current || closedRef.current || ownershipRevokedRef.current || !ready || !userId) {
      return false;
    }

    recoveringRef.current = true;
    setIsRecovering(true);

    try {
      await initializingRef.current;

      return await queue(async () => {
        // Always verify the server session immediately before reclaiming it.
        const response = await getActiveReadingSession(bookId);
        const active = response?.session;

        if (automatic) {
          const lastActivity = Math.max(
            Date.parse(active?.lastHeartbeatAt || "") || 0,
            Date.parse(active?.pausedAt || "") || 0,
          );

          if (!lastActivity || Date.now() - lastActivity < 120000) {
            return false;
          }
        }

        if (
          !active ||
          active.source !== "EBOOK" ||
          active.progressMode !== "PERCENT" ||
          active.verifiedSeconds === null ||
          !Number.isFinite(Date.parse(active.lastHeartbeatAt)) ||
          active.id !== recoveryCandidate?.id
        ) {
          setRecoveryCandidate(null);
          setNotice("Немає доступної EPUB-сесії для відновлення.");
          return false;
        }

        const age = Date.now() - Date.parse(active.lastHeartbeatAt);
        const stale = Number.isFinite(age) && age >= 120000;

        if (!active.pausedAt && !stale) {
          setNotice("Сесія ще активна на іншому пристрої. Спробуйте пізніше.");
          return false;
        }

        if (document.hidden) return false;

        const claimed = await claimEbookReadingSession(bookId, active.id);
        const restored = claimed?.session;
        const lease = claimed?.readerLeaseId;

        if (restored?.id !== active.id || !lease) {
          throw new Error("Invalid EPUB recovery response");
        }

        sessionRef.current = restored;
        readerLeaseRef.current = lease;
        ownedRef.current = true;
        startRef.current = clamp(active.startPercent ?? 0);
        progressRef.current = Math.max(
          startRef.current,
          progressRef.current,
        );
        localStorage.setItem(ownershipKey, restored.id);
        sessionStorage.setItem(leaseKey, lease);

        setRecoveryCandidate(null);
        setNotice("");
        return true;
      });
    } catch (error) {
      setNotice(error?.message || "Не вдалося відновити сесію.");
      return false;
    } finally {
      recoveringRef.current = false;
      setIsRecovering(false);
    }
  }, [ready, userId, bookId, recoveryCandidate, ownershipKey, leaseKey, queue]);

  useEffect(() => {
    if (!recoveryCandidate || !ready || finished || !userId) {
      return undefined;
    }

    const lastActivity = Math.max(
      Date.parse(recoveryCandidate.lastHeartbeatAt || "") || 0,
      Date.parse(recoveryCandidate.pausedAt || "") || 0,
    );

    if (!lastActivity) return undefined;

    const attemptRecovery = () => {
      if (
        !document.hidden &&
        navigator.onLine !== false &&
        Date.now() - lastActivity >= 120000
      ) {
        void recover(true);
      }
    };

    const delay = Math.max(
      0,
      lastActivity + 120000 - Date.now(),
    ) + 1000;

    const autoRecoveryTimeout = window.setTimeout(
      attemptRecovery,
      delay,
    );

    const recoveryRetryInterval = window.setInterval(
      attemptRecovery,
      30000,
    );

    document.addEventListener(
      "visibilitychange",
      attemptRecovery,
    );
    window.addEventListener("online", attemptRecovery);

    return () => {
      window.clearTimeout(autoRecoveryTimeout);
      window.clearInterval(recoveryRetryInterval);
      window.removeEventListener("online", attemptRecovery);
      document.removeEventListener(
        "visibilitychange",
        attemptRecovery,
      );
    };
  }, [recoveryCandidate, ready, finished, userId, recover]);

  const pause = useCallback(() => queue(async () => {
    if (!ownedRef.current || !sessionRef.current || sessionRef.current.pausedAt || closedRef.current) return;
    try {
      const response = await pauseReadingSession(bookId, readerLeaseRef.current);
      sessionRef.current = response.session;
    } catch (error) {
      if (isReaderLeaseRejection(error)) revokeOwnership();
      console.warn("Unable to pause ebook reading session", error);
    }
  }), [bookId, queue, revokeOwnership]);

  const resume = useCallback(() => queue(async () => {
    if (!ownedRef.current || !sessionRef.current || !sessionRef.current.pausedAt || closedRef.current) return;
    try {
      const response = await resumeReadingSession(bookId, readerLeaseRef.current);
      sessionRef.current = response.session;
    } catch (error) {
      if (isReaderLeaseRejection(error)) revokeOwnership();
      console.warn("Unable to resume ebook reading session", error);
    }
  }), [bookId, queue, revokeOwnership]);

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
          method: "POST",
          keepalive: true,
          ...(readerLeaseRef.current && {
            body: { readerLeaseId: readerLeaseRef.current },
          }),
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
          ...(position.epubReachedEnd === true && {
            epubReachedEnd: true,
          }),
        }, readerLeaseRef.current);
        ownedRef.current = false;
        sessionRef.current = null;
        localStorage.removeItem(ownershipKey);
        sessionStorage.removeItem(leaseKey);
        readerLeaseRef.current = null;
        try {
          await onSavedRef.current?.();
        } catch (error) {
          console.warn("Reading statistics refresh failed after saving session", error);
        }
      }
      return true;
    } catch (error) {
      if (isReaderLeaseRejection(error)) {
        revokeOwnership();
        return false;
      }
      setNotice(error?.message || "Не вдалося зберегти сесію — спробуйте закрити ще раз");
      return false;
    } finally {
      closedRef.current = false;
    }
  }, [bookId, ownershipKey, leaseKey, revokeOwnership]);

  return {
    finish,
    notice,
    recoveryCandidate,
    isRecovering,
    recover,
    dismissRecovery,
  };
};

export default useEbookAutoSession;
