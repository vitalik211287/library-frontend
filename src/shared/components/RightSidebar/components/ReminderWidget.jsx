import Icon from "../../Icon/Icon.jsx";

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
        <Icon name="book" />
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
