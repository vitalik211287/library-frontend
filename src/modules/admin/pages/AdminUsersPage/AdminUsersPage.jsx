import { useEffect, useState } from "react";
import toast from "react-hot-toast";

import {
  blockAdminUser,
  getAdminUsers,
  unblockAdminUser,
} from "../../api/adminApi.js";

import { useAuth } from "../../../auth/context/AuthContext.jsx";

import "./AdminUsersPage.css";

const AdminUsersPage = () => {
  const { user: currentUser } = useAuth();

  const [users, setUsers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [actionUserId, setActionUserId] = useState(null);

  useEffect(() => {
    const loadUsers = async () => {
      try {
        const adminUsers = await getAdminUsers();

        setUsers(adminUsers);
      } catch (error) {
        console.error("Load admin users error:", error);

        toast.error(error?.message || "Не вдалося завантажити користувачів");
      } finally {
        setIsLoading(false);
      }
    };

    loadUsers();
  }, []);

  const handleToggleBlocked = async (user) => {
    if (user.id === currentUser?.id) {
      return;
    }

    try {
      setActionUserId(user.id);

      const updatedUser = user.isBlocked
        ? await unblockAdminUser(user.id)
        : await blockAdminUser(user.id);

      setUsers((currentUsers) =>
        currentUsers.map((item) =>
          item.id === user.id
            ? {
                ...item,
                ...updatedUser,
              }
            : item,
        ),
      );

      toast.success(
        user.isBlocked ? "Користувача розблоковано" : "Користувача заблоковано",
      );
    } catch (error) {
      console.error("Update admin user error:", error);

      toast.error(error?.message || "Не вдалося змінити статус користувача");
    } finally {
      setActionUserId(null);
    }
  };

  const formatDate = (date) => {
    if (!date) {
      return "—";
    }

    return new Intl.DateTimeFormat("uk-UA", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    }).format(new Date(date));
  };

  if (isLoading) {
    return (
      <section className="admin-users-page">
        <p className="admin-users-page__message">
          Завантаження користувачів...
        </p>
      </section>
    );
  }

  return (
    <section className="admin-users-page">
      <div className="admin-users-page__header">
        <div>
          <h1 className="admin-users-page__title">Адміністрування</h1>

          <p className="admin-users-page__subtitle">
            Зареєстровані користувачі бібліотеки
          </p>
        </div>

        <span className="admin-users-page__count">{users.length}</span>
      </div>

      <div className="admin-users-page__list">
        {users.map((user) => {
          const isCurrentUser = user.id === currentUser?.id;
          const isActionLoading = actionUserId === user.id;

          return (
            <article key={user.id} className="admin-user-card">
              <div className="admin-user-card__main">
                <div className="admin-user-card__avatar">
                  {user.avatarUrl ? (
                    <img src={user.avatarUrl} alt={user.name || "Користувач"} />
                  ) : (
                    <span>
                      {(user.name || user.email || "?").charAt(0).toUpperCase()}
                    </span>
                  )}
                </div>

                <div className="admin-user-card__info">
                  <div className="admin-user-card__name-row">
                    <h2 className="admin-user-card__name">
                      {user.name || "Без імені"}
                    </h2>

                    {user.role === "ADMIN" && (
                      <span className="admin-user-card__role">ADMIN</span>
                    )}
                  </div>

                  <p className="admin-user-card__email">{user.email}</p>
                </div>
              </div>

              <div className="admin-user-card__meta">
                <div className="admin-user-card__meta-item">
                  <span>Реєстрація</span>
                  <strong>{formatDate(user.createdAt)}</strong>
                </div>

                <div className="admin-user-card__meta-item">
                  <span>Книг</span>
                  <strong>{user._count?.books ?? 0}</strong>
                </div>

                <div className="admin-user-card__meta-item">
                  <span>Статус</span>

                  <strong
                    className={
                      user.isBlocked
                        ? "admin-user-card__status admin-user-card__status--blocked"
                        : "admin-user-card__status admin-user-card__status--active"
                    }
                  >
                    {user.isBlocked ? "Заблокований" : "Активний"}
                  </strong>
                </div>
              </div>

              <div className="admin-user-card__actions">
                <button
                  type="button"
                  className={
                    user.isBlocked
                      ? "admin-user-card__button admin-user-card__button--unblock"
                      : "admin-user-card__button admin-user-card__button--block"
                  }
                  onClick={() => handleToggleBlocked(user)}
                  disabled={isCurrentUser || isActionLoading}
                >
                  {isActionLoading
                    ? "Збереження..."
                    : user.isBlocked
                      ? "Розблокувати"
                      : "Заблокувати"}
                </button>

                {isCurrentUser && (
                  <span className="admin-user-card__self">Ваш акаунт</span>
                )}
              </div>
            </article>
          );
        })}
      </div>
    </section>
  );
};

export default AdminUsersPage;
