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
  const handleChange = async (status) => {
    const success = await onChange(status);

    if (success) {
      onClose();
    }
  };

  const handleOverlayClick = (event) => {
    if (event.target === event.currentTarget) {
      onClose();
    }
  };

  return (
    <div className="reading-status-overlay" onMouseDown={handleOverlayClick}>
      <div
        className="reading-status-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="reading-status-title"
        onMouseDown={(event) => event.stopPropagation()}
      >
        <div className="reading-status-modal__header">
          <h3 id="reading-status-title">Статус книги</h3>

          <button
            type="button"
            className="reading-status-modal__close"
            onClick={onClose}
            disabled={loading}
            aria-label="Закрити"
          >
            ×
          </button>
        </div>

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
      </div>
    </div>
  );
};

export default ReadingStatusModal;
