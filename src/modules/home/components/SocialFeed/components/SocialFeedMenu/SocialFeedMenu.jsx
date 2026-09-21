import { ProfileIcon } from "../../../../../../shared/components/AppNavigation/NavigationIcons.jsx";
import "./SocialFeedMenu.css";
import Icon from "../../../../../../shared/components/Icon/Icon.jsx";
import useOverlayBack from "../../../../../../shared/hooks/useOverlayBack.js";

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
  useOverlayBack(Boolean(activity), onClose);

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
              {notifyActivity ? <Icon name="bell" /> : <Icon name="bell-off" />}
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

              <small>Більше не бачити активності цього користувача</small>
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
