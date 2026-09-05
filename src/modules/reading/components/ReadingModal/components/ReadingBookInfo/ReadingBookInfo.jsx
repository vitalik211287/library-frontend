import "./ReadingBookInfo.css";

const ReadingBookInfo = ({
  currentBook,
  apiUrl,
  statusLabel,
  progress,
  ratingLoading,
  onRatingChange,
  onStatusClick,
}) => {
  const getCoverUrl = () => {
    if (!currentBook.coverUrl) {
      return null;
    }

    if (currentBook.coverUrl.startsWith("/uploads")) {
      return `${apiUrl}${currentBook.coverUrl}`;
    }

    return currentBook.coverUrl;
  };

  const getStatusClassName = () => {
    switch (statusLabel) {
      case "Читаю":
        return "reading-modal__cover-status--reading";

      case "Пауза":
        return "reading-modal__cover-status--paused";

      case "Прочитано":
        return "reading-modal__cover-status--finished";

      default:
        return "reading-modal__cover-status--not-started";
    }
  };

  const coverUrl = getCoverUrl();

  const progressMode = currentBook.progressMode ?? "PAGES";

  const isPercentMode = progressMode === "PERCENT";

  const safeProgress = Math.min(
    Math.max(Number(progress) || 0, 0),
    100,
  );

  const progressAngle = safeProgress * 3.6;

  const currentValue = isPercentMode
    ? `${currentBook.currentPercent ?? 0}%`
    : currentBook.currentPage ?? 0;

  const totalValue = isPercentMode
    ? "100%"
    : currentBook.pages ?? "—";

  const handleStatusClick = (event) => {
    event.preventDefault();
    event.stopPropagation();

    if (typeof onStatusClick === "function") {
      onStatusClick();
    }
  };

  return (
    <section className="reading-modal__book-card">
      <div className="reading-modal__cover">
        {coverUrl ? (
          <img
            src={coverUrl}
            alt={currentBook.title}
          />
        ) : (
          <div className="reading-modal__no-cover">
            Немає обкладинки
          </div>
        )}

        <button
          type="button"
          className={`reading-modal__cover-status ${getStatusClassName()}`}
          onClick={handleStatusClick}
          aria-label="Змінити статус книги"
          title="Змінити статус книги"
        >
          <span className="reading-modal__cover-status-dot" />

          <strong>{statusLabel}</strong>

          <span
            className="reading-modal__cover-status-edit"
            aria-hidden="true"
          >
            ✎
          </span>
        </button>
      </div>

      <div className="reading-modal__book-content">
        <div className="reading-modal__book-progress">
          <div className="reading-modal__book-progress-info">
            <span className="reading-modal__book-meta-label">
              Прогрес
            </span>

            <strong className="reading-modal__book-meta-value">
              {currentValue}

              {!isPercentMode && currentBook.pages && (
                <span> / {currentBook.pages}</span>
              )}
            </strong>

            <div
              className="reading-modal__progress-line"
              aria-hidden="true"
            >
              <div
                className="reading-modal__progress-line-value"
                style={{
                  width: `${safeProgress}%`,
                }}
              />
            </div>
          </div>

          <div
            className="reading-modal__progress-ring"
            style={{
              "--reading-progress-angle": `${progressAngle}deg`,
            }}
            aria-label={`Прогрес читання ${Math.round(
              safeProgress,
            )}%`}
          >
            <div className="reading-modal__progress-ring-inner">
              <strong>{Math.round(safeProgress)}%</strong>

              <span>прочитано</span>
            </div>
          </div>
        </div>

        <div className="reading-modal__book-rating">
          <span className="reading-modal__book-meta-label">
            Оцінка
          </span>

          <div className="reading-modal__rating">
            {[1, 2, 3, 4, 5].map((value) => (
              <button
                key={value}
                type="button"
                className="reading-modal__star"
                onClick={() => onRatingChange(value)}
                disabled={ratingLoading}
                aria-label={`Оцінити на ${value} з 5`}
              >
                {value <= (currentBook.rating ?? 0)
                  ? "★"
                  : "☆"}
              </button>
            ))}
          </div>
        </div>

        <div className="reading-modal__book-footer">
          <div className="reading-modal__book-footer-item">
            <span>Спосіб прогресу</span>

            <strong>
              {isPercentMode ? "Відсотки" : "Сторінки"}
            </strong>
          </div>

          <div className="reading-modal__book-footer-item">
            <span>Всього</span>

            <strong>{totalValue}</strong>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ReadingBookInfo;
