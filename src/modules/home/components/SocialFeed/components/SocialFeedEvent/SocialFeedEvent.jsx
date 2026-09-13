import { BookIcon, TrophyIcon } from "../../../HomeIcons.jsx";

import "./SocialFeedEvent.css";

const BookPreview = ({ book, label }) => {
  if (!book) {
    return null;
  }

  return (
    <div className="social-feed-event__book">
      <div className="social-feed-event__cover">
        {book.coverUrl ? (
          <img
            src={book.coverUrl}
            alt={book.title}
          />
        ) : (
          <BookIcon />
        )}
      </div>

      <div className="social-feed-event__book-content">
        <small>{label}</small>

        <strong>{book.title || "Книга"}</strong>

        <span>{book.author || "Автор не вказаний"}</span>
      </div>
    </div>
  );
};

const SocialFeedEvent = ({
  activity,
  onOpenBook,
  onOpenAchievement,
}) => {
  if (!activity) {
    return null;
  }

  if (activity.type === "READING_STARTED") {
    return (
      <button
        type="button"
        className="social-feed-event social-feed-event--reading"
        onClick={() => onOpenBook?.(activity.book)}
      >
        <div className="social-feed-event__heading">
          <span className="social-feed-event__icon">
            <BookIcon />
          </span>

          <div>
            <small>Нова активність</small>
            <strong>Почав читати</strong>
          </div>

          <span className="social-feed-event__arrow">›</span>
        </div>

        <BookPreview
          book={activity.book}
          label="Зараз читає"
        />
      </button>
    );
  }

  if (activity.type === "BOOK_FINISHED") {
    return (
      <button
        type="button"
        className="social-feed-event social-feed-event--finished"
        onClick={() => onOpenBook?.(activity.book)}
      >
        <div className="social-feed-event__heading">
          <span className="social-feed-event__icon">
            <BookIcon />
          </span>

          <div>
            <small>Нова активність</small>
            <strong>Прочитав книгу</strong>
          </div>

          <span className="social-feed-event__arrow">›</span>
        </div>

        <BookPreview
          book={activity.book}
          label="Прочитана книга"
        />
      </button>
    );
  }

  if (activity.type === "RATING_ADDED") {
    const rating = Math.max(
      0,
      Math.min(Number(activity.rating) || 0, 5),
    );

    return (
      <button
        type="button"
        className="social-feed-event social-feed-event--rating"
        onClick={() => onOpenBook?.(activity.book)}
      >
        <div className="social-feed-event__heading">
          <span className="social-feed-event__rating-icon">
            ★
          </span>

          <div>
            <small>Нова оцінка</small>
            <strong>Оцінив книгу</strong>

            <span className="social-feed-event__stars">
              {"★".repeat(rating)}
              {"☆".repeat(5 - rating)}
              <b>{rating}/5</b>
            </span>
          </div>

          <span className="social-feed-event__arrow">›</span>
        </div>

        <BookPreview
          book={activity.book}
          label="Оцінена книга"
        />
      </button>
    );
  }

  if (activity.type === "ACHIEVEMENT_UNLOCKED") {
    return (
      <button
        type="button"
        className="social-feed-event social-feed-event--achievement"
        onClick={() => onOpenAchievement?.(activity)}
      >
        <div className="social-feed-event__heading">
          <span className="social-feed-event__icon">
            <TrophyIcon />
          </span>

          <div>
            <small>Нове досягнення</small>

            <strong>
              {activity.achievement?.title || "Досягнення"}
            </strong>

            {activity.achievement?.description && (
              <p>
                {activity.achievement.description}
              </p>
            )}
          </div>

          <span className="social-feed-event__arrow">›</span>
        </div>

        <BookPreview
          book={activity.achievement?.book}
          label="Книга досягнення"
        />
      </button>
    );
  }

  return null;
};

export default SocialFeedEvent;