import Modal from "../../../../../../shared/components/Modal/Modal.jsx";
import Icon from "../../../../../../shared/components/Icon/Icon.jsx";

import "./LogoutModal.css";

const LogoutModal = ({ isOpen, onConfirm, onCancel }) => {
  return (
    <Modal
      isOpen={isOpen}
      onClose={onCancel}
      className="logout-modal"
      showHeader={false}
      ariaLabel="Вийти з акаунта?"
    >
      <div className="logout-modal__content">
        <div className="logout-modal__icon">
          <Icon name="logout" />
        </div>

        <h3>Вийти з акаунта?</h3>

        <p>
          Щоб знову користуватися своєю бібліотекою, потрібно буде увійти
          повторно.
        </p>

        <div className="logout-modal__actions">
          <button type="button" onClick={onCancel}>
            Скасувати
          </button>

          <button
            type="button"
            className="logout-modal__confirm"
            onClick={onConfirm}
          >
            Вийти
          </button>
        </div>
      </div>
    </Modal>
  );
};

export default LogoutModal;
