import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";

import { apiFetch } from "../../../../../../shared/api/apiClient.js";
import Icon from "../../../../../../shared/components/Icon/Icon.jsx";
import useOverlayBack from "../../../../../../shared/hooks/useOverlayBack.js";
import { resolveAssetUrl } from "../../../../../../shared/utils/resolveAssetUrl.js";
import SocialPostActionsMenu from "../SocialPostActionsMenu/SocialPostActionsMenu.jsx";
import ThreadComment from "./components/ThreadComment/ThreadComment.jsx";

import {
  buildCommentTree,
  normalizeThreadItems,
} from "./utils/threadUtils.js";

import "./SocialPostThreadModal.css";

const SocialPostThreadModal = ({
  postId,
  activityId,
  onClose,
  onOpenProfile,
  onOpenKudosUsers,
  onThreadCountChange,
}) => {
  const [thread, setThread] = useState(null);
  const [replyText, setReplyText] = useState("");
  const [replyTarget, setReplyTarget] = useState(null);
  const [editingReply, setEditingReply] = useState(null);
  const [editReplyText, setEditReplyText] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isSending, setIsSending] = useState(false);
  const [error, setError] = useState("");  const [branchPath, setBranchPath] = useState([]);
  const bodyRef = useRef(null);
  const pendingReplyScrollTopRef = useRef(null);

  useLayoutEffect(() => {
    const pendingScrollTop = pendingReplyScrollTopRef.current;

    if (pendingScrollTop == null || !bodyRef.current) {
      return;
    }

    bodyRef.current.scrollTop = pendingScrollTop;
    pendingReplyScrollTopRef.current = null;
  }, [replyTarget]);

  const scrollToBottom = useCallback((behavior = "smooth") => {
    requestAnimationFrame(() => {
      bodyRef.current?.scrollTo({
        top: bodyRef.current.scrollHeight,
        behavior,
      });
    });
  }, []);

  const isActivityThread = Boolean(activityId);
  const isOpen = Boolean(postId || activityId);

  useOverlayBack(isOpen, onClose);

  useEffect(() => {
    if (isOpen) {
      return;
    }

    setBranchPath([]);
    setReplyTarget(null);
    setReplyText("");
    setEditingReply(null);
    setEditReplyText("");
    pendingReplyScrollTopRef.current = null;
  }, [isOpen]);

  const loadThread = useCallback(async () => {
    if (!isOpen) {
      return;
    }

    try {
      setIsLoading(true);
      setError("");

      const data = await apiFetch(
        isActivityThread
          ? `/api/social/activities/${activityId}/thread`
          : `/api/social/posts/${postId}`,
      );

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
      console.error("Failed to load social post thread:", requestError);
      setError("Не вдалося завантажити обговорення");
    } finally {
      setIsLoading(false);
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

    loadThread();
  }, [isOpen, loadThread]);

  const handleSubmit = async (event) => {
    event.preventDefault();

    const text = replyText.trim();

    if (!text || !isOpen || isSending) {
      return;
    }

    try {
      setIsSending(true);
      setError("");

      await apiFetch("/api/social/posts", {
        method: "POST",
        body: {
          text,
          parentId: replyTarget?.id || (isActivityThread ? null : postId),
          activityId: isActivityThread ? activityId : null,
        },
      });

      setReplyText("");
      setReplyTarget(null);

      await loadThread();
    } catch (requestError) {
      console.error("Failed to create social post reply:", requestError);
      setError("Не вдалося надіслати відповідь");
    } finally {
      setIsSending(false);
    }
  };

const handleReplyKudos = async (reply) => {
    if (!reply?.id || reply.isOwnPost) {
      return;
    }

    const nextHasKudos = !reply.hasKudos;

    try {
      const data = await apiFetch(`/api/social/posts/${reply.id}/kudos`, {
        method: nextHasKudos ? "POST" : "DELETE",
      });

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
    } catch (requestError) {
      console.error("Failed to update reply kudos:", requestError);
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

  const userName = thread?.author?.name || "Користувач";
  const formattedTime = thread?.createdAt
    ? new Intl.DateTimeFormat("uk-UA", {
        day: "numeric",
        month: "short",
        hour: "2-digit",
        minute: "2-digit",
      }).format(new Date(thread.createdAt))
    : "";

  const replies = thread?.replies || [];

  const rootParentId = isActivityThread ? null : postId;
  const sourceType = isActivityThread ? "activity" : "post";
  const containerId = isActivityThread ? activityId : postId;

  const normalizedReplies = useMemo(
    () =>
      normalizeThreadItems({
        items: replies,
        sourceType,
        containerId,
      }),
    [replies, sourceType, containerId],
  );

  const displayReplies = useMemo(
    () =>
      buildCommentTree(normalizedReplies, rootParentId),
    [normalizedReplies, rootParentId],
  );

  const activeBranchRoot =
    branchPath.length > 0
      ? branchPath[branchPath.length - 1]
      : null;

  const branchReplies = useMemo(() => {
    if (!activeBranchRoot) {
      return [];
    }

    return normalizedReplies
      .filter((reply) => reply.parentId === activeBranchRoot.id)
      .sort(
        (a, b) =>
          new Date(a.createdAt).getTime() -
          new Date(b.createdAt).getTime(),
      );
  }, [activeBranchRoot, normalizedReplies]);

  const getDirectRepliesCount = (commentId) =>
    normalizedReplies.filter((reply) => reply.parentId === commentId).length;

  const openBranch = (comment) => {
    setBranchPath((current) => {
      const existingIndex = current.findIndex(
        (item) => item.id === comment.id,
      );

      if (existingIndex !== -1) {
        return current.slice(0, existingIndex + 1);
      }

      return [...current, comment];
    });

    setReplyTarget(null);
    setReplyText("");
  };

  const isBranchView = branchPath.length > 0;


  const handleStartEdit = (comment) => {
    setEditingReply(comment);
    setEditReplyText(comment.text);
  };

  const handleCancelEdit = () => {
    setEditingReply(null);
    setEditReplyText("");
  };

  const handleStartReply = (comment) => {
    pendingReplyScrollTopRef.current =
      bodyRef.current?.scrollTop ?? null;

    setReplyTarget(comment);
    setReplyText(
      `@${comment.author?.name || "\u041A\u043E\u0440\u0438\u0441\u0442\u0443\u0432\u0430\u0447"} `,
    );
  };

  const renderThreadComment = (comment, visualDepth) => (
    <ThreadComment
      comment={comment}
      visualDepth={visualDepth}
      isEditing={editingReply?.id === comment.id}
      editText={editReplyText}
      onOpenProfile={onOpenProfile}
      onEdit={handleStartEdit}
      onDelete={handleDeleteReply}
      onKudos={handleReplyKudos}
      onOpenKudosUsers={onOpenKudosUsers}
      onReply={handleStartReply}
      onEditTextChange={setEditReplyText}
      onCancelEdit={handleCancelEdit}
      onSaveEdit={handleEditReply}
    />
  );

  if (!isOpen) {
    return null;
  }

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
          <div className="social-post-thread__title">
            {isBranchView && (
              <button
                type="button"
                className="social-post-thread__back"
                onClick={() => {
                  setBranchPath([]);
                  setReplyTarget(null);
                  setReplyText("");
                  requestAnimationFrame(() => {
                    if (bodyRef.current) bodyRef.current.scrollTop = 0;
                  });
                }}
                aria-label={"\u041D\u0430\u0437\u0430\u0434 \u0434\u043E \u043E\u0431\u0433\u043E\u0432\u043E\u0440\u0435\u043D\u043D\u044F"}
              >
                {"\u2190"}
              </button>
            )}
            <h2>{isBranchView ? "\u0412\u0456\u0434\u043F\u043E\u0432\u0456\u0434\u0456" : "\u041E\u0431\u0433\u043E\u0432\u043E\u0440\u0435\u043D\u043D\u044F"}</h2>
          </div>

          <button
            type="button"
            className="social-post-thread__close"
            onClick={onClose}
            aria-label="Закрити"
          >
            ×
          </button>
        </header>

        <div ref={bodyRef} className="social-post-thread__body">
          {isLoading && (
            <p className="social-post-thread__status">Завантаження…</p>
          )}

          {!isLoading && error && (
            <p className="social-post-thread__status">{error}</p>
          )}

          {!isLoading && thread && (
            <>
              {!isActivityThread && !isBranchView && (
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
              )}

              <div
                className={`social-post-thread__replies ${
                  isBranchView ? "social-post-thread__replies--branch" : ""
                }`}
              >
                {isBranchView ? (
                  <>
                    {branchPath.reduceRight(
                      (children, comment, index) => (
                        <div
                          key={comment.id}
                          className={
                            index === 0
                              ? "social-post-thread__nested-root"
                              : "social-post-thread__nested-level"
                          }
                        >
                          {renderThreadComment(comment, index)}

                          {children && (
                            <div className="social-post-thread__nested-children">
                              {children}
                            </div>
                          )}
                        </div>
                      ),
                      <div className="social-post-thread__nested-tail">
                        {branchReplies.map((reply) => {
                          const repliesCount = getDirectRepliesCount(reply.id);

                          return (
                            <div
                              key={reply.id}
                              className="social-post-thread__nested-tail-node"
                            >
                              {renderThreadComment(reply, branchPath.length)}

                              {repliesCount > 0 && (
                                <button
                                  type="button"
                                  className="social-post-thread__branch-toggle"
                                  onClick={() => openBranch(reply)}
                                >
                                  {`${repliesCount} ${
                                    repliesCount === 1
                                      ? "\u0432\u0456\u0434\u043f\u043e\u0432\u0456\u0434\u044c"
                                      : "\u0432\u0456\u0434\u043f\u043e\u0432\u0456\u0434\u0456"
                                  }`}
                                </button>
                              )}
                            </div>
                          );
                        })}
                      </div>,
                    )}

                    {branchReplies.length === 0 && (
                      <p className="social-post-thread__empty">
                        {"\u0412\u0456\u0434\u043f\u043e\u0432\u0456\u0434\u0435\u0439 \u0449\u0435 \u043d\u0435\u043c\u0430\u0454."}
                      </p>
                    )}
                  </>
                ) : (
                  <>
                    {displayReplies.map((group) => (
                      <div
                        key={group.root.id}
                        className="social-post-thread__tree-group"
                      >
                        <div className="social-post-thread__tree-root">
                          {renderThreadComment(group.root, 0)}
                        </div>

                        {group.repliesCount > 0 && (
                          <button
                            type="button"
                            className="social-post-thread__branch-toggle"
                            onClick={() => openBranch(group.root)}
                          >
                            {`${group.repliesCount} ${
                              group.repliesCount === 1
                                ? "\u0432\u0456\u0434\u043f\u043e\u0432\u0456\u0434\u044c"
                                : "\u0432\u0456\u0434\u043f\u043e\u0432\u0456\u0434\u0456"
                            }`}
                          </button>
                        )}
                      </div>
                    ))}

                    {thread.replies?.length === 0 && (
                      <p className="social-post-thread__empty">
                        {isActivityThread
                          ? "\u041a\u043e\u043c\u0435\u043d\u0442\u0430\u0440\u0456\u0432 \u0449\u0435 \u043d\u0435\u043c\u0430\u0454. \u0411\u0443\u0434\u044c\u0442\u0435 \u043f\u0435\u0440\u0448\u0438\u043c."
                          : "\u0412\u0456\u0434\u043f\u043e\u0432\u0456\u0434\u0435\u0439 \u0449\u0435 \u043d\u0435\u043c\u0430\u0454. \u0411\u0443\u0434\u044c \u043f\u0435\u0440\u0448\u0438\u043c."}
                      </p>
                    )}
                  </>
                )}
              </div>
            </>
          )}
        </div>

        <form className="social-post-thread__composer" onSubmit={handleSubmit}>
          <div
            className={`social-post-thread__replying-to ${
              replyTarget
                ? "social-post-thread__replying-to--visible"
                : "social-post-thread__replying-to--empty"
            }`}
          >
            {replyTarget ? (
              <>
                <span>
                  {"\u0412\u0456\u0434\u043f\u043e\u0432\u0456\u0434\u044c \u0434\u043b\u044f "}
                  {replyTarget.author?.name || "\u041a\u043e\u0440\u0438\u0441\u0442\u0443\u0432\u0430\u0447"}
                </span>

                <button
                  type="button"
                  onClick={() => {
                    setReplyTarget(null);
                    setReplyText("");
                  }}
                  aria-label={"\u0421\u043a\u0430\u0441\u0443\u0432\u0430\u0442\u0438 \u0432\u0456\u0434\u043f\u043e\u0432\u0456\u0434\u044c"}
                >
                  ?
                </button>
              </>
            ) : (
              <span aria-hidden="true">&nbsp;</span>
            )}
          </div>

          <textarea
            value={replyText}
            onChange={(event) => setReplyText(event.target.value)}
            placeholder={
              isActivityThread && !replyTarget
                ? "Написати коментар…"
                : "Написати відповідь…"
            }
            maxLength={1000}
            rows={2}
            disabled={isSending}
          />

          <button type="submit" disabled={!replyText.trim() || isSending}>
            {isSending
              ? "Надсилаємо…"
              : isActivityThread && !replyTarget
                ? "Коментувати"
                : "Відповісти"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default SocialPostThreadModal;
