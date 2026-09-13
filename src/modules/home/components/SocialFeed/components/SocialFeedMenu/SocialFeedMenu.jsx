import { ProfileIcon } from "../../../../../../shared/components/AppNavigation/NavigationIcons.jsx";
import "./SocialFeedMenu.css";

const SocialFeedMenu = ({
  activity,
  isUnfollowing = false,
  isUpdatingNotifications = false,
  notifyActivity = false,
  onClose,
  onOpenProfile,
  onToggleNotifications,
  onUnfollow,
}) => {
  if (!activity) {
    return null;
  }

  return (
    <div
      className="social-feed-menu__backdrop"
      role="presentation"
      onClick={onClose}
    >
      <div
        className="social-feed-menu"
        role="dialog"
        aria-modal="true"
        aria-label="Дії з активністю"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="social-feed-menu__handle" />

        <button
          type="button"
          className="social-feed-menu__item"
          onClick={onOpenProfile}
        >
          <span className="social-feed-menu__item-icon social-feed-menu__item-icon--profile">
  <ProfileIcon />
</span>

          <span>
            <strong>Перейти до профілю</strong>
            <small>Переглянути профіль користувача</small>
          </span>
        </button>

        {!activity.isOwnActivity && (
          <button
            type="button"
            className="social-feed-menu__item"
            disabled={isUpdatingNotifications}
            onClick={onToggleNotifications}
          >
            <span className="social-feed-menu__item-icon social-feed-menu__item-icon--notification">
              {notifyActivity ? (
                <svg viewBox="0 0 24 24" aria-hidden="true">
                  <path d="M18 8a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9" />
                  <path d="M10 21h4" />
                </svg>
              ) : (
                <svg viewBox="0 0 24 24" aria-hidden="true">
                  <path d="M18 8a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9" />
                  <path d="M10 21h4" />
                  <path d="M4 4l16 16" />
                </svg>
              )}
            </span>

            <span>
              <strong>
                {isUpdatingNotifications
                  ? "Зберігаємо..."
                  : notifyActivity
                  ? "Не сповіщати"
                  : "Увімкнути сповіщення"}
              </strong>

              <small>
                {notifyActivity
                ? "Не отримувати сповіщення від цього користувача"
                : "Знову отримувати сповіщення від цього користувача"}
              </small>
            </span>
          </button>
        )}

        {!activity.isOwnActivity && (
          <button
            type="button"
            className="social-feed-menu__item social-feed-menu__item--danger"
            disabled={isUnfollowing}
            onClick={onUnfollow}
          >
            <span className="social-feed-menu__item-icon">−</span>

            <span>
              <strong>
                {isUnfollowing ? "Відписуємося..." : "Відписатися"}
              </strong>

              <small>
                Більше не бачити активності цього користувача
              </small>
            </span>
          </button>
        )}

        <button
          type="button"
          className="social-feed-menu__cancel"
          onClick={onClose}
        >
          Скасувати
        </button>
      </div>
    </div>
  );
};

export default SocialFeedMenu;