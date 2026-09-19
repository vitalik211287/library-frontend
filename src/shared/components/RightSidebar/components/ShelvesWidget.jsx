import Icon from "../../Icon/Icon.jsx";

const ShelvesWidget = ({
  currentBooksCount,
  wishlistCount,
  finishedCount,
  isLoading,
}) => (
  <section className="right-widget">
    <div className="right-widget__header">
      <div className="right-widget__title">
        <Icon name="book" />
        <h2>Мої полиці</h2>
      </div>
    </div>

    <div className="right-shelves">
      <div className="right-shelf">
        <div className="right-shelf__icon">
          <Icon name="reading" />
        </div>
        <div className="right-shelf__content">
          <span>Читаю зараз</span>
          <strong>{isLoading ? "..." : currentBooksCount}</strong>
        </div>
      </div>

      <div className="right-shelf">
        <div className="right-shelf__icon">
          <Icon name="bookmark" />
        </div>
        <div className="right-shelf__content">
          <span>Хочу прочитати</span>
          <strong>{isLoading ? "..." : wishlistCount}</strong>
        </div>
      </div>

      <div className="right-shelf">
        <div className="right-shelf__icon">
          <Icon name="check" />
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
