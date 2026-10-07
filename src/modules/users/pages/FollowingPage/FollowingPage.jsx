import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import PageBackButton from "../../../../shared/components/PageBackButton/PageBackButton.jsx";
import Loader from "../../../../shared/components/Loader/Loader.jsx";
import UserListItem from "../../components/UserListItem/UserListItem.jsx";
import useFollowToggle from "../../hooks/useFollowToggle.js";

import { apiFetch } from "../../../../shared/api/apiClient.js";

import "./FollowingPage.css";

const FollowingPage = () => {
  const navigate = useNavigate();
  const { userId } = useParams();

  const [users, setUsers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

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
  }, [userId]);

  const { updatingUserId, toggleFollow } = useFollowToggle();

  const handleFollowToggle = async (user) => {
    const nextIsFollowing = await toggleFollow(user);

    if (nextIsFollowing === null) {
      return;
    }

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
  };

  return (
    <main className="following-page">
      <div className="following-page__container">
        <header className="following-page__header">
          <PageBackButton label="Підписки" />

          <div>
            <h1>Підписки</h1>

            <p>
              {userId
                ? "Читачі, на яких підписаний користувач"
                : "Читачі, на яких ви підписані"}
            </p>
          </div>
        </header>

        {isLoading && (
          <div className="following-page__state">
            <Loader text="Завантажуємо..." size="small" />
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
            {users.map((user) => (
              <UserListItem
                key={user.id}
                user={user}
                isUpdating={updatingUserId === user.id}
                onProfileClick={(selectedUser) =>
                  navigate(`/users/${selectedUser.id}`)
                }
                onFollowToggle={handleFollowToggle}
              />
            ))}
          </div>
        )}
      </div>
    </main>
  );
};

export default FollowingPage;
