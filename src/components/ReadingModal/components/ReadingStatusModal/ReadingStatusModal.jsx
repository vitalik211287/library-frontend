import Modal from "../../../Modal/Modal.jsx";

import "./ReadingStatusModal.css";

const STATUS_OPTIONS = [
  {
    value: "NOT_STARTED",
    label: "Не почато",
    description: "Книгу ще не починали читати",
  },
  {
    value: "READING",
    label: "Читаю",
    description: "Книга зараз у процесі читання",
  },
  {
    value: "PAUSED",
    label: "Пауза",
    description: "Читання книги тимчасово відкладено",
  },
  {
    value: "FINISHED",
    label: "Прочитано",
    description: "Позначити книгу як прочитану",
  },
];

const ReadingStatusModal = ({
  currentStatus,
  activeSession,
  loading,
  onChange,
  onClose,
}) => {
  const handleClose = () => {
    if (loading) {
      return;
    }

    onClose();
  };

  const handleChange = async (status) => {
    const success = await onChange(status);

    if (success) {
      onClose();
    }
  };

  return (
    <Modal
      isOpen
      onClose={handleClose}
      title="Статус книги"
      subtitle="Оберіть поточний статус"
      className="reading-status-modal"
      closeOnEscape={!loading}
      closeOnBackdrop={!loading}
    >
      {activeSession && (
        <div className="reading-status-modal__warning">
          Спочатку завершіть активну сесію читання, щоб змінити статус книги.
        </div>
      )}

      <div className="reading-status-modal__options">
        {STATUS_OPTIONS.map((option) => {
          const selected = currentStatus === option.value;

          return (
            <button
              key={option.value}
              type="button"
              className={`reading-status-modal__option ${
                selected ? "reading-status-modal__option--active" : ""
              }`}
              onClick={() => handleChange(option.value)}
              disabled={loading || Boolean(activeSession)}
            >
              <span className="reading-status-modal__radio">
                {selected && <span />}
              </span>

              <span className="reading-status-modal__option-text">
                <strong>{option.label}</strong>

                <span>{option.description}</span>
              </span>
            </button>
          );
        })}
      </div>
    </Modal>
  );
};

export default ReadingStatusModal;
