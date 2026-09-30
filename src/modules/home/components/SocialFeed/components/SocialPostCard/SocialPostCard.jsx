import { memo } from "react";

import Icon from "../../../../../../shared/components/Icon/Icon.jsx";
import HomePanel from "../../../HomePanel/HomePanel.jsx";

const SocialPostCard = ({
  post,
  formattedTime,
  onOpenProfile,
  onOpenThread,
  onOpenBook,
}) => {
  const userName = post.user?.name || "Користувач";

  
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
          className="social-feed-card__action"
          disabled
          aria-label="ідтримати"
        >
          <Icon name="clap" />
          <span>0</span>
        </button>

        <button
          type="button"
          className="social-feed-card__action"
          onClick={() => onOpenThread(post)}
          aria-label="ідповіді"
        >
          <Icon name="comment" />
          <span>{post.repliesCount ?? 0}</span>
        </button>

        <button
          type="button"
          className="social-feed-card__action"
          disabled
          aria-label="оділитися"
        >
          <Icon name="share" />
          <span>оділитися</span>
        </button>
      </div>
    </HomePanel>
  );
};

export default memo(SocialPostCard);


