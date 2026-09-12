import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

import "./KudosUsersSheet.css";

const KudosUsersSheet = ({
  isOpen,
  users,
  isLoading,
  error,
  onClose,
}) => {
  const navigate = useNavigate();

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    const handleKeyDown = (event) => {
      if (event.key === "Escape") {
        onClose();
      }
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen) {
    return null;
  }

  return (
    <div
      className="kudos-sheet-backdrop"
      role="presentation"
      onClick={onClose}
    >
      <section
        className="kudos-sheet"
        role="dialog"
        aria-modal="true"
        aria-label="Kudos"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="kudos-sheet__handle" />

        <header className="kudos-sheet__header">
          <div>
            <h2>Kudos</h2>
            <p>
              {isLoading ? "Завантаження..." : `${users.length} підтримали`}
            </p>
          </div>

          <button
            type="button"
            className="kudos-sheet__close"
            onClick={onClose}
            aria-label="Закрити"
          >
            ×
          </button>
        </header>

        <div className="kudos-sheet__content">
          {isLoading && (
            <div className="kudos-sheet__state">
              Завантажуємо...
            </div>
          )}

          {!isLoading && error && (
            <div className="kudos-sheet__state">
              Не вдалося завантажити kudos
            </div>
          )}

          {!isLoading && !error && users.length === 0 && (
            <div className="kudos-sheet__state">
              Kudos поки немає
            </div>
          )}

          {!isLoading && !error && users.length > 0 && (
            <div className="kudos-sheet__list">
              {users.map((user) => {
                const name = user.name || "Користувач";

                return (
                  <button
                    key={user.id}
                    type="button"
                    className="kudos-user"
                    onClick={() => {
                      onClose();
                      navigate(`/users/${user.id}`);
                    }}
                  >
                    <div className="kudos-user__avatar">
                      {user.avatarUrl ? (
                        <img src={user.avatarUrl} alt={name} />
                      ) : (
                        <span>{name.charAt(0).toUpperCase()}</span>
                      )}
                    </div>

                    <div className="kudos-user__content">
                      <strong>{name}</strong>
                      <span>Поставив kudos</span>
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </div>
      </section>
    </div>
  );
};

export default KudosUsersSheet;
