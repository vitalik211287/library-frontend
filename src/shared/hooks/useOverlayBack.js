import { useEffect, useRef } from "react";

const OVERLAY_HISTORY_KEY = "__libraryOverlay";

const useOverlayBack = (isOpen, onClose) => {
  const onCloseRef = useRef(onClose);
  useEffect(() => {
    onCloseRef.current = onClose;
  }, [onClose]);

  useEffect(() => {
    if (!isOpen) {
      return undefined;
    }

    const overlayId = crypto.randomUUID();

    window.history.pushState(
      {
        ...window.history.state,
        [OVERLAY_HISTORY_KEY]: overlayId,
      },
      "",
      window.location.href,
    );

    const handlePopState = () => {
      onCloseRef.current();
    };

    window.addEventListener("popstate", handlePopState);

    return () => {
      window.removeEventListener("popstate", handlePopState);

    };
  }, [isOpen]);
};

export default useOverlayBack;