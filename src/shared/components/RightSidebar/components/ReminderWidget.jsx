const BookIcon = () => (
  <svg viewBox="0 0 24 24" aria-hidden="true">
    <path d="M4 5.5A2.5 2.5 0 0 1 6.5 3H11a2 2 0 0 1 2 2v16a2 2 0 0 0-2-2H6.5A2.5 2.5 0 0 0 4 21.5v-16Z" />
    <path d="M20 5.5A2.5 2.5 0 0 0 17.5 3H13v18a2 2 0 0 1 2-2h2.5a2.5 2.5 0 0 1 2.5 2.5v-16Z" />
  </svg>
);

const ClockIcon = () => (
  <svg viewBox="0 0 24 24" aria-hidden="true">
    <circle cx="12" cy="12" r="9" />
    <path d="M12 7v5l3 2" />
  </svg>
);

const ReminderWidget = ({ mainCurrentBook }) => (
  <section className="right-widget">
    <div className="right-widget__header">
      <div className="right-widget__title">
        <ClockIcon />
        <h2>Нагадування</h2>
      </div>
    </div>

    <div className="right-reminder">
      <div className="right-reminder__icon">
        <BookIcon />
      </div>

      <div className="right-reminder__content">
        <strong>Продовжити читання</strong>
        <span>
          {mainCurrentBook ? mainCurrentBook.title : "Немає активної книги"}
        </span>
      </div>
    </div>
  </section>
);

export default ReminderWidget;
