import { useEffect, useRef, useState } from "react";
import ePub from "epubjs";
import "./EpubReader.css";

const READER_FONT_SIZE_KEY = "ebook-reader-font-size";
const READER_BRIGHTNESS_KEY = "ebook-reader-brightness";
const clamp = (number, min, max) => Math.min(max, Math.max(min, number));

const readNumber = (key, fallback, min, max) => {
  const saved = localStorage.getItem(key);
  if (saved === null) return fallback;
  const parsed = Number(saved);
  return Number.isFinite(parsed) ? clamp(parsed, min, max) : fallback;
};

const EpubReader = ({ blob, readerTheme, locationKey, onLocationChange, onReadingAdvance, onReady }) => {
  const containerRef = useRef(null);
  const renditionRef = useRef(null);
  const seekBookRef = useRef(null);
  const countedRangesRef = useRef([]);
  const turningRef = useRef(false);
  const onReadingAdvanceRef = useRef(onReadingAdvance);
  onReadingAdvanceRef.current = onReadingAdvance;
  const seekValueRef = useRef(null);
  const seekBusyRef = useRef(false);
  const onLocationChangeRef = useRef(onLocationChange);
  const onReadyRef = useRef(onReady);
  onLocationChangeRef.current = onLocationChange;
  onReadyRef.current = onReady;

  const [error, setError] = useState("");
  const [bookProgress, setBookProgress] = useState(null);
  const [progressVisible, setProgressVisible] = useState(false);
  const [locationsReady, setLocationsReady] = useState(false);
  const [seekPreview, setSeekPreview] = useState(null);
  const [isScrubbing, setIsScrubbing] = useState(false);
  const [isSeeking, setIsSeeking] = useState(false);
  const [seekError, setSeekError] = useState("");
  const themeRef = useRef(readerTheme);
  const fontSizeRef = useRef(readNumber(READER_FONT_SIZE_KEY, 100, 75, 200));
  const [brightness, setBrightness] = useState(
    () => readNumber(READER_BRIGHTNESS_KEY, 1, 0.45, 1.3)
  );
  const brightnessRef = useRef(brightness);
  const [gestureHint, setGestureHint] = useState("");

  // The progress panel disappears after a few seconds, without affecting EPUB layout.
  useEffect(() => {
    if (!progressVisible || isScrubbing || isSeeking) return undefined;
    const timeout = window.setTimeout(() => setProgressVisible(false), 6000);
    return () => window.clearTimeout(timeout);
  }, [progressVisible, isScrubbing, isSeeking]);

  // A jump to an arbitrary EPUB location is navigation, not reading.
  // Only actual NEXT page turns contribute newly traversed text to stats.
  const advancePage = async () => {
    const rendition = renditionRef.current;
    const book = seekBookRef.current;
    if (!rendition || turningRef.current || seekBusyRef.current) return;
    turningRef.current = true;
    const beforeCfi = rendition.currentLocation()?.start?.cfi;
    try {
      await rendition.next();
      const afterCfi = rendition.currentLocation()?.start?.cfi;
      if (!book || !beforeCfi || !afterCfi) return;
      const from = book.locations.percentageFromCfi(beforeCfi);
      const to = book.locations.percentageFromCfi(afterCfi);
      // Ignore uninitialized locations and unexpected jumps (e.g. broken spine).
      if (!Number.isFinite(from) || !Number.isFinite(to) ||
          from < 0 || to > 1 || to <= from || to - from > 0.15) return;

      // Union of traversed ranges avoids counting re-read pages twice within
      // this reader opening; multiple EPUB relocations are not page turns.
      const existing = countedRangesRef.current;
      const oldTotal = existing.reduce((sum, [a, b]) => sum + b - a, 0);
      const ordered = [...existing, [from, to]].sort((a, b) => a[0] - b[0]);
      const merged = [];
      for (const [a, b] of ordered) {
        const last = merged[merged.length - 1];
        if (last && a <= last[1]) last[1] = Math.max(last[1], b);
        else merged.push([a, b]);
      }
      countedRangesRef.current = merged;
      const newTotal = merged.reduce((sum, [a, b]) => sum + b - a, 0);
      const delta = Math.max(0, (newTotal - oldTotal) * 100);
      if (delta > 0) onReadingAdvanceRef.current?.(delta);
    } catch (error) {
      console.warn('Unable to advance EPUB page', error);
    } finally {
      turningRef.current = false;
    }
  };

  // epub.js generates CFIs for the entire book. Seek only after generation,
  // and only when the gesture ends (not for every pixel of pointer movement).
  const previewSeek = (event) => {
    const next = Math.max(0, Math.min(100, Number(event.target.value)));
    seekValueRef.current = next;
    setSeekPreview(next);
    setSeekError("");
  };

  const commitSeek = async () => {
    const target = seekValueRef.current;
    if (target === null || seekBusyRef.current) return;
    seekValueRef.current = null;

    const book = seekBookRef.current;
    const rendition = renditionRef.current;
    if (!locationsReady || !book || !rendition) {
      setSeekPreview(null);
      return;
    }

    seekBusyRef.current = true;
    setIsSeeking(true);
    try {
      // EPUB percentages describe stable text positions rather than screen pages.
      // 100% is mapped just inside the final section so the generated CFI exists.
      const ratio = Math.min(0.999999, Math.max(0, target / 100));
      const cfi = book.locations.cfiFromPercentage(ratio);
      if (!cfi || !book.spine.get(cfi)) {
        throw new Error("EPUB location is unavailable");
      }
      await rendition.display(cfi);
      // The existing relocated listener updates the CFI bookmark, bar and stats.
    } catch (error) {
      console.warn("Cannot jump to EPUB position", error);
      setSeekError("Не вдалося перейти до вибраної позиції");
    } finally {
      seekBusyRef.current = false;
      setIsSeeking(false);
      setSeekPreview(null);
    }
  };

  useEffect(() => {
    if (!blob || !containerRef.current) return;
    setLocationsReady(false);
    countedRangesRef.current = [];
    turningRef.current = false;
    setBookProgress(null);
    setSeekPreview(null);
    setSeekError("");
    seekValueRef.current = null;

    let disposed = false;
    let book;
    let rendition;

    const initialize = async () => {
      try {
        const buffer = await blob.arrayBuffer();
        if (disposed) return;

        book = ePub(buffer);
        seekBookRef.current = book;

        rendition = book.renderTo(containerRef.current, {
          width: "100%",
          height: "100%",
          flow: "paginated",
          spread: "none",
        });

        // EPUB contents render inside an iframe: listen inside each content document.
        // Single-finger horizontal = page, left-edge vertical = page brightness,
        // two fingers = font size. Do not change actual device display brightness.
        rendition.hooks.content.register((contents) => {
          const doc = contents.document;
          let gesture = null;
          const distance = (first, second) => Math.hypot(
            first.clientX - second.clientX,
            first.clientY - second.clientY,
          );

          doc.addEventListener("touchstart", (event) => {
            if (event.touches.length === 2) {
              gesture = {
                kind: "pinch",
                distance: distance(event.touches[0], event.touches[1]),
                originalFontSize: fontSizeRef.current,
                nextFontSize: fontSizeRef.current,
              };
              return;
            }
            if (event.touches.length !== 1) {
              gesture = null;
              return;
            }

            const touch = event.touches[0];
            const edgeWidth = Math.min(70, Math.max(44, doc.documentElement.clientWidth * 0.16));
            gesture = {
              kind: touch.clientX <= edgeWidth ? "brightness" : "swipe",
              startX: touch.clientX,
              startY: touch.clientY,
              originalBrightness: brightnessRef.current,
              active: false,
            };
          }, { passive: true });

          doc.addEventListener("touchmove", (event) => {
            if (!gesture) return;

            if (gesture.kind === "pinch" && event.touches.length === 2) {
              if (event.cancelable) event.preventDefault();
              if (gesture.distance < 10) return;
              const scale = distance(event.touches[0], event.touches[1]) / gesture.distance;
              const nextFontSize = clamp(
                Math.round((gesture.originalFontSize * scale) / 5) * 5,
                75,
                200,
              );
              gesture.nextFontSize = nextFontSize;
              setGestureHint(`Шрифт ${nextFontSize}%`);
              return;
            }

            if (gesture.kind === "brightness" && event.touches.length === 1) {
              const touch = event.touches[0];
              const dx = touch.clientX - gesture.startX;
              const dy = touch.clientY - gesture.startY;
              if (!gesture.active) {
                if (Math.abs(dy) < 12 && Math.abs(dx) < 12) return;
                if (Math.abs(dx) > Math.abs(dy)) {
                  gesture.kind = "swipe";
                  return;
                }
                gesture.active = true;
              }
              if (event.cancelable) event.preventDefault();
              const height = doc.documentElement.clientHeight || 600;
              const next = clamp(
                Math.round((gesture.originalBrightness - (dy / height) * 1.2) * 100) / 100,
                0.45,
                1.3,
              );
              brightnessRef.current = next;
              setBrightness(next);
              localStorage.setItem(READER_BRIGHTNESS_KEY, String(next));
              setGestureHint(`Яскравість ${Math.round(next * 100)}%`);
            }
          }, { passive: false });

          doc.addEventListener("touchend", (event) => {
            if (!gesture) return;

            if (gesture.kind === "pinch") {
              if (event.touches.length < 2) {
                const next = gesture.nextFontSize;
                if (next !== fontSizeRef.current) {
                  fontSizeRef.current = next;
                  localStorage.setItem(READER_FONT_SIZE_KEY, String(next));
                  // Apply once at gesture end to avoid reloading the EPUB iframe
                  // while fingers are still touching it.
                  rendition.themes.fontSize(`${next}%`);
                }
                setGestureHint("");
                gesture = null;
              }
              return;
            }

            if (event.touches.length !== 0) return;
            if (gesture.kind === "swipe" && event.changedTouches.length === 1) {
              const deltaX = event.changedTouches[0].clientX - gesture.startX;
              const deltaY = event.changedTouches[0].clientY - gesture.startY;
              if (Math.abs(deltaX) >= 50 && Math.abs(deltaX) >= Math.abs(deltaY) * 1.5) {
                if (deltaX < 0) void advancePage();
                else renditionRef.current?.prev();
              }
            }
            setGestureHint("");
            gesture = null;
          }, { passive: true });

          doc.addEventListener("touchcancel", () => {
            setGestureHint("");
            gesture = null;
          }, { passive: true });
        });

        rendition.themes.register("ebook-reader-light", {
          body: {
            background: "#faf7f0 !important",
            color: "#302b26 !important",
          },
        });

        rendition.themes.register("ebook-reader-dark", {
          body: {
            background: "#1b1b22 !important",
            color: "#e8e2ec !important",
          },
        });

        rendition.themes.select("ebook-reader-" + themeRef.current);
        rendition.themes.fontSize(`${fontSizeRef.current}%`);
        renditionRef.current = rendition;

        // CFI is independent of font size, viewport size and page layout.
        const publishLocation = (cfi) => {
          if (!cfi || disposed) return;
          try {
            // A CFI must map to an existing spine section to be safe to restore.
            if (!book.spine.get(cfi)) return;
            if (locationKey) localStorage.setItem(locationKey, cfi);
            const percentage = book.locations.percentageFromCfi(cfi);
            if (Number.isFinite(percentage)) {
              const rounded = Math.round(Math.max(0, Math.min(1, percentage)) * 100);
              setBookProgress(rounded);
              onLocationChangeRef.current?.(rounded);
            }
          } catch (error) {
            console.warn("Unable to save EPUB position", error);
          }
        };

        rendition.on("relocated", (location) => publishLocation(location?.start?.cfi));
        // Wait for EPUB metadata before restoring. Some EPUBs have no
        // linear/default first chapter, so display() without a target rejects
        // with "No Section Found" even though the book has readable chapters.
        await book.ready;
        if (disposed) return;

        const savedCfi = locationKey ? localStorage.getItem(locationKey) : null;
        let savedSection = null;
        if (savedCfi) {
          try {
            savedSection = book.spine.get(savedCfi) || null;
          } catch (error) {
            console.warn("Invalid saved EPUB CFI", error);
          }
          if (!savedSection) {
            console.warn("Saved EPUB position does not map to a chapter; trying book start");
          }
        }

        // Use numeric spine indices for fallback: unlike display() with no
        // target, this also supports books whose chapters are all non-linear.
        // Keep the old CFI until another location has actually opened.
        const firstSection = book.spine.first?.() || book.spine.get(0);
        const restoreTargets = [];
        const addRestoreTarget = (value, description) => {
          if (value === null || value === undefined) return;
          if (!restoreTargets.some((entry) => entry.value === value)) {
            restoreTargets.push({ value, description });
          }
        };

        if (savedSection) {
          addRestoreTarget(savedCfi, "saved position");
          addRestoreTarget(savedSection.index, "saved chapter");
        }
        if (firstSection) {
          addRestoreTarget(firstSection.index, "first chapter");
        }

        let opened = false;
        let lastOpenError = null;
        let openedTarget = null;
        for (const candidate of restoreTargets) {
          try {
            await rendition.display(candidate.value);
            opened = true;
            openedTarget = candidate.value;
            break;
          } catch (error) {
            lastOpenError = error;
            console.warn("Cannot open EPUB " + candidate.description + "; trying fallback", error);
          }
        }
        if (!opened) {
          throw lastOpenError || new Error("EPUB has no readable chapter in its spine");
        }

        // Only discard the previous failed CFI if no new position has been
        // published by the relocated handler during successful fallback.
        if (
          locationKey && savedCfi && openedTarget !== savedCfi &&
          localStorage.getItem(locationKey) === savedCfi
        ) {
          localStorage.removeItem(locationKey);
        }
        if (disposed) return;
        onReadyRef.current?.();

        // Build stable EPUB location percentages asynchronously: don't delay first render.
        void book.locations.generate(1200).then(() => {
          if (disposed) return;
          publishLocation(rendition.currentLocation()?.start?.cfi);
          setLocationsReady(true);
        }).catch((error) => {
          console.warn("Unable to calculate EPUB locations", error);
        });
      } catch (err) {
        if (!disposed) {
          console.error("EPUB reader error:", err);
          setError("Failed to open EPUB");
        }
      }
    };

    initialize();

    return () => {
      disposed = true;
      renditionRef.current = null;
      seekBookRef.current = null;
      rendition?.destroy();
      book?.destroy();
    };
  }, [blob]);

  useEffect(() => {
    themeRef.current = readerTheme;
    const rendition = renditionRef.current;
    if (rendition) {
      rendition.themes.select("ebook-reader-" + readerTheme);
    }
  }, [readerTheme]);

  return (
    <div className={"epub-reader epub-reader--" + readerTheme}>
      {gestureHint && (
        <div className="epub-reader__gesture-hint" aria-hidden="true">{gestureHint}</div>
      )}
      {error ? (
        <p role="alert">{error}</p>
      ) : (
        <>
          <div className="epub-reader__page">
            <div
              className="epub-reader__viewport"
              ref={containerRef}
              style={{ "--ebook-page-brightness": brightness }}
            />
            {progressVisible && (
              <div className="epub-reader__progress-panel" role="status">
                <div className="epub-reader__progress-label">
                  <span>Позиція у книзі</span>
                  <strong>{seekPreview !== null ? seekPreview + "%" : bookProgress === null ? "Визначаємо…" : bookProgress + "%"}</strong>
                </div>
                {seekError && <span className="epub-reader__seek-error" role="alert">{seekError}</span>}
              <div className="epub-reader__progress-scrub">
                  <div className="epub-reader__progress-track" aria-hidden="true">
                    <span style={{ width: String(seekPreview ?? bookProgress ?? 0) + "%" }} />
                  </div>
                  <input
                    className="epub-reader__progress-range"
                    type="range"
                    min="0"
                    max="100"
                    step="1"
                    value={seekPreview ?? bookProgress ?? 0}
                    disabled={!locationsReady || isSeeking}
                    aria-label="Перейти до позиції у книзі"
                    aria-valuetext={String(seekPreview ?? bookProgress ?? 0) + "%"}
                    title="Перетягни для переходу до потрібного відсотка"
                    onChange={previewSeek}
                    onPointerDown={() => setIsScrubbing(true)}
                    onPointerUp={() => {
                      setIsScrubbing(false);
                      void commitSeek();
                    }}
                    onPointerCancel={() => {
                      setIsScrubbing(false);
                      seekValueRef.current = null;
                      setSeekPreview(null);
                    }}
                    onKeyDown={(event) => {
                      if (["ArrowLeft", "ArrowRight", "ArrowUp", "ArrowDown", "Home", "End", "PageUp", "PageDown"].includes(event.key)) {
                        setIsScrubbing(true);
                      }
                    }}
                    onKeyUp={(event) => {
                      if (["ArrowLeft", "ArrowRight", "ArrowUp", "ArrowDown", "Home", "End", "PageUp", "PageDown"].includes(event.key)) {
                        setIsScrubbing(false);
                        void commitSeek();
                      }
                    }}
                    onBlur={() => {
                      setIsScrubbing(false);
                      if (seekValueRef.current !== null) void commitSeek();
                    }}
                  />
                </div>
              </div>
            )}
            <button
              type="button"
              className="epub-reader__progress-toggle"
              onClick={() => setProgressVisible((visible) => !visible)}
              aria-label={progressVisible ? "Приховати прогрес книги" : "Показати прогрес книги"}
              aria-expanded={progressVisible}
              title={progressVisible ? "Приховати прогрес" : "Показати прогрес"}
            >
              <span className="epub-reader__progress-grip" aria-hidden="true" />
            </button>
          </div>

          <div className="epub-reader__controls">
            <button
              type="button"
              onClick={() => renditionRef.current?.prev()}
            >
              <span aria-hidden="true">&larr;</span>
            </button>

            <button
              type="button"
              onClick={() => void advancePage()}
            >
              <span aria-hidden="true">&rarr;</span>
            </button>
          </div>
        </>
      )}
    </div>
  );
};

export default EpubReader;
