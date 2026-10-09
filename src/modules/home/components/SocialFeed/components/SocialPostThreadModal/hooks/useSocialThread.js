import { useCallback, useEffect, useRef, useState } from "react";

import { apiFetch } from "../../../../../../../shared/api/apiClient.js";

const useSocialThread = ({
  postId,
  activityId,
  onThreadCountChange,
}) => {
  const [thread, setThread] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSending, setIsSending] = useState(false);
  const sendingRef = useRef(false);
  const pendingKudosRef = useRef(new Set());
  const pendingReplyMutationsRef = useRef(new Set());
  const [error, setError] = useState("");
  const requestIdRef = useRef(0);

  const isActivityThread = Boolean(activityId);
  const isOpen = Boolean(postId || activityId);

  const loadThread = useCallback(async () => {
    if (!isOpen) {
      return;
    }

    const requestId = ++requestIdRef.current;

    try {
      setIsLoading(true);
      setError("");

      const data = await apiFetch(
        isActivityThread
          ? `/api/social/activities/${activityId}/thread`
          : `/api/social/posts/${postId}`,
      );

      if (requestId !== requestIdRef.current) {
        return;
      }

      const replies = isActivityThread
        ? data?.comments || []
        : data?.replies || [];

      setThread(
        isActivityThread
          ? {
              activityId,
              replies,
            }
          : data,
      );

      onThreadCountChange?.(
        isActivityThread ? activityId : postId,
        replies.length,
      );
    } catch (requestError) {
      if (requestId !== requestIdRef.current) {
        return;
      }

      console.error(
        "Failed to load social post thread:",
        requestError,
      );

      setError(
        "\u041d\u0435 \u0432\u0434\u0430\u043b\u043e\u0441\u044f \u0437\u0430\u0432\u0430\u043d\u0442\u0430\u0436\u0438\u0442\u0438 \u043e\u0431\u0433\u043e\u0432\u043e\u0440\u0435\u043d\u043d\u044f",
      );
    } finally {
      if (requestId === requestIdRef.current) {
        setIsLoading(false);
      }
    }
  }, [
    activityId,
    isActivityThread,
    isOpen,
    onThreadCountChange,
    postId,
  ]);

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    const controller = new AbortController();

    Promise.resolve().then(() => {
      if (!controller.signal.aborted) {
        loadThread();
      }
    });

    return () => {
      controller.abort();
      requestIdRef.current += 1;
    };
  }, [isOpen, loadThread]);

  const createReply = async ({ text, parentId }) => {
    const normalizedText = text.trim();

    if (!normalizedText || !isOpen || sendingRef.current) {
      return false;
    }

    sendingRef.current = true;

    try {
      setIsSending(true);
      setError("");

      await apiFetch("/api/social/posts", {
        method: "POST",
        body: {
          text: normalizedText,
          parentId,
          activityId: isActivityThread ? activityId : null,
        },
      });

      await loadThread();

      return true;
    } catch (requestError) {
      console.error(
        "Failed to create social post reply:",
        requestError,
      );

      setError(
        "\u041d\u0435 \u0432\u0434\u0430\u043b\u043e\u0441\u044f \u043d\u0430\u0434\u0456\u0441\u043b\u0430\u0442\u0438 \u0432\u0456\u0434\u043f\u043e\u0432\u0456\u0434\u044c",
      );

      return false;
    } finally {
      sendingRef.current = false;
      setIsSending(false);
    }
  };

  const toggleReplyKudos = async (reply) => {
    if (!reply?.id || reply.isOwnPost || pendingKudosRef.current.has(reply.id)) {
      return false;
    }

    pendingKudosRef.current.add(reply.id);

    const nextHasKudos = !reply.hasKudos;

    try {
      const data = await apiFetch(
        `/api/social/posts/${reply.id}/kudos`,
        {
          method: nextHasKudos ? "POST" : "DELETE",
        },
      );

      setThread((current) => {
        if (!current) {
          return current;
        }

        return {
          ...current,
          replies: (current.replies || []).map((item) =>
            item.id === reply.id
              ? {
                  ...item,
                  hasKudos: Boolean(data.hasKudos),
                  kudosCount: Number(data.kudosCount) || 0,
                }
              : item,
          ),
        };
      });

      return true;
    } catch (requestError) {
      console.error(
        "Failed to update reply kudos:",
        requestError,
      );

      return false;
    } finally {
      pendingKudosRef.current.delete(reply.id);
    }
  };

  const updateReply = async (reply, text) => {
    const normalizedText = text.trim();

    if (!normalizedText || !reply?.id || pendingReplyMutationsRef.current.has(reply.id)) {
      return false;
    }

    pendingReplyMutationsRef.current.add(reply.id);

    try {
      setError("");

      await apiFetch(`/api/social/posts/${reply.id}`, {
        method: "PATCH",
        body: {
          text: normalizedText,
          bookId: reply.book?.id || null,
        },
      });

      await loadThread();

      return true;
    } catch (requestError) {
      console.error(
        "Failed to update social post reply:",
        requestError,
      );

      setError(
        "\u041d\u0435 \u0432\u0434\u0430\u043b\u043e\u0441\u044f \u0432\u0456\u0434\u0440\u0435\u0434\u0430\u0433\u0443\u0432\u0430\u0442\u0438 \u0432\u0456\u0434\u043f\u043e\u0432\u0456\u0434\u044c",
      );

      return false;
    } finally {
      pendingReplyMutationsRef.current.delete(reply.id);
    }
  };

  const deleteReply = async (reply) => {
    if (!reply?.id || pendingReplyMutationsRef.current.has(reply.id)) {
      return false;
    }

    pendingReplyMutationsRef.current.add(reply.id);

    try {
      setError("");

      await apiFetch(`/api/social/posts/${reply.id}`, {
        method: "DELETE",
      });

      await loadThread();

      return true;
    } catch (requestError) {
      console.error(
        "Failed to delete social post reply:",
        requestError,
      );

      setError(
        "\u041d\u0435 \u0432\u0434\u0430\u043b\u043e\u0441\u044f \u0432\u0438\u0434\u0430\u043b\u0438\u0442\u0438 \u0432\u0456\u0434\u043f\u043e\u0432\u0456\u0434\u044c",
      );

      return false;
    } finally {
      pendingReplyMutationsRef.current.delete(reply.id);
    }
  };

  return {
    thread,
    isLoading,
    isSending,
    error,
    isActivityThread,
    isOpen,
    createReply,
    toggleReplyKudos,
    updateReply,
    deleteReply,
  };
};

export default useSocialThread;
