import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

import { apiFetch } from "../../../../shared/api/apiClient.js";

import KudosUsersSheet from "./components/KudosUsersSheet/KudosUsersSheet.jsx";

import "./PublicUserProfilePage.css";

const BackIcon = () => (
  <svg viewBox="0 0 24 24" aria-hidden="true">
    <path d="m15 18-6-6 6-6" />
  </svg>
);

const getCountLabel = (count, forms) => {
  const value = Math.abs(Number(count) || 0);
  const mod10 = value % 10;
  const mod100 = value % 100;

  if (mod10 === 1 && mod100 !== 11) {
    return forms[0];
  }

  if (mod10 >= 2 && mod10 <= 4 && (mod100 < 12 || mod100 > 14)) {
    return forms[1];
  }

  return forms[2];
};
const BookCover = ({ book }) => {
  const title = book?.title || "Книга";

  if (book?.coverUrl) {
    return <img src={book.coverUrl} alt={title} />;
  }

  return <span>{title.charAt(0).toUpperCase()}</span>;
};

const PublicUserProfilePage = () => {
  const navigate = useNavigate();
  const { userId } = useParams();

  const [profile, setProfile] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isFollowUpdating, setIsFollowUpdating] = useState(false);
  const [achievements, setAchievements] = useState([]);
  const [achievementsSummary, setAchievementsSummary] = useState({
    total: 0,
    unlocked: 0,
    locked: 0,
  });
  const [isAchievementsLoading, setIsAchievementsLoading] = useState(true);
  const [kudosUsers, setKudosUsers] = useState([]);
  const [isKudosSheetOpen, setIsKudosSheetOpen] = useState(false);
  const [isKudosUsersLoading, setIsKudosUsersLoading] = useState(false);
  const [kudosUsersError, setKudosUsersError] = useState(null);

  useEffect(() => {
    let isActive = true;

    const loadProfile = async () => {
      try {
        setIsLoading(true);
        setError(null);

        const data = await apiFetch(`/api/users/${userId}/profile`);

        if (isActive) {
          setProfile(data);
        }
      } catch (requestError) {
        console.error("Load public profile error:", requestError);

        if (isActive) {
          setError(requestError);
          setProfile(null);
        }
      } finally {
        if (isActive) {
          setIsLoading(false);
        }
      }
    };

    if (userId) {
      loadProfile();
    }

    return () => {
      isActive = false;
    };
  }, [userId]);

  useEffect(() => {
    let isActive = true;

    const loadAchievements = async () => {
      try {
        setIsAchievementsLoading(true);

        const timeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;

        const data = await apiFetch(
          `/api/users/${userId}/achievements?timeZone=${encodeURIComponent(timeZone)}`,
        );

        if (!isActive) {
          return;
        }

        setAchievements(
          Array.isArray(data?.achievements) ? data.achievements : [],
        );

        setAchievementsSummary({
          total: Number(data?.summary?.total) || 0,
          unlocked: Number(data?.summary?.unlocked) || 0,
          locked: Number(data?.summary?.locked) || 0,
        });
      } catch (requestError) {
        console.error("Load public achievements error:", requestError);

        if (isActive) {
          setAchievements([]);
        }
      } finally {
        if (isActive) {
          setIsAchievementsLoading(false);
        }
      }
    };

    if (userId) {
      loadAchievements();
    }

    return () => {
      isActive = false;
    };
  }, [userId]);
  const readingBooks = useMemo(
    () => (Array.isArray(profile?.reading?.books) ? profile.reading.books : []),
    [profile],
  );

  const finishedBooks = useMemo(
    () => (Array.isArray(profile?.finished?.books) ? profile.finished.books : []),
    [profile],
  );

  const handleOpenKudosUsers = async (achievement) => {
    if (!achievement?.activityId || (achievement.kudosCount ?? 0) === 0) {
      return;
    }

    try {
      setIsKudosSheetOpen(true);
      setIsKudosUsersLoading(true);
      setKudosUsersError(null);
      setKudosUsers([]);

      const data = await apiFetch(
        `/api/social/activities/${achievement.activityId}/kudos`,
      );

      setKudosUsers(Array.isArray(data?.users) ? data.users : []);
    } catch (requestError) {
      console.error("Load kudos users error:", requestError);

      setKudosUsersError(requestError);
      setKudosUsers([]);
    } finally {
      setIsKudosUsersLoading(false);
    }
  };
  const handleAchievementKudos = async (achievement) => {
    if (!achievement?.activityId) {
      return;
    }

    try {
      const nextHasKudos = !achievement.hasKudos;

      const data = await apiFetch(
        `/api/social/activities/${achievement.activityId}/kudos`,
        {
          method: nextHasKudos ? "POST" : "DELETE",
        },
      );

      setAchievements((currentAchievements) =>
        currentAchievements.map((item) => {
          if (item.id !== achievement.id) {
            return item;
          }

          return {
            ...item,
            hasKudos: Boolean(data?.hasKudos),
            kudosCount: Number(data?.kudosCount) || 0,
          };
        }),
      );
    } catch (requestError) {
      console.error("Update achievement kudos error:", requestError);
    }
  };
  const handleFollowToggle = async () => {
    if (!profile || profile.isOwnProfile || isFollowUpdating) {
      return;
    }

    const nextIsFollowing = !profile.isFollowing;

    try {
      setIsFollowUpdating(true);

      await apiFetch(`/api/users/${profile.id}/follow`, {
        method: nextIsFollowing ? "POST" : "DELETE",
      });

      setProfile((currentProfile) => {
        if (!currentProfile) {
          return currentProfile;
        }

        return {
          ...currentProfile,
          isFollowing: nextIsFollowing,
          followersCount: Math.max(
            0,
            (currentProfile.followersCount ?? 0) + (nextIsFollowing ? 1 : -1),
          ),
        };
      });
    } catch (requestError) {
      console.error("Update follow state error:", requestError);
    } finally {
      setIsFollowUpdating(false);
    }
  };

  if (isLoading) {
    return (
      <main className="public-profile-page">
        <div className="public-profile-page__container">
          <div className="public-profile-page__state">
            <div className="public-profile-page__loader" />
            <strong>Завантажуємо профіль...</strong>
          </div>
        </div>
      </main>
    );
  }

  if (error || !profile) {
    return (
      <main className="public-profile-page">
        <div className="public-profile-page__container">
          <button
            type="button"
            className="public-profile-page__back"
            onClick={() => navigate(-1)}
            aria-label="Назад"
          >
            <BackIcon />
          </button>

          <div className="public-profile-page__state">
            <strong>Не вдалося відкрити профіль</strong>
            <span>Користувача не знайдено або сталася помилка.</span>
          </div>
        </div>
      </main>
    );
  }

  const profileName = profile.name || "Користувач";

  return (
    <main className="public-profile-page">
      <div className="public-profile-page__container">
        <button
          type="button"
          className="public-profile-page__back"
          onClick={() => navigate(-1)}
          aria-label="Назад"
        >
          <BackIcon />
        </button>

        <section className="public-profile-hero">
          <div className="public-profile-hero__avatar">
            {profile.avatarUrl ? (
              <img src={profile.avatarUrl} alt={profileName} />
            ) : (
              <span>{profileName.charAt(0).toUpperCase()}</span>
            )}
          </div>

          <div className="public-profile-hero__content">
            <h1>{profileName}</h1>

            <div className="public-profile-hero__social">
              <button
                type="button"
                className="public-profile-hero__social-link"
                onClick={() => navigate(`/users/${profile.id}/followers`)}
              >
                <strong>{profile.followersCount ?? 0}</strong>{" "}
                {getCountLabel(profile.followersCount, [
                  "підписник",
                  "підписники",
                  "підписників",
                ])}
              </button>

              <span>•</span>

              <button
                type="button"
                className="public-profile-hero__social-link"
                onClick={() => navigate(`/users/${profile.id}/following`)}
              >
                <strong>{profile.followingCount ?? 0}</strong>{" "}
                {getCountLabel(profile.followingCount, [
                  "підписка",
                  "підписки",
                  "підписок",
                ])}
              </button>
            </div>

            {!profile.isOwnProfile && (
              <button
                type="button"
                className={
                  profile.isFollowing
                    ? "public-profile-hero__follow public-profile-hero__follow--active"
                    : "public-profile-hero__follow"
                }
                disabled={isFollowUpdating}
                onClick={handleFollowToggle}
              >
                {isFollowUpdating
                  ? "..."
                  : profile.isFollowing
                    ? "Відписатися"
                    : "Підписатися"}
              </button>
            )}

            {profile.isOwnProfile && (
              <button
                type="button"
                className="public-profile-hero__follow public-profile-hero__follow--active"
                onClick={() => navigate("/account")}
              >
                Мій профіль
              </button>
            )}
          </div>
        </section>

        <section className="public-profile-section">
          <div className="public-profile-section__header">
            <div>
              <h2>Досягнення</h2>
              <p>
                {achievementsSummary.unlocked} із {achievementsSummary.total}
              </p>
            </div>
          </div>

          {isAchievementsLoading ? (
            <div className="public-profile-section__empty">
              Завантажуємо досягнення...
            </div>
          ) : achievements.length === 0 ? (
            <div className="public-profile-section__empty">
              Досягнень поки немає
            </div>
          ) : (
            <div className="public-profile-achievements">
              {achievements.slice(0, 4).map((achievement) => (
                <article
                  key={achievement.id}
                  className="public-profile-achievement"
                >
                  <span className="public-profile-achievement__medal">
                    {achievement.category === "books" && "📚"}
                    {achievement.category === "pages" && "📜"}
                    {achievement.category === "time" && "⏱️"}
                    {achievement.category === "streak" && "🔥"}
                  </span>

                  <div className="public-profile-achievement__content">
                    <strong>{achievement.title}</strong>
                    <small>{achievement.description}</small>
                  </div>

                  <div className="public-profile-achievement__kudos-group">
                    <button
                      type="button"
                      className={
                        achievement.hasKudos
                          ? "public-profile-achievement__kudos public-profile-achievement__kudos--active"
                          : "public-profile-achievement__kudos"
                      }
                      disabled={!achievement.activityId}
                      onClick={() => handleAchievementKudos(achievement)}
                      aria-label={
                        achievement.hasKudos
                          ? "Прибрати kudos"
                          : "Поставити kudos"
                      }
                    >
                      <span aria-hidden="true">♥</span>
                    </button>

                    <button
                      type="button"
                      className="public-profile-achievement__kudos-count"
                      disabled={(achievement.kudosCount ?? 0) === 0}
                      onClick={() => handleOpenKudosUsers(achievement)}
                      aria-label="Показати, хто поставив kudos"
                    >
                      {achievement.kudosCount ?? 0}
                    </button>
                  </div>
                </article>
              ))}
            </div>
          )}
        </section>
        <section className="public-profile-section">
          <div className="public-profile-section__header">
            <div>
              <h2>Зараз читає</h2>
              <p>{profile.reading?.count ?? readingBooks.length} книг</p>
            </div>
          </div>

          {readingBooks.length === 0 ? (
            <div className="public-profile-section__empty">
              Зараз немає активних книг
            </div>
          ) : (
            <div className="public-profile-books">
              {readingBooks.map((item) => {
                const book = item.book;
                const totalPages = book?.pages ?? 0;

                const progress =
                  totalPages > 0
                    ? Math.min(
                        100,
                        Math.round(((item.currentPage ?? 0) / totalPages) * 100),
                      )
                    : null;

                return (
                  <article key={book?.id} className="public-profile-book">
                    <div className="public-profile-book__cover">
                      <BookCover book={book} />
                    </div>

                    <div className="public-profile-book__content">
                      <strong>{book?.title || "Без назви"}</strong>
                      <span>{book?.author || "Автор невідомий"}</span>

                      {progress !== null && (
                        <div className="public-profile-book__progress">
                          <div>
                            <span style={{ width: `${progress}%` }} />
                          </div>

                          <small>{progress}%</small>
                        </div>
                      )}
                    </div>
                  </article>
                );
              })}
            </div>
          )}
        </section>

        <section className="public-profile-section">
          <div className="public-profile-section__header">
            <div>
              <h2>Прочитано</h2>
              <p>{profile.finished?.count ?? finishedBooks.length} книг</p>
            </div>
          </div>

          {finishedBooks.length === 0 ? (
            <div className="public-profile-section__empty">
              Прочитаних книг поки немає
            </div>
          ) : (
            <div className="public-profile-books public-profile-books--finished">
              {finishedBooks.map((item) => {
                const book = item.book;

                return (
                  <article key={book?.id} className="public-profile-book">
                    <div className="public-profile-book__cover">
                      <BookCover book={book} />
                    </div>

                    <div className="public-profile-book__content">
                      <strong>{book?.title || "Без назви"}</strong>
                      <span>{book?.author || "Автор невідомий"}</span>

                      {item.rating && (
                        <small className="public-profile-book__rating">
                          ★ {item.rating}/5
                        </small>
                      )}
                    </div>
                  </article>
                );
              })}
            </div>
          )}
        </section>
      </div>

      <KudosUsersSheet
        isOpen={isKudosSheetOpen}
        users={kudosUsers}
        isLoading={isKudosUsersLoading}
        error={kudosUsersError}
        onClose={() => setIsKudosSheetOpen(false)}
      />
    </main>
  );
};

export default PublicUserProfilePage;











