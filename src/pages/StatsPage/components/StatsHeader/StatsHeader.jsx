import "./StatsHeader.css";

const StatsHeader = ({ year, currentYear, onYearChange }) => {
  return (
    <section className="stats-header">
      <div className="stats-header__top">
        <div>
          <p className="stats-eyebrow">Аналітика читання</p>

          <h1>Статистика</h1>
        </div>

        <label className="stats-year">
          <span>Рік</span>

          <select
            value={year}
            onChange={(event) => onYearChange(Number(event.target.value))}
          >
            {Array.from(
              {
                length: 6,
              },
              (_, index) => {
                const optionYear = currentYear - index;

                return (
                  <option key={optionYear} value={optionYear}>
                    {optionYear}
                  </option>
                );
              },
            )}
          </select>
        </label>
      </div>

      <p className="stats-header__description">
        Твоя активність, прочитані книги та прогрес за обраний рік.
      </p>
    </section>
  );
};

export default StatsHeader;
