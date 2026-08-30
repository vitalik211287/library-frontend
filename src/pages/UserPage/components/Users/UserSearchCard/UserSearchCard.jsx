import { useState } from "react";

import { apiFetch } from "../../../../../utils/apiClient.js";

import "./UserSearchCard.css";

const UserSearchCard = ({ user, onFollowingChange }) => {
  const [isUpdating, setIsUpdating] = useState(false);

  const profileName = user?.name || "Користувач";

  const handleFollow = async () => {
    if (isUpdating) {
      return;
    }

    const nextIsFollowing = !user.isFollowing;

    try {
      setIsUpdating(true);

      await apiFetch(`/api/users/${user.id}/follow`, {
        method: nextIsFollowing ? "POST" : "DELETE",
      });

      onFollowingChange?.(user.id, nextIsFollowing);
    } catch (error) {
      console.error("Update following error:", error);
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <article className="user-search-card">
      <div className="user-search-card__avatar">
        {user.avatarUrl ? (
          <img src={user.avatarUrl} alt={profileName} />
        ) : (
          <span>{profileName.charAt(0).toUpperCase()}</span>
        )}
      </div>

      <div className="user-search-card__content">
        <strong className="user-search-card__name">{profileName}</strong>

        <div className="user-search-card__meta">
          <span>{user.followersCount ?? 0} підписників</span>

          <span className="user-search-card__dot">•</span>

          <span>{user.followingCount ?? 0} підписок</span>
        </div>
      </div>

      <button
        type="button"
        className={`user-search-card__follow ${
          user.isFollowing ? "user-search-card__follow--active" : ""
        }`}
        disabled={isUpdating}
        onClick={handleFollow}
      >
        {isUpdating ? "..." : user.isFollowing ? "Підписані" : "Підписатися"}
      </button>
    </article>
  );
};

export default UserSearchCard;
