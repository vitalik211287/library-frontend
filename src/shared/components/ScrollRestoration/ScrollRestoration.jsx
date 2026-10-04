import { useEffect, useRef } from "react";
import { useLocation, useNavigationType } from "react-router-dom";

const STORAGE_KEY = "library-scroll-positions";

const readPositions = () => {
  try {
    return JSON.parse(sessionStorage.getItem(STORAGE_KEY) || "{}");
  } catch {
    return {};
  }
};

const savePosition = (key, position) => {
  const positions = readPositions();

  positions[key] = position;

  sessionStorage.setItem(STORAGE_KEY, JSON.stringify(positions));
};

const ScrollRestoration = () => {
  const location = useLocation();
  const navigationType = useNavigationType();
  const previousKeyRef = useRef(null);

  const scrollKey = `${location.pathname}${location.search}`;

  useEffect(() => {
    const previousKey = previousKeyRef.current;

    if (previousKey && previousKey !== scrollKey) {
      savePosition(previousKey, window.scrollY);
    }

    previousKeyRef.current = scrollKey;

    const positions = readPositions();
    const savedPosition = positions[scrollKey];

    if (navigationType === "POP" && Number.isFinite(savedPosition)) {
      let attempts = 0;

      const restore = () => {
        const maxScroll = Math.max(
          document.documentElement.scrollHeight - window.innerHeight,
          0,
        );

        if (maxScroll >= savedPosition || attempts >= 20) {
          window.scrollTo({
            top: Math.min(savedPosition, maxScroll),
            behavior: "auto",
          });

          return;
        }

        attempts += 1;
        window.setTimeout(restore, 100);
      };

      restore();
    } else {
      window.scrollTo({
        top: 0,
        behavior: "auto",
      });
    }

    return () => {
      savePosition(scrollKey, window.scrollY);
    };
  }, [navigationType, scrollKey]);

  return null;
};

export default ScrollRestoration;
