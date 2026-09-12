import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import { apiFetch } from "../../../../shared/api/apiClient.js";

import "./FollowersPage.css";

const BackIcon = () => (
  <svg viewBox="0 0 24 24" aria-hidden="true">
    <path d="m15 18-6-6 6-6" />
  </svg>
);

const FollowersPage = () => {
  const navigate = useNavigate();

  const [users, setUsers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [updatingUserId, setUpdatingUserId] = useState(null);

  useEffect(() => {
    const loadFollowers = async () => {
      try {
        setIsLoading(true);
        setError(null);

        const data = await apiFetch("/api/users/me/followers");

        setUsers(Array.isArray(data?.users) ? data.users : []);
      } catch (requestError) {
        console.error("Load followers error:", requestError);

        setError(requestError);
        setUsers([]);
      } finally {
        setIsLoading(false);
      }
    };

    loadFollowers();
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

      setUsers((currentUsers) =>
        currentUsers.map((item) => {
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
        }),
      );
    } catch (requestError) {
      console.error("Update follow state error:", requestError);
    } finally {
      setUpdatingUserId(null);
    }
  };

  return (
    <main className="followers-page">
      <div className="followers-page__container">
        <header className="followers-page__header">
          <button
            type="button"
            className="followers-page__back"
            onClick={() => navigate(-1)}
            aria-label="Назад"
          >
            <BackIcon />
          </button>

          <div>
            <h1>Підписники</h1>

            <p>Читачі, які підписані на вас</p>
          </div>
        </header>

        {isLoading && (
          <div className="followers-page__state">
            <div className="followers-page__loader" />

            <strong>Завантажуємо...</strong>
          </div>
        )}

        {!isLoading && error && (
          <div className="followers-page__state">
            <strong>Не вдалося завантажити підписників</strong>

            <span>Спробуйте ще раз.</span>
          </div>
        )}

        {!isLoading && !error && users.length === 0 && (
          <div className="followers-page__state">
            <strong>Підписників поки немає</strong>

            <span>Тут зʼявляться користувачі, які підпишуться на вас.</span>
          </div>
        )}

        {!isLoading && !error && users.length > 0 && (
          <div className="followers-page__list">
            {users.map((user) => {
              const profileName = user?.name || "Користувач";

              return (
                <article key={user.id} className="follower-card">
                  <button
                    type="button"
                    className="follower-card__profile"
                    onClick={() => navigate(`/users/${user.id}`)}
                  >
                    <div className="follower-card__avatar">
                      {user.avatarUrl ? (
                        <img src={user.avatarUrl} alt={profileName} />
                      ) : (
                        <span>{profileName.charAt(0).toUpperCase()}</span>
                      )}
                    </div>

                    <div className="follower-card__content">
                      <strong>{profileName}</strong>

                      <div className="follower-card__meta">
                        <span>{user.followersCount ?? 0} підписників</span>

                        <span>•</span>

                        <span>{user.followingCount ?? 0} підписок</span>
                      </div>
                    </div>
                  </button>
                  {user.isCurrentUser ? (
                    <span className="follower-card__self">Ви</span>
                  ) : (
                    <button
                      type="button"
                      className={
                        user.isFollowing
                          ? "follower-card__unfollow"
                          : "follower-card__follow"
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

export default FollowersPage;



