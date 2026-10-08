import { resolveAssetUrl } from "../../../../../../../../shared/utils/resolveAssetUrl.js";

const ThreadRootPost = ({ thread, onOpenProfile }) => {
  if (!thread) {
    return null;
  }

  const userName =
    thread.author?.name ||
    "\u041a\u043e\u0440\u0438\u0441\u0442\u0443\u0432\u0430\u0447";

  const formattedTime = thread.createdAt
    ? new Intl.DateTimeFormat("uk-UA", {
        day: "numeric",
        month: "short",
        hour: "2-digit",
        minute: "2-digit",
      }).format(new Date(thread.createdAt))
    : "";

  return (
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
  );
};

export default ThreadRootPost;
