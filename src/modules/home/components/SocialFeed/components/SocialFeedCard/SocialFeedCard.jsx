import { memo } from "react";

import Icon from "../../../../../../shared/components/Icon/Icon.jsx";
import HomePanel from "../../../HomePanel/HomePanel.jsx";
import SocialFeedEvent from "../SocialFeedEvent/SocialFeedEvent.jsx";

const SocialFeedCard = ({
  activity,
  formattedTime,
  onOpenProfile,
  onOpenMenu,
  onOpenBook,
  onOpenAchievement,
  onKudos,
  onComment,
  onShare,
}) => {
  const userName = activity.user?.name || "Користувач";

  return (
    <HomePanel
      as="article"
      id={`activity-${activity.id}`}
      className="social-feed-card"
    >
      <header className="social-feed-card__header">
        <button
          type="button"
          className="social-feed-card__user"
          onClick={() => onOpenProfile(activity.user?.id)}
        >
          <div className="social-feed-card__avatar">
            {activity.user?.avatarUrl ? (
              <img
                src={activity.user.avatarUrl}
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

        <button
          type="button"
          className="social-feed-card__more"
          aria-label="Додаткові дії"
          onClick={() => onOpenMenu(activity)}
        >
          <Icon name="more-horizontal" />
        </button>
      </header>

      <SocialFeedEvent
        activity={activity}
        onOpenBook={onOpenBook}
        onOpenAchievement={onOpenAchievement}
      />

      <div className="social-feed-card__actions">
        <button
          type="button"
          className={
            activity.hasKudos
              ? "social-feed-card__action social-feed-card__action--active"
              : "social-feed-card__action"
          }
          disabled={activity.isOwnActivity}
          onClick={() => onKudos(activity)}
          aria-label="Підтримати"
        >
          <span className="social-feed-card__clap">
            <Icon name="clap" />
          </span>

          <span>{activity.kudosCount ?? 0}</span>
        </button>

        <button
          type="button"
          className="social-feed-card__action social-feed-card__action--comment"
          onClick={() => onComment(activity)}
          aria-label="Коментувати"
        >
          <Icon name="comment" />
          <span>
            {activity.commentsCount > 0
              ? activity.commentsCount
              : "Коментувати"}
          </span>
        </button>

        <button
          type="button"
          className="social-feed-card__action"
          onClick={() => onShare(activity)}
          aria-label="Поділитися"
        >
          <Icon name="share" />
          <span>Поділитися</span>
        </button>
      </div>
    </HomePanel>
  );
};

export default memo(SocialFeedCard);
