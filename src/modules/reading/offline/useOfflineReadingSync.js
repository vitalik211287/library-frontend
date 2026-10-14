import { useEffect } from "react";
import { getToken } from "../../../shared/api/apiClient.js";
import { syncQueuedOfflineManualSessions } from "./offlineReadingQueue.js";

/** Sync existing queued sessions after authentication and when connectivity returns. */
export const useOfflineReadingSync = (userId) => {
  useEffect(() => {
    if (!userId) return undefined;
    let active = true;
    const sync = () => {
      if (!active || !getToken() || navigator.onLine === false) return;
      void syncQueuedOfflineManualSessions(userId).catch((error) => {
        console.warn("Offline reading sync could not start", error);
      });
    };
    sync();
    window.addEventListener("online", sync);
    window.addEventListener("focus", sync);
    return () => {
      active = false;
      window.removeEventListener("online", sync);
      window.removeEventListener("focus", sync);
    };
  }, [userId]);
};
