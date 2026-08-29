import {
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  useNavigate,
} from "react-router-dom";

import "./AchievementsPage.css";

const API_URL =
  "https://library-backend-production-5d60.up.railway.app";

const CATEGORIES = [
  {
    id: "all",
    label: "Усі",
  },
  {
    id: "books",
    label: "Книги",
  },
  {
    id: "pages",
    label: "Сторінки",
  },
  {
    id: "time",
    label: "Час",
  },
  {
    id: "streak",
    label: "Серія",
  },
];

const getAchievementIcon = (
  achievement,
) => {
  if (
    achievement.category ===
    "books"
  ) {
    if (
      achievement.target >= 25
    ) {
      return "🏆";
    }

    if (
      achievement.target >= 10
    ) {
      return "📚";
    }

    return "📖";
  }

  if (
    achievement.category ===
    "pages"
  ) {
    if (
      achievement.target >=
      10000
    ) {
      return "👑";
    }

    return "📜";
  }

  if (
    achievement.category ===
    "time"
  ) {
    if (
      achievement.target >=
      100 * 60 * 60
    ) {
      return "⌛";
    }

    return "⏱️";
  }

  if (
    achievement.category ===
    "streak"
  ) {
    return "🔥";
  }

  return "🏅";
};

const formatNumber = (
  value,
) =>
  new Intl.NumberFormat(
    "uk-UA",
  ).format(
    Number(value) || 0,
  );

const formatSeconds = (
  seconds,
) => {
  const safeSeconds =
    Math.max(
      Number(seconds) || 0,
      0,
    );

  const totalMinutes =
    Math.floor(
      safeSeconds / 60,
    );

  const hours =
    Math.floor(
      totalMinutes / 60,
    );

  const minutes =
    totalMinutes % 60;

  if (hours === 0) {
    return `${minutes} хв`;
  }

  if (minutes === 0) {
    return `${hours} год`;
  }

  return `${hours} год ${minutes} хв`;
};

const formatAchievementValue = (
  achievement,
  value,
) => {
  if (
    achievement.category ===
    "time"
  ) {
    return formatSeconds(
      value,
    );
  }

  if (
    achievement.category ===
    "streak"
  ) {
    return `${formatNumber(
      value,
    )} дн.`;
  }

  return formatNumber(
    value,
  );
};

const AchievementCard = ({
  achievement,
}) => {
  const icon =
    getAchievementIcon(
      achievement,
    );

  const safePercent =
    Math.min(
      Math.max(
        Number(
          achievement.percent,
        ) || 0,
        0,
      ),
      100,
    );

  return (
    <article
      className={`achievement-card ${
        achievement.unlocked
          ? "achievement-card--unlocked"
          : "achievement-card--locked"
      }`}
    >
      <div className="achievement-card__top">
        <div className="achievement-medal">
          <div className="achievement-medal__circle">
            <span
              className="achievement-medal__icon"
              aria-hidden="true"
            >
              {icon}
            </span>
          </div>

          <div className="achievement-medal__ribbons">
            <span />
            <span />
          </div>
        </div>

        <div
          className={`achievement-card__status ${
            achievement.unlocked
              ? "achievement-card__status--unlocked"
              : ""
          }`}
        >
          {achievement.unlocked
            ? "Отримано"
            : "🔒"}
        </div>
      </div>

      <div className="achievement-card__content">
        <h2>
          {achievement.title}
        </h2>

        <p>
          {
            achievement.description
          }
        </p>
      </div>

      <div className="achievement-card__progress">
        <div className="achievement-card__numbers">
          <span>
            {formatAchievementValue(
              achievement,
              achievement.current,
            )}
          </span>

          <span>
            {formatAchievementValue(
              achievement,
              achievement.target,
            )}
          </span>
        </div>

        <div className="achievement-card__track">
          <div
            className="achievement-card__bar"
            style={{
              width: `${safePercent}%`,
            }}
          />
        </div>

        <div className="achievement-card__percent">
          {achievement.unlocked
            ? "Досягнення відкрито"
            : `${safePercent}% виконано`}
        </div>
      </div>
    </article>
  );
};

const AchievementsPage = () => {
  const navigate =
    useNavigate();

  const [
    achievements,
    setAchievements,
  ] = useState([]);

  const [
    summary,
    setSummary,
  ] = useState({
    total: 0,
    unlocked: 0,
    locked: 0,
  });

  const [
    activeCategory,
    setActiveCategory,
  ] = useState("all");

  const [
    isLoading,
    setIsLoading,
  ] = useState(true);

  const [
    error,
    setError,
  ] = useState("");

  useEffect(() => {
    const loadAchievements =
      async () => {
        const token =
          localStorage.getItem(
            "token",
          );

        if (!token) {
          navigate(
            "/login",
            {
              replace: true,
            },
          );

          return;
        }

        try {
          setIsLoading(true);
          setError("");

          const response =
            await fetch(
              `${API_URL}/api/user-books/achievements`,
              {
                headers: {
                  Authorization:
                    `Bearer ${token}`,
                },
              },
            );

          if (
            response.status ===
            401
          ) {
            navigate(
              "/login",
              {
                replace: true,
              },
            );

            return;
          }

          if (!response.ok) {
            throw new Error(
              "Не вдалося завантажити досягнення",
            );
          }

          const data =
            await response.json();

          setAchievements(
            Array.isArray(
              data.achievements,
            )
              ? data.achievements
              : [],
          );

          setSummary({
            total:
              Number(
                data.summary
                  ?.total,
              ) || 0,

            unlocked:
              Number(
                data.summary
                  ?.unlocked,
              ) || 0,

            locked:
              Number(
                data.summary
                  ?.locked,
              ) || 0,
          });
        } catch (error) {
          console.error(
            "Load achievements error:",
            error,
          );

          setError(
            error instanceof
              Error
              ? error.message
              : "Не вдалося завантажити досягнення",
          );
        } finally {
          setIsLoading(
            false,
          );
        }
      };

    loadAchievements();
  }, [navigate]);

  const filteredAchievements =
    useMemo(() => {
      if (
        activeCategory ===
        "all"
      ) {
        return achievements;
      }

      return achievements.filter(
        (achievement) =>
          achievement.category ===
          activeCategory,
      );
    }, [
      achievements,
      activeCategory,
    ]);

  const totalPercent =
    summary.total > 0
      ? Math.round(
          (summary.unlocked /
            summary.total) *
            100,
        )
      : 0;

  return (
    <main className="achievements-page">
      <section className="achievements-hero">
        <div className="achievements-hero__content">
          <span className="achievements-hero__eyebrow">
            Колекція нагород
          </span>

          <h1>
            Досягнення
          </h1>

          <p>
            Читай книги,
            набирай сторінки,
            проводь більше часу
            за читанням і
            відкривай нові
            медалі.
          </p>
        </div>

        <div className="achievements-summary">
          <div className="achievements-summary__medal">
            <span>
              🏅
            </span>
          </div>

          <div className="achievements-summary__content">
            <strong>
              {summary.unlocked}
              {" "}
              із
              {" "}
              {summary.total}
            </strong>

            <span>
              медалей відкрито
            </span>
          </div>

          <div className="achievements-summary__track">
            <div
              className="achievements-summary__bar"
              style={{
                width:
                  `${totalPercent}%`,
              }}
            />
          </div>

          <small>
            {totalPercent}% колекції
          </small>
        </div>
      </section>

      <section className="achievements-filters">
        {CATEGORIES.map(
          (category) => (
            <button
              key={
                category.id
              }
              type="button"
              className={
                activeCategory ===
                category.id
                  ? "achievements-filter achievements-filter--active"
                  : "achievements-filter"
              }
              onClick={() =>
                setActiveCategory(
                  category.id,
                )
              }
            >
              {
                category.label
              }
            </button>
          ),
        )}
      </section>

      {isLoading && (
        <div className="achievements-state">
          Завантажуємо
          досягнення...
        </div>
      )}

      {!isLoading &&
        error && (
          <div className="achievements-state achievements-state--error">
            {error}
          </div>
        )}

      {!isLoading &&
        !error &&
        filteredAchievements.length ===
          0 && (
          <div className="achievements-state">
            У цій категорії
            поки немає
            досягнень
          </div>
        )}

      {!isLoading &&
        !error &&
        filteredAchievements.length >
          0 && (
          <section className="achievements-grid">
            {filteredAchievements.map(
              (
                achievement,
              ) => (
                <AchievementCard
                  key={
                    achievement.id
                  }
                  achievement={
                    achievement
                  }
                />
              ),
            )}
          </section>
        )}
    </main>
  );
};

export default AchievementsPage;