import useFollowToggle from "../../hooks/useFollowToggle.js";

import "./UserSearchCard.css";

const UserSearchCard = ({ user, onFollowingChange }) => {
  const { updatingUserId, toggleFollow } = useFollowToggle();

  const isUpdating = updatingUserId === user.id;

  const profileName = user?.name || "Користувач";

  const handleFollow = async () => {
    const nextIsFollowing = await toggleFollow(user);

    if (nextIsFollowing === null) {
      return;
    }

    onFollowingChange?.(user.id, nextIsFollowing);
  };

  return (
    <article className="user-search-card">
      <div className="user-search-card__avatar">
        {user.avatarUrl ? (
          <img src={user.avatarUrl} alt={profileName} loading="lazy" decoding="async" />
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

