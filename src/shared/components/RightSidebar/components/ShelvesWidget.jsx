const BookIcon = () => (
  <svg viewBox="0 0 24 24" aria-hidden="true">
    <path d="M4 5.5A2.5 2.5 0 0 1 6.5 3H11a2 2 0 0 1 2 2v16a2 2 0 0 0-2-2H6.5A2.5 2.5 0 0 0 4 21.5v-16Z" />
    <path d="M20 5.5A2.5 2.5 0 0 0 17.5 3H13v18a2 2 0 0 1 2-2h2.5a2.5 2.5 0 0 1 2.5 2.5v-16Z" />
  </svg>
);

const BookmarkIcon = () => (
  <svg viewBox="0 0 24 24" aria-hidden="true">
    <path d="M6 4.5A1.5 1.5 0 0 1 7.5 3h9A1.5 1.5 0 0 1 18 4.5V21l-6-4-6 4V4.5Z" />
  </svg>
);

const CheckIcon = () => (
  <svg viewBox="0 0 24 24" aria-hidden="true">
    <circle cx="12" cy="12" r="9" />
    <path d="m8 12 2.5 2.5L16 9" />
  </svg>
);

const ReadingIcon = () => (
  <svg viewBox="0 0 24 24" aria-hidden="true">
    <path d="M3.5 5.5A2.5 2.5 0 0 1 6 3h4a2 2 0 0 1 2 2v15a2 2 0 0 0-2-2H6a2.5 2.5 0 0 0-2.5 2.5v-15Z" />
    <path d="M20.5 5.5A2.5 2.5 0 0 0 18 3h-4a2 2 0 0 0-2 2v15a2 2 0 0 1 2-2h4a2.5 2.5 0 0 1 2.5 2.5v-15Z" />
  </svg>
);

const ShelvesWidget = ({
  currentBooksCount,
  wishlistCount,
  finishedCount,
  isLoading,
}) => (
  <section className="right-widget">
    <div className="right-widget__header">
      <div className="right-widget__title">
        <BookIcon />
        <h2>Мої полиці</h2>
      </div>
    </div>

    <div className="right-shelves">
      <div className="right-shelf">
        <div className="right-shelf__icon">
          <ReadingIcon />
        </div>
        <div className="right-shelf__content">
          <span>Читаю зараз</span>
          <strong>{isLoading ? "..." : currentBooksCount}</strong>
        </div>
      </div>

      <div className="right-shelf">
        <div className="right-shelf__icon">
          <BookmarkIcon />
        </div>
        <div className="right-shelf__content">
          <span>Хочу прочитати</span>
          <strong>{isLoading ? "..." : wishlistCount}</strong>
        </div>
      </div>

      <div className="right-shelf">
        <div className="right-shelf__icon">
          <CheckIcon />
        </div>
        <div className="right-shelf__content">
          <span>Прочитано</span>
          <strong>{isLoading ? "..." : finishedCount}</strong>
        </div>
      </div>
    </div>
  </section>
);

export default ShelvesWidget;
