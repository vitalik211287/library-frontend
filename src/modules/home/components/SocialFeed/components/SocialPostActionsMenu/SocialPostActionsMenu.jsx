import { useState } from "react";
import Icon from "../../../../../../shared/components/Icon/Icon.jsx";

const SocialPostActionsMenu = ({ onEdit, onDelete }) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="social-post-card__menu">
      <button
        type="button"
        className="social-feed-card__more"
        aria-label={"\u0414\u0456\u0457 \u0437 \u0434\u043e\u043f\u0438\u0441\u043e\u043c"}
        aria-expanded={isOpen}
        onClick={() => setIsOpen((current) => !current)}
      >
        <Icon name="more-horizontal" />
      </button>

      {isOpen && (
        <div className="social-post-card__menu-dropdown">
          <button
            type="button"
            aria-label="Редагувати допис"
            title="Редагувати"
            onClick={() => {
              setIsOpen(false);
              onEdit();
            }}
          >
            <Icon name="edit" size={18} />
          </button>

          <button
            type="button"
            className="social-post-card__menu-delete"
            aria-label="Видалити допис"
            title="Видалити"
            onClick={() => {
              setIsOpen(false);
              onDelete();
            }}
          >
            <Icon name="trash" size={18} />
          </button>
        </div>
      )}
    </div>
  );
};

export default SocialPostActionsMenu;
