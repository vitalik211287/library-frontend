import Icon from "../../../../shared/components/Icon/Icon.jsx";
import UserSearchCard from "../UserSearchCard/UserSearchCard.jsx";

import "./UsersResults.css";

const UsersResults = ({
  query,
  users,
  isLoading,
  error,
  onFollowingChange,
}) => {
  const normalizedQuery = query.trim();

  if (normalizedQuery.length < 2) {
    return (
      <div className="users-results__state">
        <div className="users-results__state-icon">
          <Icon name="user-add" />
        </div>

        <strong>Знайдіть читача</strong>

        <span>Введіть щонайменше дві літери.</span>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="users-results__state">
        <div className="users-results__loader" />

        <strong>Шукаємо...</strong>
      </div>
    );
  }

  if (error) {
    return (
      <div className="users-results__state">
        <strong>Не вдалося виконати пошук</strong>

        <span>Спробуйте ще раз.</span>
      </div>
    );
  }

  if (users.length === 0) {
    return (
      <div className="users-results__state">
        <strong>Користувачів не знайдено</strong>

        <span>Спробуйте інше ім’я.</span>
      </div>
    );
  }

  return (
    <div className="users-results">
      {users.map((user) => (
        <UserSearchCard
          key={user.id}
          user={user}
          onFollowingChange={onFollowingChange}
        />
      ))}
    </div>
  );
};

export default UsersResults;
