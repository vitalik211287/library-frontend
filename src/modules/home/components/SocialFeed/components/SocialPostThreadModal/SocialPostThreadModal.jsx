import { useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";

import useOverlayBack from "../../../../../../shared/hooks/useOverlayBack.js";
import ThreadComment from "./components/ThreadComment/ThreadComment.jsx";
import ThreadBranchView from "./components/ThreadBranchView/ThreadBranchView.jsx";
import ThreadRootList from "./components/ThreadRootList/ThreadRootList.jsx";
import ThreadRootPost from "./components/ThreadRootPost/ThreadRootPost.jsx";
import ThreadComposer from "./components/ThreadComposer/ThreadComposer.jsx";
import ThreadHeader from "./components/ThreadHeader/ThreadHeader.jsx";
import useSocialThread from "./hooks/useSocialThread.js";

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
  const [replyText, setReplyText] = useState("");
  const [replyTarget, setReplyTarget] = useState(null);
  const [editingReply, setEditingReply] = useState(null);
  const [editReplyText, setEditReplyText] = useState("");
  const [branchPath, setBranchPath] = useState([]);

  const {
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
  } = useSocialThread({
    postId,
    activityId,
    onThreadCountChange,
  });

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

  const handleSubmit = async (event) => {
    event.preventDefault();

    const success = await createReply({
      text: replyText,
      parentId:
        replyTarget?.id ||
        (isActivityThread ? null : postId),
    });

    if (success) {
      setReplyText("");
      setReplyTarget(null);
    }
  };

  const handleReplyKudos = async (reply) => {
    await toggleReplyKudos(reply);
  };

  const handleEditReply = async (reply) => {
    const success = await updateReply(
      reply,
      editReplyText,
    );

    if (success) {
      setEditingReply(null);
      setEditReplyText("");
    }
  };

  const handleDeleteReply = async (reply) => {
    const success = await deleteReply(reply);

    if (!success) {
      return;
    }

    if (replyTarget?.id === reply.id) {
      setReplyTarget(null);
      setReplyText("");
    }

    if (editingReply?.id === reply.id) {
      setEditingReply(null);
      setEditReplyText("");
    }
  };

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

  const handleBackToThread = () => {
    setBranchPath([]);
    setReplyTarget(null);
    setReplyText("");

    requestAnimationFrame(() => {
      if (bodyRef.current) {
        bodyRef.current.scrollTop = 0;
      }
    });
  };


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

        <ThreadHeader
          isBranchView={isBranchView}
          onBack={handleBackToThread}
          onClose={onClose}
        />

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
                <ThreadRootPost
                  thread={thread}
                  onOpenProfile={onOpenProfile}
                />
              )}

              <div
                className={`social-post-thread__replies ${
                  isBranchView ? "social-post-thread__replies--branch" : ""
                }`}
              >
                {isBranchView ? (
                  <ThreadBranchView
                    branchPath={branchPath}
                    branchReplies={branchReplies}
                    getDirectRepliesCount={getDirectRepliesCount}
                    onOpenBranch={openBranch}
                    renderComment={renderThreadComment}
                  />
                ) : (
                  <ThreadRootList
                    displayReplies={displayReplies}
                    repliesCount={thread.replies?.length ?? 0}
                    isActivityThread={isActivityThread}
                    onOpenBranch={openBranch}
                    renderComment={renderThreadComment}
                  />
                )}
              </div>
            </>
          )}
        </div>

        <ThreadComposer
          replyTarget={replyTarget}
          replyText={replyText}
          isSending={isSending}
          isActivityThread={isActivityThread}
          onReplyTextChange={setReplyText}
          onCancelReply={() => {
            setReplyTarget(null);
            setReplyText("");
          }}
          onSubmit={handleSubmit}
        />
      </div>
    </div>
  );
};

export default SocialPostThreadModal;
