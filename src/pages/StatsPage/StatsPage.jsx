import { useEffect, useMemo, useState } from "react";
import "./StatsPage.css";

const API_URL =
  "https://library-backend-production-5d60.up.railway.app";

const MONTH_NAMES = [
  "Січ",
  "Лют",
  "Бер",
  "Кві",
  "Тра",
  "Чер",
  "Лип",
  "Сер",
  "Вер",
  "Жов",
  "Лис",
  "Гру",
];

const formatReadingTime = (seconds = 0) => {
  if (!seconds) {
    return "0 хв";
  }

  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);

  if (hours === 0) {
    return `${minutes} хв`;
  }

  if (minutes === 0) {
    return `${hours} год`;
  }

  return `${hours} год ${minutes} хв`;
};

const StatsPage = () => {
  const currentYear = new Date().getFullYear();

  const [year, setYear] = useState(currentYear);
  const [stats, setStats] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const getStats = async () => {
      const token = localStorage.getItem("token");

      if (!token) {
        setError("Потрібно увійти в акаунт");
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        setError("");

        const response = await fetch(
          `${API_URL}/api/user-books/stats?year=${year}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          },
        );

        const data = await response.json();

        if (!response.ok) {
          throw new Error(
            data.message || "Не вдалося завантажити статистику",
          );
        }

        setStats(data.stats);
      } catch (error) {
        console.error("Get stats error:", error);

        setError(
          error.message ||
            "Не вдалося завантажити статистику",
        );
      } finally {
        setIsLoading(false);
      }
    };

    getStats();
  }, [year]);

  const maxMonthPages = useMemo(() => {
    if (!stats?.months?.length) {
      return 1;
    }

    return Math.max(
      ...stats.months.map((month) => month.pages || 0),
      1,
    );
  }, [stats]);

  const maxGenreBooks = useMemo(() => {
    if (!stats?.genres?.length) {
      return 1;
    }

    return Math.max(
      ...stats.genres.map((genre) => genre.books || 0),
      1,
    );
  }, [stats]);

  if (isLoading) {
    return (
      <main className="stats-page">
        <div className="stats-state">
          Завантажуємо статистику...
        </div>
      </main>
    );
  }

  if (error) {
    return (
      <main className="stats-page">
        <div className="stats-state stats-state--error">
          {error}
        </div>
      </main>
    );
  }

  if (!stats) {
    return null;
  }

  const {
    summary,
    streak,
    genres = [],
    authors = [],
    months = [],
  } = stats;

  return (
    <main className="stats-page">
      <section className="stats-header">
        <div>
          <p className="stats-eyebrow">
            Аналітика читання
          </p>

          <h1>Статистика</h1>

          <p className="stats-header__description">
            Твоя активність, прочитані книги та прогрес за
            обраний рік.
          </p>
        </div>

        <label className="stats-year">
          <span>Рік</span>

          <select
            value={year}
            onChange={(event) =>
              setYear(Number(event.target.value))
            }
          >
            {Array.from({ length: 6 }, (_, index) => {
              const optionYear = currentYear - index;

              return (
                <option
                  key={optionYear}
                  value={optionYear}
                >
                  {optionYear}
                </option>
              );
            })}
          </select>
        </label>
      </section>

      <section className="stats-summary">
        <article className="stats-summary-card">
          <div className="stats-summary-card__icon">
            <svg
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <path d="M4 5.5A2.5 2.5 0 0 1 6.5 3H11a2 2 0 0 1 2 2v16a2 2 0 0 0-2-2H6.5A2.5 2.5 0 0 0 4 21.5v-16Z" />
              <path d="M20 5.5A2.5 2.5 0 0 0 17.5 3H13v18a2 2 0 0 1 2-2h2.5a2.5 2.5 0 0 1 2.5 2.5v-16Z" />
            </svg>
          </div>

          <div>
            <strong>{summary.finishedBooks}</strong>
            <span>прочитано книг</span>
          </div>
        </article>

        <article className="stats-summary-card">
          <div className="stats-summary-card__icon">
            <svg
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <path d="M6 3h12a2 2 0 0 1 2 2v16l-8-4-8 4V5a2 2 0 0 1 2-2Z" />
            </svg>
          </div>

          <div>
            <strong>{summary.pagesRead}</strong>
            <span>сторінок</span>
          </div>
        </article>

        <article className="stats-summary-card">
          <div className="stats-summary-card__icon">
            <svg
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <circle cx="12" cy="12" r="9" />
              <path d="M12 7v5l3 2" />
            </svg>
          </div>

          <div>
            <strong>
              {formatReadingTime(
                summary.readingSeconds,
              )}
            </strong>
            <span>час читання</span>
          </div>
        </article>

        <article className="stats-summary-card">
          <div className="stats-summary-card__icon">
            <svg
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <path d="m12 3 2.8 5.67 6.2.9-4.5 4.39 1.06 6.18L12 17.22l-5.56 2.92 1.06-6.18L3 9.57l6.2-.9L12 3Z" />
            </svg>
          </div>

          <div>
            <strong>
              {summary.averageRating || "—"}
            </strong>
            <span>середній рейтинг</span>
          </div>
        </article>
      </section>

      <section className="stats-grid">
        <article className="stats-card stats-card--activity">
          <div className="stats-card__header">
            <div>
              <h2>Активність за рік</h2>
              <p>Прочитані сторінки по місяцях</p>
            </div>
          </div>

          <div className="stats-month-chart">
            {months.map((month) => {
              const height =
                month.pages === 0
                  ? 3
                  : Math.max(
                      (month.pages / maxMonthPages) *
                        100,
                      8,
                    );

              return (
                <div
                  className="stats-month"
                  key={month.month}
                >
                  <div className="stats-month__value">
                    {month.pages || ""}
                  </div>

                  <div className="stats-month__bar-track">
                    <div
                      className="stats-month__bar"
                      style={{
                        height: `${height}%`,
                      }}
                      title={`${month.pages} сторінок`}
                    />
                  </div>

                  <span>
                    {MONTH_NAMES[
                      month.month - 1
                    ]}
                  </span>
                </div>
              );
            })}
          </div>
        </article>

        <article className="stats-card stats-card--streak">
          <div className="stats-card__header">
            <div>
              <h2>Серія читання</h2>
              <p>Послідовні дні з читанням</p>
            </div>
          </div>

          <div className="streak-main">
            <div className="streak-main__icon">
              <svg
                viewBox="0 0 24 24"
                aria-hidden="true"
              >
                <path d="M13 2s1 4-2 7c-2 2-4 4-4 7a5 5 0 0 0 10 0c0-2-1-4-2-5 0 3-2 4-3 4 1-3-1-5-1-5" />
              </svg>
            </div>

            <div>
              <strong>{streak.current}</strong>
              <span>днів поспіль</span>
            </div>
          </div>

          <div className="streak-details">
            <div>
              <span>Найдовша серія</span>
              <strong>
                {streak.longest} дн.
              </strong>
            </div>

            <div>
              <span>Сьогодні</span>
              <strong>
                {streak.readToday
                  ? "Прочитано"
                  : "Ще ні"}
              </strong>
            </div>
          </div>
        </article>

        <article className="stats-card">
          <div className="stats-card__header">
            <div>
              <h2>Жанри</h2>
              <p>Розподіл прочитаних книг</p>
            </div>
          </div>

          {genres.length === 0 ? (
            <div className="stats-empty">
              Поки немає даних
            </div>
          ) : (
            <div className="genre-list">
              {genres.map((genre) => {
                const width =
                  (genre.books /
                    maxGenreBooks) *
                  100;

                return (
                  <div
                    className="genre-item"
                    key={genre.name}
                  >
                    <div className="genre-item__top">
                      <strong>
                        {genre.name}
                      </strong>

                      <span>
                        {genre.books} ·{" "}
                        {genre.percent}%
                      </span>
                    </div>

                    <div className="genre-item__track">
                      <div
                        className="genre-item__bar"
                        style={{
                          width: `${width}%`,
                        }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </article>

        <article className="stats-card">
          <div className="stats-card__header">
            <div>
              <h2>Улюблені автори</h2>
              <p>За кількістю прочитаних книг</p>
            </div>
          </div>

          {authors.length === 0 ? (
            <div className="stats-empty">
              Поки немає даних
            </div>
          ) : (
            <div className="authors-list">
              {authors.map((author, index) => (
                <div
                  className="author-item"
                  key={author.name}
                >
                  <span className="author-item__position">
                    {index + 1}
                  </span>

                  <div className="author-item__content">
                    <strong>{author.name}</strong>
                    <span>
                      {author.books}{" "}
                      {author.books === 1
                        ? "книга"
                        : "книги"}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </article>
      </section>

      <section className="stats-extra">
        <article>
          <span>Сесій читання</span>
          <strong>{summary.sessions}</strong>
        </article>

        <article>
          <span>Середня сесія</span>
          <strong>
            {formatReadingTime(
              summary.averageSessionSeconds,
            )}
          </strong>
        </article>

        <article>
          <span>Сторінок / год</span>
          <strong>{summary.pagesPerHour}</strong>
        </article>
      </section>
    </main>
  );
};

export default StatsPage;