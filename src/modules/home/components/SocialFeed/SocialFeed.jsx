import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import { apiFetch } from "../../../../shared/api/apiClient.js";

import "./SocialFeed.css";

const SocialFeed = () => {
  const navigate = useNavigate();

  const [activities, setActivities] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let isActive = true;

    const loadFeed = async () => {
      try {
        setIsLoading(true);

        const data = await apiFetch("/api/social/feed");

        if (isActive) {
          setActivities(
            Array.isArray(data?.activities) ? data.activities : [],
          );
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

  const formatTime = (value) =>
    new Intl.DateTimeFormat("uk-UA", {
      day: "2-digit",
      month: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    }).format(new Date(value));

  if (isLoading) {
    return (
      <section className="social-feed">
        <div className="social-feed__state">
          Завантажуємо активність...
        </div>
      </section>
    );
  }

  if (!activities.length) {
    return null;
  }

  return (
    <section className="social-feed">
      <div className="social-feed__header">
        <h2>Активність читачів</h2>
      </div>

      <div className="social-feed__list">
        {activities.map((activity) => {
          const userName = activity.user?.name || "Користувач";

          return (
            <article key={activity.id} className="social-feed-card">
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
                    />
                  ) : (
                    <span>{userName.charAt(0).toUpperCase()}</span>
                  )}
                </div>

                <div>
                  <strong>{userName}</strong>
                  <span>{formatTime(activity.createdAt)}</span>
                </div>
              </button>

              {activity.type === "BOOK_FINISHED" && (
                <div className="social-feed-card__book">
                  <div className="social-feed-card__cover">
                    {activity.book?.coverUrl ? (
                      <img
                        src={activity.book.coverUrl}
                        alt={activity.book.title}
                      />
                    ) : (
                      <span>📚</span>
                    )}
                  </div>

                  <div className="social-feed-card__book-content">
                    <span>Прочитав книгу</span>
                    <h3>{activity.book?.title || "Книга"}</h3>
                    <p>{activity.book?.author || "Автор не вказаний"}</p>
                  </div>
                </div>
              )}

              {activity.type === "ACHIEVEMENT_UNLOCKED" && (
  <button
    type="button"
    className="social-feed-card__achievement"
    onClick={() =>
      activity.isOwnActivity
        ? navigate("/achievements")
        : navigate(`/users/${activity.user?.id}`)
    }
  >
    <span>🏆</span>

    <div>
      <small>Нове досягнення</small>

      <strong>
        {activity.achievement?.title || "Досягнення"}
      </strong>

      {activity.achievement?.description && (
        <p>{activity.achievement.description}</p>
      )}
    </div>

    <span className="social-feed-card__achievement-arrow">
      ›
    </span>
  </button>
)}

<div className="social-feed-card__actions">
                <button
                  type="button"
                  className={
                    activity.hasKudos
                      ? "social-feed-card__kudos social-feed-card__kudos--active"
                      : "social-feed-card__kudos"
                  }
                  disabled={activity.isOwnActivity}
                  onClick={() => handleKudos(activity)}
                >
                  👏 {activity.kudosCount ?? 0}
                </button>
              </div>
            </article>
          );
        })}
      </div>
    </section>
  );
};

export default SocialFeed;