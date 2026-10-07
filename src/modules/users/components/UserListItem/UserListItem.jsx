import AppPanel from "../../../../shared/components/AppPanel/AppPanel.jsx";

import "./UserListItem.css";

const UserListItem = ({
  user,
  onProfileClick,
  onFollowToggle,
  isUpdating = false,
}) => {
  const profileName = user?.name || "Користувач";

  return (
    <AppPanel as="article" className="user-list-item">
      <button
        type="button"
        className="user-list-item__profile"
        onClick={() => onProfileClick(user)}
      >
        <div className="user-list-item__avatar">
          {user.avatarUrl ? (
            <img
              src={user.avatarUrl}
              alt={profileName}
              loading="lazy"
              decoding="async"
            />
          ) : (
            <span>{profileName.charAt(0).toUpperCase()}</span>
          )}
        </div>

        <div className="user-list-item__content">
          <strong>{profileName}</strong>

          <div className="user-list-item__meta">
            <span>{user.followersCount ?? 0} підписників</span>
            <span>•</span>
            <span>{user.followingCount ?? 0} підписок</span>
          </div>
        </div>
      </button>

      {user.isCurrentUser ? (
        <span className="user-list-item__self">Ви</span>
      ) : (
        <button
          type="button"
          className={
            user.isFollowing
              ? "user-list-item__unfollow"
              : "user-list-item__follow"
          }
          disabled={isUpdating}
          onClick={() => onFollowToggle(user)}
        >
          {isUpdating
            ? "..."
            : user.isFollowing
              ? "Відписатися"
              : "Підписатися"}
        </button>
      )}
    </AppPanel>
  );
};

export default UserListItem;
