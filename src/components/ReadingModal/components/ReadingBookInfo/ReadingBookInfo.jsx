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

  const coverUrl = getCoverUrl();

  const progressMode = currentBook.progressMode ?? "PAGES";

  const isPercentMode = progressMode === "PERCENT";

  const safeProgress = Math.min(Math.max(Number(progress) || 0, 0), 100);

  const progressAngle = safeProgress * 3.6;

  const currentValue = isPercentMode
    ? `${currentBook.currentPercent ?? 0}%`
    : (currentBook.currentPage ?? 0);

  const totalValue = isPercentMode ? "100%" : (currentBook.pages ?? "—");

  const handleStatusClick = (event) => {
    event.preventDefault();
    event.stopPropagation();

    if (typeof onStatusClick === "function") {
      onStatusClick();
    }
  };

  return (
    <section className="reading-modal__book-card">
      <div className="reading-modal__book-main">
        <div className="reading-modal__cover">
          {coverUrl ? (
            <img src={coverUrl} alt={currentBook.title} />
          ) : (
            <div className="reading-modal__no-cover">Немає обкладинки</div>
          )}
        </div>

        <div className="reading-modal__book-details">
          <div className="reading-modal__book-meta">
            <div className="reading-modal__book-meta-item">
              <span className="reading-modal__book-meta-label">Прогрес</span>

              <strong className="reading-modal__book-meta-value">
                {currentValue}

                {!isPercentMode && currentBook.pages && (
                  <span> / {currentBook.pages}</span>
                )}
              </strong>
            </div>

            <button
              type="button"
              className="reading-modal__book-status-button"
              onClick={handleStatusClick}
              aria-label="Змінити статус книги"
              title="Змінити статус книги"
            >
              <span className="reading-modal__book-meta-label">Статус</span>

              <span className="reading-modal__book-status-row">
                <strong>{statusLabel}</strong>

                <span
                  className="reading-modal__book-status-edit"
                  aria-hidden="true"
                >
                  ✎
                </span>
              </span>
            </button>
          </div>

          <div className="reading-modal__book-rating">
            <span className="reading-modal__book-meta-label">Оцінка</span>

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
                  {value <= (currentBook.rating ?? 0) ? "★" : "☆"}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div
          className="reading-modal__progress-ring"
          style={{
            "--reading-progress-angle": `${progressAngle}deg`,
          }}
          aria-label={`Прогрес читання ${Math.round(safeProgress)}%`}
        >
          <div className="reading-modal__progress-ring-inner">
            <strong>{Math.round(safeProgress)}%</strong>

            <span>
              {isPercentMode
                ? "прочитано"
                : currentBook.pages
                  ? `${currentBook.currentPage ?? 0}/${currentBook.pages}`
                  : `${currentBook.currentPage ?? 0} стор.`}
            </span>
          </div>
        </div>
      </div>

      <div className="reading-modal__book-footer">
        <div>
          <span>Спосіб прогресу</span>

          <strong>{isPercentMode ? "Відсотки" : "Сторінки"}</strong>
        </div>

        <div>
          <span>Всього</span>

          <strong>{totalValue}</strong>
        </div>
      </div>
    </section>
  );
};

export default ReadingBookInfo;
