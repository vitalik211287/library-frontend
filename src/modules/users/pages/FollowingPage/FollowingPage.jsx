import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import { apiFetch } from "../../../../shared/api/apiClient.js";

import "./FollowingPage.css";

const BackIcon = () => (
  <svg viewBox="0 0 24 24" aria-hidden="true">
    <path d="m15 18-6-6 6-6" />
  </svg>
);

const FollowingPage = () => {
  const navigate = useNavigate();

  const [users, setUsers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [updatingUserId, setUpdatingUserId] = useState(null);

  useEffect(() => {
    const loadFollowing = async () => {
      try {
        setIsLoading(true);
        setError(null);

        const data = await apiFetch("/api/users/me/following");

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

  const handleUnfollow = async (userId) => {
    if (updatingUserId) {
      return;
    }

    try {
      setUpdatingUserId(userId);

      await apiFetch(`/api/users/${userId}/follow`, {
        method: "DELETE",
      });

      setUsers((currentUsers) =>
        currentUsers.filter((user) => user.id !== userId),
      );
    } catch (requestError) {
      console.error("Unfollow user error:", requestError);
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

            <p>Читачі, на яких ви підписані</p>
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

                  <button
                    type="button"
                    className="following-card__unfollow"
                    disabled={updatingUserId === user.id}
                    onClick={() => handleUnfollow(user.id)}
                  >
                    {updatingUserId === user.id ? "..." : "Відписатися"}
                  </button>
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

