import { useEffect, useRef } from "react";

const MODAL_HISTORY_KEY = "__libraryModal";

const useModalHistory = (isOpen, onClose) => {
  const onCloseRef = useRef(onClose);
  const closedByHistoryRef = useRef(false);
  const modalIdRef = useRef(null);

  useEffect(() => {
    onCloseRef.current = onClose;
  }, [onClose]);

  useEffect(() => {
    if (!isOpen) {
      return undefined;
    }

    const modalId = crypto.randomUUID();

    modalIdRef.current = modalId;
    closedByHistoryRef.current = false;

    window.history.pushState(
      {
        ...window.history.state,
        [MODAL_HISTORY_KEY]: modalId,
      },
      "",
      window.location.href,
    );

    const handlePopState = () => {
      closedByHistoryRef.current = true;
      onCloseRef.current();
    };

    window.addEventListener("popstate", handlePopState);

    return () => {
      window.removeEventListener("popstate", handlePopState);

      const ownsCurrentHistoryEntry =
        window.history.state?.[MODAL_HISTORY_KEY] === modalIdRef.current;

      if (!closedByHistoryRef.current && ownsCurrentHistoryEntry) {
        window.history.back();
      }

      modalIdRef.current = null;
    };
  }, [isOpen]);
};

export default useModalHistory;
