import { memo } from "react";

import Icon from "../../../../../../shared/components/Icon/Icon.jsx";
import KudosAction from "../KudosAction/KudosAction.jsx";
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
  onOpenKudosUsers,
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
        <KudosAction
          item={activity}
          onKudos={onKudos}
          onOpenKudosUsers={onOpenKudosUsers}
          isOwn={activity.isOwnActivity}
          openOnOwnClick
          iconWrapper
        />

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
