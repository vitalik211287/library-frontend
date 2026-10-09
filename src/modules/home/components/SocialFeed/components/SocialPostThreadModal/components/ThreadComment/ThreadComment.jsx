import KudosAction from "../../../KudosAction/KudosAction.jsx";
import SocialPostActionsMenu from "../../../SocialPostActionsMenu/SocialPostActionsMenu.jsx";

const ThreadComment = ({
  comment,
  visualDepth = 0,
  isEditing = false,
  editText = "",
  branchToggle = null,
  onOpenProfile,
  onEdit,
  onDelete,
  onKudos,
  onOpenKudosUsers,
  onReply,
  onEditTextChange,
  onCancelEdit,
  onSaveEdit,
}) => {
  if (!comment) {
    return null;
  }

  const replyUserName =
    comment.author?.name || "\u041A\u043E\u0440\u0438\u0441\u0442\u0443\u0432\u0430\u0447";

  const replyFormattedTime = comment.createdAt
    ? new Intl.DateTimeFormat("uk-UA", {
        day: "numeric",
        month: "short",
        hour: "2-digit",
        minute: "2-digit",
      }).format(new Date(comment.createdAt))
    : "";

  return (
    <article
      className={`social-post-thread__reply ${
        visualDepth > 0
          ? `social-post-thread__reply--nested social-post-thread__reply--depth-${visualDepth}`
          : ""
      }`}
      data-comment-id={comment.id}
    >
      <div className="social-post-thread__message">
        <button
          type="button"
          className="social-post-thread__avatar"
          onClick={() => onOpenProfile?.(comment.author?.id)}
          aria-label={replyUserName}
        >
          {comment.author?.avatarUrl ? (
            <img src={comment.author.avatarUrl} alt="" />
          ) : (
            <span>{replyUserName.charAt(0).toUpperCase()}</span>
          )}
        </button>

        <div className="social-post-thread__message-content">
          <div className="social-post-thread__reply-header">
            <button
              type="button"
              className="social-post-thread__author"
              onClick={() => onOpenProfile?.(comment.author?.id)}
            >
              <strong>{replyUserName}</strong>
            </button>

            {comment.isOwnPost && (
              <SocialPostActionsMenu
                onEdit={() => onEdit?.(comment)}
                onDelete={() => onDelete?.(comment)}
              />
            )}
          </div>

          {replyFormattedTime && (
            <span className="social-post-thread__time">
              {replyFormattedTime}
            </span>
          )}

          {isEditing ? (
            <div className="social-post-thread__edit">
              <textarea
                value={editText}
                maxLength={1000}
                autoFocus
                onChange={(event) =>
                  onEditTextChange?.(event.target.value)
                }
              />

              <div className="social-post-thread__edit-actions">
                <button type="button" onClick={onCancelEdit}>
                  {"\u0421\u043A\u0430\u0441\u0443\u0432\u0430\u0442\u0438"}
                </button>

                <button
                  type="button"
                  disabled={!editText.trim()}
                  onClick={() => onSaveEdit?.(comment)}
                >
                  {"\u0417\u0431\u0435\u0440\u0435\u0433\u0442\u0438"}
                </button>
              </div>
            </div>
          ) : (
            <>
              <p>{comment.text}</p>

              <div className="social-post-thread__reply-actions">
                <KudosAction
                  item={{ ...comment, kind: "post" }}
                  onKudos={onKudos}
                  onOpenKudosUsers={onOpenKudosUsers}
                  isOwn={comment.isOwnPost}
                />

                <button
                  type="button"
                  className="social-post-thread__reply-action"
                  onClick={() => onReply?.(comment)}
                >
                  {"\u0412\u0456\u0434\u043F\u043E\u0432\u0456\u0441\u0442\u0438"}
                </button>
              </div>
            </>
          )}
        </div>
      </div>

      {branchToggle}
    </article>
  );
};

export default ThreadComment;
