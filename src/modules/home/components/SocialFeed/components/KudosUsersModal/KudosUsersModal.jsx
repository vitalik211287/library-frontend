import { useEffect, useState } from "react";

import { apiFetch } from "../../../../../../shared/api/apiClient.js";

import "./KudosUsersModal.css";

const KudosUsersModal = ({ item, onClose, onOpenProfile }) => {
  const [users, setUsers] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (!item?.id) return;

    let isActive = true;

    const loadUsers = async () => {
      try {
        setIsLoading(true);

        const url =
          item.kind === "post"
            ? `/api/social/posts/${item.id}/kudos`
            : `/api/social/activities/${item.id}/kudos`;

        const data = await apiFetch(url);

        if (isActive) {
          setUsers(Array.isArray(data?.users) ? data.users : []);
        }
      } catch (error) {
        console.error("Load kudos users error:", error);

        if (isActive) {
          setUsers([]);
        }
      } finally {
        if (isActive) {
          setIsLoading(false);
        }
      }
    };

    loadUsers();

    return () => {
      isActive = false;
    };
  }, [item]);

  if (!item) return null;

  return (
    <div className="kudos-users-modal__overlay" onClick={onClose}>
      <div
        className="kudos-users-modal"
        role="dialog"
        aria-modal="true"
        aria-label="Підтримали"
        onClick={(event) => event.stopPropagation()}
      >
        <header className="kudos-users-modal__header">
          <h2>Підтримали</h2>

          <button type="button" onClick={onClose} aria-label="Закрити">
            ×
          </button>
        </header>

        <div className="kudos-users-modal__content">
          {isLoading && <p>Завантажуємо...</p>}

          {!isLoading &&
            users.map((user) => (
              <button
                type="button"
                className="kudos-users-modal__user"
                key={user.id}
                onClick={() => {
                  onClose();
                  onOpenProfile(user.id);
                }}
              >
                <span className="kudos-users-modal__avatar">
                  {user.avatarUrl ? (
                    <img src={user.avatarUrl} alt="" />
                  ) : (
                    (user.name || "К").charAt(0).toUpperCase()
                  )}
                </span>

                <strong>{user.name || "Користувач"}</strong>
              </button>
            ))}

          {!isLoading && users.length === 0 && <p>Поки ніхто не підтримав.</p>}
        </div>
      </div>
    </div>
  );
};

export default KudosUsersModal;
