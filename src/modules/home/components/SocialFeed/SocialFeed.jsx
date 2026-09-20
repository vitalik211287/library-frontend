import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";

import { apiFetch } from "../../../../shared/api/apiClient.js";
import Icon from "../../../../shared/components/Icon/Icon.jsx";

import HomePanel from "../HomePanel/HomePanel.jsx";
import SocialFeedMenu from "./components/SocialFeedMenu/SocialFeedMenu.jsx";
import SocialFeedEvent from "./components/SocialFeedEvent/SocialFeedEvent.jsx";
import SocialBookModal from "./components/SocialBookModal/SocialBookModal.jsx";
import "./SocialFeed.css";

const activityDateFormatter = new Intl.DateTimeFormat("uk-UA", {
  day: "2-digit",
  month: "2-digit",
  hour: "2-digit",
  minute: "2-digit",
});

const SocialFeed = ({ limit = null, showViewAll = false }) => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const linkedActivityId = searchParams.get("activityId");

  const [activities, setActivities] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [menuActivity, setMenuActivity] = useState(null);
  const [selectedBook, setSelectedBook] = useState(null);
  const [isUnfollowing, setIsUnfollowing] = useState(false);
  const [notifyActivity, setNotifyActivity] = useState(false);
  const [isUpdatingNotifications, setIsUpdatingNotifications] = useState(false);

  useEffect(() => {
    let isActive = true;

    const loadFeed = async () => {
      try {
        setIsLoading(true);

        const data = await apiFetch("/api/social/feed");

        if (isActive) {
          setActivities(Array.isArray(data?.activities) ? data.activities : []);
        }
      } catch (error) {
        console.error("Load social feed error:", error);

        if (isActive) {
          setActivities([]);
        }
      } finally {
        if (isActive) {
          setIsLoading(false);
        }
      }
    };

    loadFeed();

    return () => {
      isActive = false;
    };
  }, []);

  useEffect(() => {
    if (!linkedActivityId || isLoading) {
      return;
    }

    requestAnimationFrame(() => {
      document.getElementById(`activity-${linkedActivityId}`)?.scrollIntoView({
        behavior: "smooth",
        block: "center",
      });
    });
  }, [linkedActivityId, isLoading, activities]);

  const handleKudos = async (activity) => {
    if (!activity?.id || activity.isOwnActivity) {
      return;
    }

    const nextHasKudos = !activity.hasKudos;

    try {
      const data = await apiFetch(
        `/api/social/activities/${activity.id}/kudos`,
        {
          method: nextHasKudos ? "POST" : "DELETE",
        },
      );

      setActivities((current) =>
        current.map((item) =>
          item.id === activity.id
            ? {
                ...item,
                hasKudos: Boolean(data?.hasKudos),
                kudosCount: Number(data?.kudosCount) || 0,
              }
            : item,
        ),
      );
    } catch (error) {
      console.error("Update feed kudos error:", error);
    }
  };

  const handleToggleNotifications = async () => {
    const userId = menuActivity?.user?.id;

    if (!userId || menuActivity?.isOwnActivity) {
      return;
    }

    const nextValue = !notifyActivity;

    try {
      setIsUpdatingNotifications(true);

      const data = await apiFetch(`/api/users/${userId}/social-preferences`, {
        method: "PATCH",
        body: {
          notifyActivity: nextValue,
        },
      });

      setNotifyActivity(Boolean(data?.notifyActivity));
    } catch (error) {
      console.error("Update social preference error:", error);
    } finally {
      setIsUpdatingNotifications(false);
    }
  };
  const handleUnfollow = async () => {
    const userId = menuActivity?.user?.id;

    if (!userId || menuActivity?.isOwnActivity) {
      return;
    }

    try {
      setIsUnfollowing(true);

      await apiFetch(`/api/users/${userId}/follow`, {
        method: "DELETE",
      });

      setActivities((current) =>
        current.filter((activity) => activity.user?.id !== userId),
      );

      setMenuActivity(null);
    } catch (error) {
      console.error("Unfollow from feed error:", error);
    } finally {
      setIsUnfollowing(false);
    }
  };

  const handleOpenProfileFromMenu = () => {
    const userId = menuActivity?.user?.id;

    setMenuActivity(null);

    if (userId) {
      navigate(`/users/${userId}`);
    }
  };
  const handleShare = async (activity) => {
    const userName = activity.user?.name || "Користувач";

    let text;

    switch (activity.type) {
      case "READING_STARTED":
        text = `${userName} почав читати книгу «${activity.book?.title || "Книга"}»`;
        break;

      case "BOOK_FINISHED":
        text = `${userName} прочитав книгу «${activity.book?.title || "Книга"}»`;
        break;

      case "RATING_ADDED":
        text = `${userName} оцінив книгу «${activity.book?.title || "Книга"}» на ${activity.rating ?? 0}/5`;
        break;

      case "ACHIEVEMENT_UNLOCKED":
        text = `${userName} отримав досягнення «${activity.achievement?.title || "Досягнення"}»`;
        break;

      default:
        text = `${userName} поділився новою активністю`;
    }

    try {
      if (navigator.share) {
        await navigator.share({
          title: "Бібліотека",
          text,
          url: window.location.origin,
        });

        return;
      }

      await navigator.clipboard.writeText(
        `${text} — ${window.location.origin}`,
      );
    } catch (error) {
      if (error?.name !== "AbortError") {
        console.error("Share activity error:", error);
      }
    }
  };

  const formatTime = (value) => activityDateFormatter.format(new Date(value));

  if (isLoading) {
    return (
      <section className="social-feed">
        <div className="social-feed__state">Завантажуємо активність...</div>
      </section>
    );
  }

  if (!activities.length) {
    return null;
  }

  const displayedActivities =
    limit === null ? activities : activities.slice(0, limit);

  return (
    <section className="social-feed">
      <div className="social-feed__header">
        <h2>Активність читачів</h2>

        {showViewAll && activities.length > displayedActivities.length && (
          <button
            type="button"
            className="social-feed__view-all"
            onClick={() => {
              navigate("/community");

              requestAnimationFrame(() => {
                window.scrollTo({
                  top: 0,
                  left: 0,
                  behavior: "instant",
                });
              });
            }}
          >
            Уся активність
            <Icon name="chevron-right" />
          </button>
        )}
      </div>
      <div className="social-feed__list">
        {displayedActivities.map((activity) => {
          const userName = activity.user?.name || "Користувач";

          return (
            <HomePanel
              as="article"
              id={`activity-${activity.id}`}
              key={activity.id}
              className="social-feed-card"
            >
              <header className="social-feed-card__header">
                <button
                  type="button"
                  className="social-feed-card__user"
                  onClick={() => navigate(`/users/${activity.user?.id}`)}
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
                    <span>{formatTime(activity.createdAt)}</span>
                  </div>
                </button>

                <button
                  type="button"
                  className="social-feed-card__more"
                  aria-label="Додаткові дії"
                  onClick={async () => {
                    setMenuActivity(activity);

                    if (!activity.isOwnActivity && activity.user?.id) {
                      try {
                        const data = await apiFetch(
                          `/api/users/${activity.user.id}/social-preferences`,
                        );

                        setNotifyActivity(Boolean(data?.notifyActivity));
                      } catch (error) {
                        console.error("Load social preference error:", error);

                        setNotifyActivity(false);
                      }
                    }
                  }}
                >
                  <Icon name="more-horizontal" />
                </button>
              </header>

              <SocialFeedEvent
                activity={activity}
                onOpenBook={(book) => {
                  if (book?.id) {
                    setSelectedBook(book);
                  }
                }}
                onOpenAchievement={(item) => {
                  item.isOwnActivity
                    ? navigate("/achievements")
                    : navigate(`/users/${item.user?.id}/achievements`);
                }}
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
                  onClick={() => handleKudos(activity)}
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
                  aria-label="Коментувати"
                  title="Коментарі додамо наступним кроком"
                >
                  <Icon name="comment" />
                  <span>Коментувати</span>
                </button>

                <button
                  type="button"
                  className="social-feed-card__action"
                  onClick={() => handleShare(activity)}
                  aria-label="Поділитися"
                >
                  <Icon name="share" />
                  <span>Поділитися</span>
                </button>
              </div>
            </HomePanel>
          );
        })}
      </div>
      <SocialBookModal
        book={selectedBook}
        onClose={() => setSelectedBook(null)}
        onOpenCatalog={(book) => {
          setSelectedBook(null);

          if (book?.id) {
            navigate(`/catalog?bookId=${book.id}`);
          }
        }}
      />
      <SocialFeedMenu
        activity={menuActivity}
        isUnfollowing={isUnfollowing}
        isUpdatingNotifications={isUpdatingNotifications}
        notifyActivity={notifyActivity}
        onClose={() => setMenuActivity(null)}
        onOpenProfile={handleOpenProfileFromMenu}
        onToggleNotifications={handleToggleNotifications}
        onUnfollow={handleUnfollow}
      />{" "}
    </section>
  );
};

export default SocialFeed;
