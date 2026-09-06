const ClockIcon = () => (
  <svg viewBox="0 0 24 24" aria-hidden="true">
    <circle cx="12" cy="12" r="9" />
    <path d="M12 7v5l3 2" />
  </svg>
);

const ActivityWidget = ({
  currentBooksCount,
  finishedCount,
  isLoading,
}) => (
  <section className="right-widget">
    <div className="right-widget__header">
      <div className="right-widget__title">
        <ClockIcon />
        <h2>Активність</h2>
      </div>
    </div>

    <div className="right-activity">
      <div className="right-activity__item">
        <span>Активних книг</span>
        <strong>{isLoading ? "..." : currentBooksCount}</strong>
      </div>

      <div className="right-activity__divider" />

      <div className="right-activity__item">
        <span>Завершено</span>
        <strong>{isLoading ? "..." : finishedCount}</strong>
      </div>
    </div>

    <p className="right-widget__note">
      Детальна статистика читання з’явиться тут, коли підключимо дані сесій
      читання.
    </p>
  </section>
);

export default ActivityWidget;
