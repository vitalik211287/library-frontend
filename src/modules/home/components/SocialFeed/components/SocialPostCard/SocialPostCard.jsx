import { memo, useState } from "react";

import Icon from "../../../../../../shared/components/Icon/Icon.jsx";
import { resolveAssetUrl } from "../../../../../../shared/utils/resolveAssetUrl.js";
import HomePanel from "../../../HomePanel/HomePanel.jsx";

const SocialPostCard = ({
  post,
  formattedTime,
  onOpenProfile,
  onOpenThread,
  onOpenBook,
  onKudos,
  onOpenKudosUsers,
  onEdit,
  onDelete,
}) => {
  const userName =
    post.user?.name ||
    "\u041a\u043e\u0440\u0438\u0441\u0442\u0443\u0432\u0430\u0447";

  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editText, setEditText] = useState(post.text);

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
        {post.isOwnPost && (
          <div className="social-post-card__menu">
            <button
              type="button"
              className="social-post-card__menu-button"
              aria-label="Дії з дописом"
              aria-expanded={isMenuOpen}
              onClick={() => setIsMenuOpen((current) => !current)}
            >
              <span>•••</span>
            </button>

            {isMenuOpen && (
              <div className="social-post-card__menu-dropdown">
                <button
                  type="button"
                  onClick={() => {
                    setIsMenuOpen(false);
                    setEditText(post.text);
                    setIsEditing(true);
                  }}
                >
                  Редагувати
                </button>

                <button
                  type="button"
                  className="social-post-card__menu-delete"
                  onClick={() => {
                    setIsMenuOpen(false);
                    onDelete(post);
                  }}
                >
                  Видалити
                </button>
              </div>
            )}
          </div>
        )}
      </header>

      <div className="social-post-card__content">
        {isEditing ? (
          <div className="social-post-card__edit">
            <textarea
              value={editText}
              maxLength={1000}
              autoFocus
              onChange={(event) => setEditText(event.target.value)}
            />

            <div className="social-post-card__edit-actions">
              <button
                type="button"
                onClick={() => {
                  setEditText(post.text);
                  setIsEditing(false);
                }}
              >
                Скасувати
              </button>

              <button
                type="button"
                disabled={!editText.trim()}
                onClick={async () => {
                  await onEdit(post, editText.trim());
                  setIsEditing(false);
                }}
              >
                Зберегти
              </button>
            </div>
          </div>
        ) : (
          <p>{post.text}</p>
        )}

        {post.book && (
          <button
            type="button"
            className="social-post-card__book"
            onClick={() => onOpenBook(post.book)}
          >
            {post.book.coverUrl && (
              <img
                src={resolveAssetUrl(post.book.coverUrl)}
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
        <div
          className={
            post.hasKudos
              ? "social-feed-card__action social-feed-card__action--active"
              : "social-feed-card__action"
          }
        >
          <button
            type="button"
            disabled={post.isOwnPost}
            onClick={() => onKudos(post)}
            aria-label={
              "\u041f\u0456\u0434\u0442\u0440\u0438\u043c\u0430\u0442\u0438"
            }
          >
            <Icon name="clap" />
          </button>

          <button
            type="button"
            disabled={(post.kudosCount ?? 0) === 0}
            onClick={() => onOpenKudosUsers(post)}
            aria-label={
              "\u0425\u0442\u043e \u043f\u0456\u0434\u0442\u0440\u0438\u043c\u0430\u0432 \u0434\u043e\u043f\u0438\u0441"
            }
          >
            {post.kudosCount ?? 0}
          </button>
        </div>

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
          aria-label={
            "\u041f\u043e\u0434\u0456\u043b\u0438\u0442\u0438\u0441\u044f"
          }
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
