import { useState } from "react";

const SocialPostActionsMenu = ({ onEdit, onDelete }) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="social-post-card__menu">
      <button
        type="button"
        className="social-post-card__menu-button"
        aria-label={"\u0414\u0456\u0457 \u0437 \u0434\u043e\u043f\u0438\u0441\u043e\u043c"}
        aria-expanded={isOpen}
        onClick={() => setIsOpen((current) => !current)}
      >
        <span>{"\u2022\u2022\u2022"}</span>
      </button>

      {isOpen && (
        <div className="social-post-card__menu-dropdown">
          <button
            type="button"
            onClick={() => {
              setIsOpen(false);
              onEdit();
            }}
          >
            {"\u0420\u0435\u0434\u0430\u0433\u0443\u0432\u0430\u0442\u0438"}
          </button>

          <button
            type="button"
            className="social-post-card__menu-delete"
            onClick={() => {
              setIsOpen(false);
              onDelete();
            }}
          >
            {"\u0412\u0438\u0434\u0430\u043b\u0438\u0442\u0438"}
          </button>
        </div>
      )}
    </div>
  );
};

export default SocialPostActionsMenu;
