import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

import { apiFetch } from "../../../../shared/api/apiClient.js";

import "./FollowingPage.css";

const BackIcon = () => (
  <svg viewBox="0 0 24 24" aria-hidden="true">
    <path d="m15 18-6-6 6-6" />
  </svg>
);

const FollowingPage = () => {
  const navigate = useNavigate();
  const { userId } = useParams();

  const [users, setUsers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [updatingUserId, setUpdatingUserId] = useState(null);

  useEffect(() => {
    const loadFollowing = async () => {
      try {
        setIsLoading(true);
        setError(null);

        const endpoint = userId
          ? `/api/users/${userId}/following`
          : "/api/users/me/following";

        const data = await apiFetch(endpoint);

        setUsers(Array.isArray(data?.users) ? data.users : []);
      } catch (requestError) {
        console.error("Load following error:", requestError);

        setError(requestError);
        setUsers([]);
      } finally {
        setIsLoading(false);
      }
    };

    loadFollowing();
  }, []);

  const handleFollowToggle = async (user) => {
    if (updatingUserId || user.isCurrentUser) {
      return;
    }

    const nextIsFollowing = !user.isFollowing;

    try {
      setUpdatingUserId(user.id);

      await apiFetch(`/api/users/${user.id}/follow`, {
        method: nextIsFollowing ? "POST" : "DELETE",
      });

      setUsers((currentUsers) => {
        if (!userId && !nextIsFollowing) {
          return currentUsers.filter((item) => item.id !== user.id);
        }

        return currentUsers.map((item) => {
          if (item.id !== user.id) {
            return item;
          }

          return {
            ...item,
            isFollowing: nextIsFollowing,
            followersCount: Math.max(
              0,
              (item.followersCount ?? 0) + (nextIsFollowing ? 1 : -1),
            ),
          };
        });
      });
    } catch (requestError) {
      console.error("Update follow state error:", requestError);
    } finally {
      setUpdatingUserId(null);
    }
  };

  return (
    <main className="following-page">
      <div className="following-page__container">
        <header className="following-page__header">
          <button
            type="button"
            className="following-page__back"
            onClick={() => navigate(-1)}
            aria-label="Назад"
          >
            <BackIcon />
          </button>

          <div>
            <h1>Підписки</h1>

            <p>{userId ? "Читачі, на яких підписаний користувач" : "Читачі, на яких ви підписані"}</p>
          </div>
        </header>

        {isLoading && (
          <div className="following-page__state">
            <div className="following-page__loader" />

            <strong>Завантажуємо...</strong>
          </div>
        )}

        {!isLoading && error && (
          <div className="following-page__state">
            <strong>Не вдалося завантажити підписки</strong>

            <span>Спробуйте ще раз.</span>
          </div>
        )}

        {!isLoading && !error && users.length === 0 && (
          <div className="following-page__state">
            <strong>Підписок поки немає</strong>

            <span>Знайдіть читачів і підпишіться на них.</span>

            <button
              type="button"
              className="following-page__find"
              onClick={() => navigate("/users")}
            >
              Знайти читачів
            </button>
          </div>
        )}

        {!isLoading && !error && users.length > 0 && (
          <div className="following-page__list">
            {users.map((user) => {
              const profileName = user?.name || "Користувач";

              return (
                <article key={user.id} className="following-card">
                  <button
                    type="button"
                    className="following-card__profile"
                    onClick={() => navigate(`/users/${user.id}`)}
                  >
                    <div className="following-card__avatar">
                      {user.avatarUrl ? (
                        <img src={user.avatarUrl} alt={profileName} />
                      ) : (
                        <span>{profileName.charAt(0).toUpperCase()}</span>
                      )}
                    </div>

                    <div className="following-card__content">
                      <strong>{profileName}</strong>

                      <div className="following-card__meta">
                        <span>{user.followersCount ?? 0} підписників</span>

                        <span>•</span>

                        <span>{user.followingCount ?? 0} підписок</span>
                      </div>
                    </div>
                  </button>
                  {user.isCurrentUser ? (
                    <span className="following-card__self">Ви</span>
                  ) : (
                    <button
                      type="button"
                      className={
                        user.isFollowing
                          ? "following-card__unfollow"
                          : "following-card__follow"
                      }
                      disabled={updatingUserId === user.id}
                      onClick={() => handleFollowToggle(user)}
                    >
                      {updatingUserId === user.id
                        ? "..."
                        : user.isFollowing
                          ? "Відписатися"
                          : "Підписатися"}
                    </button>
                  )}
                </article>
              );
            })}
          </div>
        )}
      </div>
    </main>
  );
};

export default FollowingPage;





