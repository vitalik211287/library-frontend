import Icon from "../../Icon/Icon.jsx";

const ReminderWidget = ({ mainCurrentBook }) => (
  <section className="right-widget">
    <div className="right-widget__header">
      <div className="right-widget__title">
        <Icon name="clock" />
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
