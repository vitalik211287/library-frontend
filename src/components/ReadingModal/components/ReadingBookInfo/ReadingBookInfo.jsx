import "./ReadingBookInfo.css";

const ReadingBookInfo = ({
  currentBook,
  apiUrl,
  statusLabel,
  progress,
  ratingLoading,
  onRatingChange,
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

  return (
    <>
      <div className="reading-modal__top">
        <div className="reading-modal__cover">
          {coverUrl ? (
            <img src={coverUrl} alt={currentBook.title} />
          ) : (
            <div className="reading-modal__no-cover">Немає обкладинки</div>
          )}
        </div>

        <div className="reading-modal__info">
          <div className="reading-modal__info-item">
            <span className="reading-modal__info-label">Поточна сторінка</span>

            <span className="reading-modal__info-value">
              {currentBook.currentPage ?? 0}
            </span>
          </div>

          <div className="reading-modal__info-item">
            <span className="reading-modal__info-label">Всього сторінок</span>

            <span className="reading-modal__info-value">
              {currentBook.pages ?? "—"}
            </span>
          </div>

          <div className="reading-modal__info-item">
            <span className="reading-modal__info-label">Статус</span>

            <span className="reading-modal__info-value reading-modal__info-value--accent">
              {statusLabel}
            </span>
          </div>

          <div className="reading-modal__info-item">
            <span className="reading-modal__info-label">Оцінка</span>

            <div className="reading-modal__rating">
              {[1, 2, 3, 4, 5].map((value) => (
                <button
                  key={value}
                  type="button"
                  className="reading-modal__star"
                  onClick={() => onRatingChange(value)}
                  disabled={ratingLoading}
                  aria-label={`Оцінити на ${value} з 5`}
                  title={`${value} з 5`}
                >
                  {value <= (currentBook.rating ?? 0) ? "★" : "☆"}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="reading-modal__progress">
        <div className="reading-modal__progress-header">
          <span>Прогрес читання</span>

          <strong>{progress}%</strong>
        </div>

        <div className="reading-modal__progress-track">
          <div
            className="reading-modal__progress-bar"
            style={{
              width: `${Math.min(progress, 100)}%`,
            }}
          />
        </div>
      </div>
    </>
  );
};

export default ReadingBookInfo;
