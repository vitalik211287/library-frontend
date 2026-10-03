import { useCallback, useEffect, useState } from "react";

import { apiFetch } from "../../../../../../shared/api/apiClient.js";
import useOverlayBack from "../../../../../../shared/hooks/useOverlayBack.js";
import { resolveAssetUrl } from "../../../../../../shared/utils/resolveAssetUrl.js";
import SocialPostActionsMenu from "../SocialPostActionsMenu/SocialPostActionsMenu.jsx";

import "./SocialPostThreadModal.css";

const SocialPostThreadModal = ({
  postId,
  onClose,
  onOpenProfile,
  onReplyCreated,
}) => {
  const [thread, setThread] = useState(null);
  const [replyText, setReplyText] = useState("");
  const [replyTarget, setReplyTarget] = useState(null);
  const [editingReply, setEditingReply] = useState(null);
  const [editReplyText, setEditReplyText] = useState("");
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
          parentId: replyTarget?.id || postId,
        },
      });

      setReplyText("");
      setReplyTarget(null);

      await loadThread();
      onReplyCreated?.(postId);
    } catch (requestError) {
      console.error("Failed to create social post reply:", requestError);
      setError("Не вдалося надіслати відповідь");
    } finally {
      setIsSending(false);
    }
  };

  const handleEditReply = async (reply) => {
    const text = editReplyText.trim();

    if (!text || !reply?.id) {
      return;
    }

    try {
      setError("");

      await apiFetch(`/api/social/posts/${reply.id}`, {
        method: "PATCH",
        body: {
          text,
          bookId: reply.book?.id || null,
        },
      });

      setEditingReply(null);
      setEditReplyText("");
      await loadThread();
    } catch (requestError) {
      console.error("Failed to update social post reply:", requestError);
      setError("\u041d\u0435 \u0432\u0434\u0430\u043b\u043e\u0441\u044f \u0432\u0456\u0434\u0440\u0435\u0434\u0430\u0433\u0443\u0432\u0430\u0442\u0438 \u0432\u0456\u0434\u043f\u043e\u0432\u0456\u0434\u044c");
    }
  };

  const handleDeleteReply = async (reply) => {
    if (!reply?.id) {
      return;
    }

    try {
      setError("");

      await apiFetch(`/api/social/posts/${reply.id}`, {
        method: "DELETE",
      });

      if (replyTarget?.id === reply.id) {
        setReplyTarget(null);
        setReplyText("");
      }

      if (editingReply?.id === reply.id) {
        setEditingReply(null);
        setEditReplyText("");
      }

      await loadThread();
    } catch (requestError) {
      console.error("Failed to delete social post reply:", requestError);
      setError("\u041d\u0435 \u0432\u0434\u0430\u043b\u043e\u0441\u044f \u0432\u0438\u0434\u0430\u043b\u0438\u0442\u0438 \u0432\u0456\u0434\u043f\u043e\u0432\u0456\u0434\u044c");
    }
  };

  if (!postId) {
    return null;
  }

  const userName = thread?.author?.name || "Користувач";
  const formattedTime = thread?.createdAt
    ? new Intl.DateTimeFormat("uk-UA", {
        day: "numeric",
        month: "short",
        hour: "2-digit",
        minute: "2-digit",
      }).format(new Date(thread.createdAt))
    : "";

  const replyById = new Map(
    (thread?.replies || []).map((reply) => [reply.id, reply]),
  );

  const getReplyDepth = (reply) => {
    let depth = 0;
    let current = reply;

    while (current?.parentId && current.parentId !== postId) {
      depth += 1;
      current = replyById.get(current.parentId);

      if (!current) {
        break;
      }
    }

    return Math.min(depth, 1);
  };

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

                    {formattedTime && (
                      <span className="social-post-thread__time">
                        {formattedTime}
                      </span>
                    )}

                    <p>{thread.text}</p>

                    {thread.book && (
                      <div className="social-post-thread__book">
                        {thread.book.coverUrl && (
                          <img
                            src={resolveAssetUrl(thread.book.coverUrl)}
                            alt=""
                          />
                        )}

                        <span>
                          <strong>{thread.book.title}</strong>
                          <small>{thread.book.author}</small>
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              </article>

              <div className="social-post-thread__replies">
                {thread.replies?.map((reply) => {
                  const replyUserName = reply.author?.name || "Користувач";

                  return (
                    <article
                      key={reply.id}
                      className={`social-post-thread__reply ${
                        getReplyDepth(reply) > 0
                          ? "social-post-thread__reply--nested"
                          : ""
                      }`}
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
                          <div className="social-post-thread__reply-header">
                            <button
                              type="button"
                              className="social-post-thread__author"
                              onClick={() => onOpenProfile?.(reply.author?.id)}
                            >
                              <strong>{replyUserName}</strong>
                            </button>

                            {reply.isOwnPost && (
                              <SocialPostActionsMenu
                                onEdit={() => {
                                  setEditingReply(reply);
                                  setEditReplyText(reply.text);
                                }}
                                onDelete={() => handleDeleteReply(reply)}
                              />
                            )}
                          </div>

                          {editingReply?.id === reply.id ? (
                            <div className="social-post-thread__edit">
                              <textarea
                                value={editReplyText}
                                maxLength={1000}
                                autoFocus
                                onChange={(event) =>
                                  setEditReplyText(event.target.value)
                                }
                              />

                              <div className="social-post-thread__edit-actions">
                                <button
                                  type="button"
                                  onClick={() => {
                                    setEditingReply(null);
                                    setEditReplyText("");
                                  }}
                                >
                                  {"\u0421\u043a\u0430\u0441\u0443\u0432\u0430\u0442\u0438"}
                                </button>

                                <button
                                  type="button"
                                  disabled={!editReplyText.trim()}
                                  onClick={() => handleEditReply(reply)}
                                >
                                  {"\u0417\u0431\u0435\u0440\u0435\u0433\u0442\u0438"}
                                </button>
                              </div>
                            </div>
                          ) : (
                            <>
                              <p>{reply.text}</p>

                              <button
                                type="button"
                                className="social-post-thread__reply-action"
                                onClick={() => {
                                  setReplyTarget(reply);
                                  setReplyText(`@${replyUserName} `);
                                }}
                              >
                                {"\u0412\u0456\u0434\u043f\u043e\u0432\u0456\u0441\u0442\u0438"}
                              </button>
                            </>
                          )}
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
          {replyTarget && (
            <div className="social-post-thread__replying-to">
              <span>Відповідь для {replyTarget.author?.name || "Користувач"}</span>

              <button
                type="button"
                onClick={() => {
                  setReplyTarget(null);
                  setReplyText("");
                }}
                aria-label="Скасувати відповідь"
              >
                ×
              </button>
            </div>
          )}

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
