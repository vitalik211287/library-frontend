import { memo } from "react";

import Icon from "../../../../../../shared/components/Icon/Icon.jsx";
import HomePanel from "../../../HomePanel/HomePanel.jsx";

const SocialPostCard = ({
  post,
  formattedTime,
  onOpenProfile,
  onOpenThread,
  onOpenBook,
  onKudos,
}) => {
  const userName = post.user?.name || "\u041a\u043e\u0440\u0438\u0441\u0442\u0443\u0432\u0430\u0447";

  return (
    <HomePanel
      as="article"
      id={`post-${post.id}`}
      className="social-feed-card social-post-card"
    >
      <header className="social-feed-card__header">
        <button
          type="button"
          className="social-feed-card__user"
          onClick={() => onOpenProfile(post.user?.id)}
        >
          <div className="social-feed-card__avatar">
            {post.user?.avatarUrl ? (
              <img
                src={post.user.avatarUrl}
                alt={userName}
                loading="lazy"
                decoding="async"
              />
            ) : (
              <span>{userName.charAt(0).toUpperCase()}</span>
            )}
          </div>

          <div className="social-feed-card__user-info">
            <strong>{userName}</strong>
            <span>{formattedTime}</span>
          </div>
        </button>
      </header>

      <div className="social-post-card__content">
        <p>{post.text}</p>

        {post.book && (
          <button
            type="button"
            className="social-post-card__book"
            onClick={() => onOpenBook(post.book)}
          >
            {post.book.coverUrl && (
              <img
                src={post.book.coverUrl}
                alt=""
                loading="lazy"
                decoding="async"
              />
            )}

            <span>
              <strong>{post.book.title}</strong>
              <small>{post.book.author}</small>
            </span>
          </button>
        )}
      </div>

      <div className="social-feed-card__actions">
        <button
          type="button"
          className={post.hasKudos ? "social-feed-card__action social-feed-card__action--active" : "social-feed-card__action"}
          disabled={post.isOwnPost}
          onClick={() => onKudos(post)}
          aria-label={"\u041f\u0456\u0434\u0442\u0440\u0438\u043c\u0430\u0442\u0438"}
        >
          <Icon name="clap" />
          <span>{post.kudosCount ?? 0}</span>
        </button>

        <button
          type="button"
          className="social-feed-card__action"
          onClick={() => onOpenThread(post)}
          aria-label={"\u0412\u0456\u0434\u043f\u043e\u0432\u0456\u0434\u0456"}
        >
          <Icon name="comment" />
          <span>{post.repliesCount ?? 0}</span>
        </button>

        <button
          type="button"
          className="social-feed-card__action"
          disabled
          aria-label={"\u041f\u043e\u0434\u0456\u043b\u0438\u0442\u0438\u0441\u044f"}
        >
          <Icon name="share" />
          <span>
            {"\u041f\u043e\u0434\u0456\u043b\u0438\u0442\u0438\u0441\u044f"}
          </span>
        </button>
      </div>
    </HomePanel>
  );
};

export default memo(SocialPostCard);
