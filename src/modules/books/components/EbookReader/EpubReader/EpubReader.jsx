import { useEffect, useRef, useState } from "react";
import ePub from "epubjs";
import "./EpubReader.css";

const EpubReader = ({ blob }) => {
  const containerRef = useRef(null);
  const renditionRef = useRef(null);

  const [error, setError] = useState("");
  const [readerTheme, setReaderTheme] = useState(
    () => localStorage.getItem("ebook-reader-theme") === "dark" ? "dark" : "light"
  );
  const themeRef = useRef(readerTheme);

  useEffect(() => {
    if (!blob || !containerRef.current) return;

    let disposed = false;
    let book;
    let rendition;

    const initialize = async () => {
      try {
        const buffer = await blob.arrayBuffer();
        if (disposed) return;

        book = ePub(buffer);

        rendition = book.renderTo(containerRef.current, {
          width: "100%",
          height: "100%",
          flow: "paginated",
          spread: "none",
        });

        rendition.hooks.content.register((contents) => {
          const doc = contents.document;
          let startX = 0;
          let startY = 0;
          let tracking = false;

          doc.addEventListener("touchstart", (event) => {
            if (event.touches.length !== 1) {
              tracking = false;
              return;
            }

            startX = event.touches[0].clientX;
            startY = event.touches[0].clientY;
            tracking = true;
          }, { passive: true });

          doc.addEventListener("touchend", (event) => {
            if (!tracking || event.changedTouches.length !== 1) return;
            tracking = false;

            const deltaX = event.changedTouches[0].clientX - startX;
            const deltaY = event.changedTouches[0].clientY - startY;

            if (Math.abs(deltaX) < 50) return;
            if (Math.abs(deltaX) < Math.abs(deltaY) * 1.5) return;

            if (deltaX < 0) {
              renditionRef.current?.next();
            } else {
              renditionRef.current?.prev();
            }
          }, { passive: true });

          doc.addEventListener("touchcancel", () => {
            tracking = false;
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
        renditionRef.current = rendition;
        await rendition.display();
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
      rendition?.destroy();
      book?.destroy();
    };
  }, [blob]);

  useEffect(() => {
    themeRef.current = readerTheme;
    localStorage.setItem("ebook-reader-theme", readerTheme);

    const rendition = renditionRef.current;
    if (rendition) {
      rendition.themes.select("ebook-reader-" + readerTheme);
    }
  }, [readerTheme]);

  return (
    <div className={"epub-reader epub-reader--" + readerTheme}>
      {error ? (
        <p role="alert">{error}</p>
      ) : (
        <>
          <div className="epub-reader__viewport" ref={containerRef} />

          <div className="epub-reader__controls">
            <button
              type="button"
              className="epub-reader__theme-toggle"
              onClick={() =>
                setReaderTheme((current) =>
                  current === "light" ? "dark" : "light"
                )
              }
              aria-label={readerTheme === "light" ? "Dark mode" : "Light mode"}
              title={readerTheme === "light" ? "Dark mode" : "Light mode"}
            >
              {readerTheme === "light" ? "\u263E" : "\u2600"}
            </button>
            <button
              type="button"
              onClick={() => renditionRef.current?.prev()}
            >
              <span aria-hidden="true">&larr;</span>
            </button>

            <button
              type="button"
              onClick={() => renditionRef.current?.next()}
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
