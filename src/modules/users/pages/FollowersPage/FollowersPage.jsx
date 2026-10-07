import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import PageBackButton from "../../../../shared/components/PageBackButton/PageBackButton.jsx";
import Loader from "../../../../shared/components/Loader/Loader.jsx";
import UserListItem from "../../components/UserListItem/UserListItem.jsx";
import useFollowToggle from "../../hooks/useFollowToggle.js";

import { apiFetch } from "../../../../shared/api/apiClient.js";

import "./FollowersPage.css";

const FollowersPage = () => {
  const navigate = useNavigate();
  const { userId } = useParams();

  const [users, setUsers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const loadFollowers = async () => {
      try {
        setIsLoading(true);
        setError(null);

        const endpoint = userId
          ? `/api/users/${userId}/followers`
          : "/api/users/me/followers";

        const data = await apiFetch(endpoint);

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
  }, [userId]);

  const { updatingUserId, toggleFollow } = useFollowToggle();

  const handleFollowToggle = async (user) => {
    const nextIsFollowing = await toggleFollow(user);

    if (nextIsFollowing === null) {
      return;
    }

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
  };

  return (
    <main className="followers-page">
      <div className="followers-page__container">
        <header className="followers-page__header">
          <PageBackButton label="Підписники" />

          <div>
            <h1>Підписники</h1>

            <p>
              {userId
                ? "Читачі, які підписані на користувача"
                : "Читачі, які підписані на вас"}
            </p>
          </div>
        </header>

        {isLoading && (
          <div className="followers-page__state">
            <Loader text="Завантажуємо..." size="small" />
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

export default FollowersPage;
