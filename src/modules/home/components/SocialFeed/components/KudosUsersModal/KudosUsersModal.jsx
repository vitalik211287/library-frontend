import { useEffect, useState } from "react";

import { apiFetch } from "../../../../../../shared/api/apiClient.js";
import Loader from "../../../../../../shared/components/Loader/Loader.jsx";
import Modal from "../../../../../../shared/components/Modal/Modal.jsx";

import "./KudosUsersModal.css";

const KudosUsersModal = ({ item, onClose, onOpenProfile }) => {
  const [users, setUsers] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (!item?.id) {
      return undefined;
    }

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

  if (!item) {
    return null;
  }

  return (
    <Modal
      isOpen
      onClose={onClose}
      title="Підтримали"
      className="kudos-users-modal"
      overlayClassName="kudos-users-modal__overlay"
    >
      <div className="kudos-users-modal__content">
        {isLoading && <Loader text="Завантажуємо..." size="small" />}

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
                  <img
                    src={user.avatarUrl}
                    alt=""
                    loading="lazy"
                    decoding="async"
                  />
                ) : (
                  (user.name || "К").charAt(0).toUpperCase()
                )}
              </span>

              <strong>{user.name || "Користувач"}</strong>
            </button>
          ))}

        {!isLoading && users.length === 0 && (
          <p className="kudos-users-modal__empty">
            Поки ніхто не підтримав.
          </p>
        )}
      </div>
    </Modal>
  );
};

export default KudosUsersModal;
