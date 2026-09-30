import { useCallback, useEffect, useState } from "react";

import { apiFetch } from "../../../../../../shared/api/apiClient.js";
import useOverlayBack from "../../../../../../shared/hooks/useOverlayBack.js";

import "./SocialPostThreadModal.css";

const SocialPostThreadModal = ({
  postId,
  onClose,
  onOpenProfile,
  onReplyCreated,
}) => {
  const [thread, setThread] = useState(null);
  const [replyText, setReplyText] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isSending, setIsSending] = useState(false);
  const [error, setError] = useState("");

  useOverlayBack(Boolean(postId), onClose);

  const loadThread = useCallback(async () => {
    if (!postId) {
      return;
    }

    try {
      setIsLoading(true);
      setError("");

      const data = await apiFetch(`/api/social/posts/${postId}`);

      setThread(data);
    } catch (requestError) {
      console.error("Failed to load social post thread:", requestError);
      setError("Не вдалося завантажити обговорення");
    } finally {
      setIsLoading(false);
    }
  }, [postId]);

  useEffect(() => {
    if (!postId) {
      return;
    }

    let cancelled = false;

    const fetchThread = async () => {
      try {
        const data = await apiFetch(`/api/social/posts/${postId}`);

        if (!cancelled) {
          setThread(data);
          setError("");
        }
      } catch (requestError) {
        console.error("Failed to load social post thread:", requestError);

        if (!cancelled) {
          setError("Не вдалося завантажити обговорення");
        }
      } finally {
        if (!cancelled) {
          setIsLoading(false);
        }
      }
    };

    fetchThread();

    return () => {
      cancelled = true;
    };
  }, [postId]);

  const handleSubmit = async (event) => {
    event.preventDefault();

    const text = replyText.trim();

    if (!text || !postId || isSending) {
      return;
    }

    try {
      setIsSending(true);
      setError("");

      await apiFetch("/api/social/posts", {
        method: "POST",
        body: {
          text,
          parentId: postId,
        },
      });

      setReplyText("");

      await loadThread();
      onReplyCreated?.(postId);
    } catch (requestError) {
      console.error("Failed to create social post reply:", requestError);
      setError("Не вдалося надіслати відповідь");
    } finally {
      setIsSending(false);
    }
  };

  if (!postId) {
    return null;
  }

  const userName = thread?.author?.name || "Користувач";

  return (
    <div
      className="social-post-thread__backdrop"
      data-swipe-ignore
      role="presentation"
      onClick={onClose}
    >
      <div
        className="social-post-thread"
        role="dialog"
        aria-modal="true"
        aria-label="Обговорення допису"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="social-post-thread__handle" />

        <header className="social-post-thread__header">
          <h2>Обговорення</h2>

          <button
            type="button"
            className="social-post-thread__close"
            onClick={onClose}
            aria-label="Закрити"
          >
            ×
          </button>
        </header>

        <div className="social-post-thread__body">
          {isLoading && (
            <p className="social-post-thread__status">Завантаження…</p>
          )}

          {!isLoading && error && (
            <p className="social-post-thread__status">{error}</p>
          )}

          {!isLoading && thread && (
            <>
              <article className="social-post-thread__root">
                <div className="social-post-thread__message">
                  <button
                    type="button"
                    className="social-post-thread__avatar"
                    onClick={() => onOpenProfile?.(thread.author?.id)}
                    aria-label={userName}
                  >
                    {thread.author?.avatarUrl ? (
                      <img src={thread.author.avatarUrl} alt="" />
                    ) : (
                      <span>{userName.charAt(0).toUpperCase()}</span>
                    )}
                  </button>

                  <div className="social-post-thread__message-content">
                    <button
                      type="button"
                      className="social-post-thread__author"
                      onClick={() => onOpenProfile?.(thread.author?.id)}
                    >
                      <strong>{userName}</strong>
                    </button>

                    <p>{thread.text}</p>
                  </div>
                </div>
              </article>

              <div className="social-post-thread__replies">
                {thread.replies?.map((reply) => {
                  const replyUserName = reply.author?.name || "Користувач";

                  return (
                    <article
                      key={reply.id}
                      className="social-post-thread__reply"
                    >
                      <div className="social-post-thread__message">
                        <button
                          type="button"
                          className="social-post-thread__avatar"
                          onClick={() => onOpenProfile?.(reply.author?.id)}
                          aria-label={replyUserName}
                        >
                          {reply.author?.avatarUrl ? (
                            <img src={reply.author.avatarUrl} alt="" />
                          ) : (
                            <span>{replyUserName.charAt(0).toUpperCase()}</span>
                          )}
                        </button>

                        <div className="social-post-thread__message-content">
                          <button
                            type="button"
                            className="social-post-thread__author"
                            onClick={() => onOpenProfile?.(reply.author?.id)}
                          >
                            <strong>{replyUserName}</strong>
                          </button>

                          <p>{reply.text}</p>
                        </div>
                      </div>
                    </article>
                  );
                })}

                {thread.replies?.length === 0 && (
                  <p className="social-post-thread__empty">
                    Відповідей ще немає. Будь першим.
                  </p>
                )}
              </div>
            </>
          )}
        </div>

        <form className="social-post-thread__composer" onSubmit={handleSubmit}>
          <textarea
            value={replyText}
            onChange={(event) => setReplyText(event.target.value)}
            placeholder="Написати відповідь…"
            maxLength={1000}
            rows={2}
            disabled={isSending}
          />

          <button type="submit" disabled={!replyText.trim() || isSending}>
            {isSending ? "Надсилаємо…" : "Відповісти"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default SocialPostThreadModal;
