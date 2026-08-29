import { useEffect, useMemo, useState } from "react";

import { useNavigate, useSearchParams } from "react-router-dom";

import "./UserPage.css";

import { useAuth } from "../../context/AuthContext.jsx";

const API_URL = "https://library-backend-production-5d60.up.railway.app";

/* =========================
   ICONS
========================= */

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

const ReadingIcon = () => (
  <svg viewBox="0 0 24 24" aria-hidden="true">
    <path d="M3.5 5.5A2.5 2.5 0 0 1 6 3h4a2 2 0 0 1 2 2v15a2 2 0 0 0-2-2H6a2.5 2.5 0 0 0-2.5 2.5v-15Z" />

    <path d="M20.5 5.5A2.5 2.5 0 0 0 18 3h-4a2 2 0 0 0-2 2v15a2 2 0 0 1 2-2h4a2.5 2.5 0 0 1 2.5 2.5v-15Z" />

    <path d="M7 7h2" />
    <path d="M15 7h2" />
  </svg>
);

const StarIcon = () => (
  <svg viewBox="0 0 24 24" aria-hidden="true">
    <path d="m12 3 2.8 5.7 6.2.9-4.5 4.4 1.1 6.2-5.6-2.9-5.6 2.9 1.1-6.2L3 9.6l6.2-.9L12 3Z" />
  </svg>
);

const EditIcon = () => (
  <svg viewBox="0 0 24 24" aria-hidden="true">
    <path d="m4 20 4.4-1 9.8-9.8-3.4-3.4L5 15.6 4 20Z" />
    <path d="m13.8 6.8 3.4 3.4" />
  </svg>
);

const ArrowIcon = () => (
  <svg viewBox="0 0 24 24" aria-hidden="true">
    <path d="m9 6 6 6-6 6" />
  </svg>
);

const ChevronIcon = ({ isOpen = false }) => (
  <svg
    className={
      isOpen
        ? "current-books-toggle__icon current-books-toggle__icon--open"
        : "current-books-toggle__icon"
    }
    viewBox="0 0 24 24"
    aria-hidden="true"
  >
    <path d="m7 9 5 5 5-5" />
  </svg>
);

/* =========================
   ACTIVITY HELPERS
========================= */

const createEmptyWeeks = (count, current) =>
  Array.from({ length: count }, (_, index) => ({
    label: `Тиждень ${index + 1}`,
    value: 0,
    current,
  }));

const buildPreviousMonthWeeks = (days) => {
  const weeks = createEmptyWeeks(4, false);

  days.forEach((day) => {
    const dayNumber = Number(day.day) || 0;
    const seconds = Number(day.seconds) || 0;

    let weekIndex = 0;

    if (dayNumber <= 7) {
      weekIndex = 0;
    } else if (dayNumber <= 14) {
      weekIndex = 1;
    } else if (dayNumber <= 21) {
      weekIndex = 2;
    } else {
      weekIndex = 3;
    }

    weeks[weekIndex].value += seconds / 60;
  });

  return weeks.map((week) => ({
    ...week,
    value: Math.round(week.value),
  }));
};

const buildCurrentMonthWeeks = (days) => {
  const weeks = createEmptyWeeks(5, true);

  days.forEach((day) => {
    const dayNumber = Number(day.day) || 0;
    const seconds = Number(day.seconds) || 0;

    let weekIndex = Math.floor((dayNumber - 1) / 7);

    weekIndex = Math.min(Math.max(weekIndex, 0), 4);

    weeks[weekIndex].value += seconds / 60;
  });

  return weeks.map((week) => ({
    ...week,
    value: Math.round(week.value),
  }));
};

const getCurrentMonthSeconds = (days) =>
  days.reduce((total, day) => total + (Number(day.seconds) || 0), 0);

const formatReadingTime = (totalSeconds) => {
  const totalMinutes = Math.floor(totalSeconds / 60);

  const hours = Math.floor(totalMinutes / 60);

  const minutes = totalMinutes % 60;

  if (hours === 0) {
    return `${minutes} хв`;
  }

  if (minutes === 0) {
    return `${hours} год`;
  }

  return `${hours} год ${minutes} хв`;
};

const getChartScale = (chartData) => {
  const highestValue = Math.max(...chartData.map((item) => item.value), 0);

  let step = 10;

  if (highestValue <= 30) {
    step = 10;
  } else if (highestValue <= 60) {
    step = 20;
  } else if (highestValue <= 120) {
    step = 40;
  } else if (highestValue <= 180) {
    step = 60;
  } else if (highestValue <= 360) {
    step = 120;
  } else {
    step = Math.ceil(highestValue / 3 / 60) * 60;
  }

  const maxValue = step * 3;

  return {
    maxValue,
    yTicks: [0, step, step * 2, step * 3],
  };
};

/* =========================
   READING ACTIVITY CHART
========================= */

const ReadingActivityChart = ({
  data,
  currentMonthSeconds,
  isLoading,
  error,
  onDetails,
}) => {
  const chartData =
    data.length > 0
      ? data
      : [...createEmptyWeeks(4, false), ...createEmptyWeeks(5, true)];

  const today = new Date();

  const monthNames = [
    "Січень",
    "Лютий",
    "Березень",
    "Квітень",
    "Травень",
    "Червень",
    "Липень",
    "Серпень",
    "Вересень",
    "Жовтень",
    "Листопад",
    "Грудень",
  ];

  const currentMonthName = monthNames[today.getMonth()];

  const previousMonthName = monthNames[(today.getMonth() + 11) % 12];

  const width = 760;
  const height = 240;

  const paddingTop = 28;
  const paddingBottom = 8;

  const chartHeight = height - paddingTop - paddingBottom;

  const { maxValue, yTicks } = getChartScale(chartData);

  const getX = (index) => {
    if (chartData.length <= 1) {
      return width / 2;
    }

    return (width / (chartData.length - 1)) * index;
  };

  const getY = (value) =>
    paddingTop + chartHeight - (value / maxValue) * chartHeight;

  const linePoints = chartData
    .map((item, index) => `${getX(index)},${getY(item.value)}`)
    .join(" ");

  const areaPath = [
    `M ${getX(0)} ${getY(chartData[0].value)}`,

    ...chartData
      .slice(1)
      .map((item, index) => `L ${getX(index + 1)} ${getY(item.value)}`),

    `L ${getX(chartData.length - 1)} ${height}`,

    `L ${getX(0)} ${height}`,

    "Z",
  ].join(" ");

  /*
   * Знаходимо реальний
   * максимум графіка.
   */
  const peakValue = Math.max(
    ...chartData.map((item) => Number(item.value) || 0),
    0,
  );

  const peakIndex = chartData.findIndex(
    (item) => Number(item.value) === peakValue,
  );

  const peakLeft =
    chartData.length > 1 && peakIndex >= 0
      ? (peakIndex / (chartData.length - 1)) * 100
      : 0;

  if (isLoading) {
    return (
      <div className="reading-chart-card">
        <div className="profile-empty">Завантаження активності...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="reading-chart-card">
        <div className="profile-empty">{error}</div>
      </div>
    );
  }

  return (
    <div className="reading-chart-card">
      <div className="reading-chart-card__header">
        <div>
          <h2>Активність читання</h2>

          <p>
            {currentMonthName}

            <span> · {formatReadingTime(currentMonthSeconds)}</span>
          </p>
        </div>

        <button
          type="button"
          className="reading-chart-card__details"
          onClick={onDetails}
        >
          Детальніше
          <ArrowIcon />
        </button>
      </div>

      <div className="reading-chart">
        <div className="reading-chart__body">
          {/* Y SCALE */}

          <div className="reading-chart__scale">
            {[...yTicks].reverse().map((tick) => (
              <span key={tick}>{tick} хв</span>
            ))}
          </div>

          {/* GRAPH */}

          <div className="reading-chart__plot">
            {peakValue > 0 && (
              <div
                className="reading-chart__peak-value"
                style={{
                  left: `${peakLeft}%`,
                  top: `${Math.max((getY(peakValue) / height) * 100 - 8, 0)}%`,
                }}
              >
                {peakValue} хв
              </div>
            )}

            <svg
              className="reading-chart__svg"
              viewBox={`0 0 ${width} ${height}`}
              preserveAspectRatio="none"
              role="img"
              aria-label="Графік активності читання у хвилинах"
            >
              <defs>
                <linearGradient
                  id="readingAreaGradient"
                  x1="0"
                  y1="0"
                  x2="0"
                  y2="1"
                >
                  <stop offset="0%" stopColor="#9b5cff" stopOpacity="0.38" />

                  <stop offset="100%" stopColor="#9b5cff" stopOpacity="0.04" />
                </linearGradient>

                <linearGradient
                  id="readingLineGradient"
                  x1="0"
                  y1="0"
                  x2="1"
                  y2="0"
                >
                  <stop offset="0%" stopColor="#a56cff" />

                  <stop offset="100%" stopColor="#9b5cff" />
                </linearGradient>
              </defs>

              {/* HORIZONTAL GRID */}

              {yTicks.map((tick) => (
                <line
                  key={`horizontal-${tick}`}
                  x1="0"
                  x2={width}
                  y1={getY(tick)}
                  y2={getY(tick)}
                  className="reading-chart__horizontal-line"
                />
              ))}

              {/* VERTICAL GRID */}

              {chartData.map((item, index) => (
                <line
                  key={`vertical-${item.label}-${index}`}
                  x1={getX(index)}
                  x2={getX(index)}
                  y1={paddingTop}
                  y2={height}
                  className="reading-chart__grid-line"
                />
              ))}

              {/* AREA */}

              <path d={areaPath} fill="url(#readingAreaGradient)" />

              {/* LINE */}

              <polyline
                points={linePoints}
                fill="none"
                stroke="url(#readingLineGradient)"
                className="reading-chart__line"
              />

              {/* DOTS */}

              {chartData.map((item, index) => {
                const isPeak = index === peakIndex && peakValue > 0;
              })}
            </svg>
            {chartData.map((item, index) => {
              const isPeak = index === peakIndex && peakValue > 0;

              const left =
                chartData.length > 1
                  ? (index / (chartData.length - 1)) * 100
                  : 50;

              const top = (getY(item.value) / height) * 100;

              return (
                <span
                  key={`dot-${index}`}
                  className={
                    isPeak
                      ? "reading-chart__html-dot reading-chart__html-dot--peak"
                      : "reading-chart__html-dot"
                  }
                  style={{
                    left: `${left}%`,
                    top: `${top}%`,
                  }}
                />
              );
            })}
          </div>
        </div>

        {/* MONTHS */}

        <div className="reading-chart__periods">
          <span>{previousMonthName}</span>

          <span>{currentMonthName}</span>
        </div>
      </div>
    </div>
  );
};
/* =========================
   PAGE
========================= */

const UserPage = () => {
  const navigate = useNavigate();

  const [searchParams, setSearchParams] = useSearchParams();

  const { user } = useAuth();

  const readingBookId = searchParams.get("reading");

  const [currentBooks, setCurrentBooks] = useState([]);

  const [wishlistBooks, setWishlistBooks] = useState([]);

  const [finishedBooks, setFinishedBooks] = useState([]);

  const [wishlistCount, setWishlistCount] = useState(0);

  const [finishedCount, setFinishedCount] = useState(0);

  const [isCurrentReadingLoading, setIsCurrentReadingLoading] = useState(true);

  const [isWishlistLoading, setIsWishlistLoading] = useState(true);

  const [isFinishedLoading, setIsFinishedLoading] = useState(true);

  const [currentReadingError, setCurrentReadingError] = useState("");

  const [wishlistError, setWishlistError] = useState("");

  const [finishedError, setFinishedError] = useState("");

  const [isCurrentBooksOpen, setIsCurrentBooksOpen] = useState(false);

  /* =========================
     ACTIVITY STATE
  ========================= */

  const [readingActivity, setReadingActivity] = useState({
    weeks: [],
    currentMonthSeconds: 0,
  });

  const [isActivityLoading, setIsActivityLoading] = useState(true);

  const [activityError, setActivityError] = useState("");

  /* =========================
     CURRENT
  ========================= */

  useEffect(() => {
    const loadCurrentBooks = async () => {
      const token = localStorage.getItem("token");

      if (!token) {
        setIsCurrentReadingLoading(false);

        return;
      }

      try {
        setCurrentReadingError("");

        const response = await fetch(`${API_URL}/api/user-books/current`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (!response.ok) {
          throw new Error();
        }

        const data = await response.json();

        setCurrentBooks(Array.isArray(data.books) ? data.books : []);
      } catch (error) {
        console.error("Load current reading error:", error);

        setCurrentReadingError("Не вдалося завантажити поточне читання");
      } finally {
        setIsCurrentReadingLoading(false);
      }
    };

    loadCurrentBooks();
  }, [readingBookId]);

  /* =========================
     WISHLIST
  ========================= */

  useEffect(() => {
    const loadWishlist = async () => {
      const token = localStorage.getItem("token");

      if (!token) {
        setIsWishlistLoading(false);

        return;
      }

      try {
        setWishlistError("");

        const response = await fetch(`${API_URL}/api/user-books/wishlist`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (!response.ok) {
          throw new Error();
        }

        const data = await response.json();

        setWishlistBooks(Array.isArray(data.books) ? data.books : []);

        setWishlistCount(Number(data.count) || 0);
      } catch (error) {
        console.error("Load wishlist error:", error);

        setWishlistError("Не вдалося завантажити список");
      } finally {
        setIsWishlistLoading(false);
      }
    };

    loadWishlist();
  }, []);

  /* =========================
     FINISHED
  ========================= */

  useEffect(() => {
    const loadFinishedBooks = async () => {
      const token = localStorage.getItem("token");

      if (!token) {
        setIsFinishedLoading(false);

        return;
      }

      try {
        setFinishedError("");

        const response = await fetch(`${API_URL}/api/user-books/finished`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (!response.ok) {
          throw new Error();
        }

        const data = await response.json();

        setFinishedBooks(Array.isArray(data.books) ? data.books : []);

        setFinishedCount(Number(data.count) || 0);
      } catch (error) {
        console.error("Load finished error:", error);

        setFinishedError("Не вдалося завантажити прочитані книги");
      } finally {
        setIsFinishedLoading(false);
      }
    };

    loadFinishedBooks();
  }, [readingBookId]);

  /* =========================
     REAL READING ACTIVITY
  ========================= */

  useEffect(() => {
    const loadReadingActivity = async () => {
      const token = localStorage.getItem("token");

      if (!token) {
        setIsActivityLoading(false);

        return;
      }

      try {
        setActivityError("");

        const now = new Date();

        const currentYear = now.getFullYear();

        const currentMonth = now.getMonth() + 1;

        const previousDate = new Date(currentYear, currentMonth - 2, 1);

        const previousYear = previousDate.getFullYear();

        const previousMonth = previousDate.getMonth() + 1;

        const [previousResponse, currentResponse] = await Promise.all([
          fetch(
            `${API_URL}/api/user-books/activity?year=${previousYear}&month=${previousMonth}`,
            {
              headers: {
                Authorization: `Bearer ${token}`,
              },
            },
          ),

          fetch(
            `${API_URL}/api/user-books/activity?year=${currentYear}&month=${currentMonth}`,
            {
              headers: {
                Authorization: `Bearer ${token}`,
              },
            },
          ),
        ]);

        if (!previousResponse.ok || !currentResponse.ok) {
          throw new Error("Failed to load reading activity");
        }

        const previousData = await previousResponse.json();

        const currentData = await currentResponse.json();

        const previousDays = Array.isArray(previousData?.activity?.days)
          ? previousData.activity.days
          : [];

        const currentDays = Array.isArray(currentData?.activity?.days)
          ? currentData.activity.days
          : [];

        const previousWeeks = buildPreviousMonthWeeks(previousDays);

        const currentWeeks = buildCurrentMonthWeeks(currentDays);

        const currentMonthSeconds = getCurrentMonthSeconds(currentDays);

        setReadingActivity({
          weeks: [...previousWeeks, ...currentWeeks],

          currentMonthSeconds,
        });
      } catch (error) {
        console.error("Load reading activity error:", error);

        setActivityError("Не вдалося завантажити активність читання");
      } finally {
        setIsActivityLoading(false);
      }
    };

    loadReadingActivity();
  }, [readingBookId]);

  /* =========================
     REMOVE WISHLIST
  ========================= */

  const handleRemoveFromWishlist = async (bookId) => {
    const token = localStorage.getItem("token");

    if (!token || !bookId) {
      return;
    }

    try {
      const response = await fetch(
        `${API_URL}/api/user-books/${bookId}/wishlist`,
        {
          method: "DELETE",

          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      if (!response.ok) {
        throw new Error("Не вдалося прибрати книгу зі списку бажань");
      }

      setWishlistBooks((books) =>
        books.filter(({ book }) => book.id !== bookId),
      );

      setWishlistCount((count) => Math.max(count - 1, 0));
    } catch (error) {
      console.error("Remove wishlist error:", error);
    }
  };

  /* =========================
     OPEN READING
  ========================= */

  const handleOpenReading = (bookId) => {
    if (!bookId) {
      return;
    }

    const params = new URLSearchParams(searchParams);

    params.set("reading", bookId);

    setSearchParams(params);
  };

  /* =========================
     HELPERS
  ========================= */

  const getProgress = (currentPage, totalPages) => {
    if (!totalPages || totalPages <= 0) {
      return 0;
    }

    return Math.min(Math.round((currentPage / totalPages) * 100), 100);
  };

  const averageRating = useMemo(() => {
    const values = finishedBooks
      .map(({ userBook }) => Number(userBook?.rating))
      .filter((rating) => Number.isFinite(rating) && rating > 0);

    if (!values.length) {
      return 0;
    }

    const sum = values.reduce((total, rating) => total + rating, 0);

    return (sum / values.length).toFixed(1);
  }, [finishedBooks]);

  const mainCurrentBook = currentBooks[0] ?? null;

  const otherCurrentBooks = currentBooks.slice(1);

  const profileName = user?.name || "Користувач";

  return (
    <main className="user-page">
      <div className="user-profile">
        {/* =========================
            PROFILE HERO
        ========================= */}

        <section className="profile-hero">
          <div className="profile-hero__avatar-wrap">
            <div className="profile-hero__avatar">
              {user?.avatarUrl ? (
                <img src={user.avatarUrl} alt={profileName} />
              ) : (
                <span>{profileName.charAt(0).toUpperCase()}</span>
              )}
            </div>

            <button
              type="button"
              className="profile-hero__edit"
              onClick={() => navigate("/settings")}
              aria-label="Редагувати профіль"
            >
              <EditIcon />
            </button>
          </div>

          <div className="profile-hero__content">
            <h1>{profileName}</h1>

            {user?.email && <p className="profile-hero__email">{user.email}</p>}

            <p className="profile-hero__quote">
              «Читання — це подорож,
              <br />
              яка ніколи не закінчується.»
            </p>
          </div>
        </section>

        {/* =========================
            STATS
        ========================= */}

        <section className="profile-stats">
          <article className="profile-stat">
            <BookIcon />

            <strong>{isFinishedLoading ? "..." : finishedCount}</strong>

            <span>Прочитано</span>
          </article>

          <article className="profile-stat">
            <BookmarkIcon />

            <strong>{isWishlistLoading ? "..." : wishlistCount}</strong>

            <span>Хочу прочитати</span>
          </article>

          <article className="profile-stat">
            <ReadingIcon />

            <strong>
              {isCurrentReadingLoading ? "..." : currentBooks.length}
            </strong>

            <span>Читаю зараз</span>
          </article>

          <article className="profile-stat">
            <StarIcon />

            <strong>{isFinishedLoading ? "..." : averageRating}</strong>

            <span>Середній рейтинг</span>
          </article>
        </section>

        {/* =========================
            CURRENT
        ========================= */}

        <section className="profile-section">
          <div className="profile-section__header">
            <h2>Зараз читаю</h2>

            {otherCurrentBooks.length > 0 && (
              <button
                type="button"
                className="current-books-toggle"
                onClick={() => setIsCurrentBooksOpen((isOpen) => !isOpen)}
              >
                {isCurrentBooksOpen
                  ? "Згорнути"
                  : `Ще ${otherCurrentBooks.length}`}

                <ChevronIcon isOpen={isCurrentBooksOpen} />
              </button>
            )}
          </div>

          {isCurrentReadingLoading ? (
            <div className="profile-empty">Завантаження...</div>
          ) : currentReadingError ? (
            <div className="profile-empty">{currentReadingError}</div>
          ) : !mainCurrentBook ? (
            <div className="profile-empty">Немає активних книг</div>
          ) : (
            <>
              <article className="current-book">
                <div className="current-book__cover">
                  {mainCurrentBook.book?.coverUrl ? (
                    <img
                      src={mainCurrentBook.book.coverUrl}
                      alt={mainCurrentBook.book.title}
                    />
                  ) : (
                    <div className="book-no-cover">
                      Немає
                      <br />
                      обкладинки
                    </div>
                  )}
                </div>

                <div className="current-book__content">
                  <h3>{mainCurrentBook.book?.title}</h3>

                  <p className="current-book__author">
                    {mainCurrentBook.book?.author}
                  </p>

                  {(() => {
                    const currentPage =
                      mainCurrentBook.userBook?.currentPage ?? 0;

                    const totalPages = mainCurrentBook.book?.pages ?? 0;

                    const progress = getProgress(currentPage, totalPages);

                    return (
                      <>
                        <div className="current-book__progress">
                          <span
                            style={{
                              width: `${progress}%`,
                            }}
                          />
                        </div>

                        <div className="current-book__progress-info">
                          <span>
                            Сторінка {currentPage}
                            {totalPages ? ` з ${totalPages}` : ""}
                          </span>

                          <strong>{progress}%</strong>
                        </div>
                      </>
                    );
                  })()}

                  <button
                    type="button"
                    className="current-book__button"
                    onClick={() => handleOpenReading(mainCurrentBook.book.id)}
                  >
                    Продовжити читання
                  </button>
                </div>
              </article>

              {otherCurrentBooks.length > 0 && (
                <div
                  className={`current-books-dropdown ${
                    isCurrentBooksOpen ? "current-books-dropdown--open" : ""
                  }`}
                >
                  <div className="current-books-dropdown__inner">
                    {otherCurrentBooks.map(({ book, userBook }) => {
                      const currentPage = userBook?.currentPage ?? 0;

                      const totalPages = book?.pages ?? 0;

                      const progress = getProgress(currentPage, totalPages);

                      return (
                        <article
                          className="current-books-dropdown__book"
                          key={userBook.id}
                        >
                          <div className="current-books-dropdown__cover">
                            {book.coverUrl ? (
                              <img src={book.coverUrl} alt={book.title} />
                            ) : (
                              <div className="book-no-cover">
                                Немає
                                <br />
                                обкладинки
                              </div>
                            )}
                          </div>

                          <div className="current-books-dropdown__content">
                            <h3>{book.title}</h3>

                            <p>{book.author}</p>

                            <div className="current-books-dropdown__progress-row">
                              <div className="current-books-dropdown__progress">
                                <span
                                  style={{
                                    width: `${progress}%`,
                                  }}
                                />
                              </div>

                              <strong>{progress}%</strong>
                            </div>

                            <span className="current-books-dropdown__page">
                              Сторінка {currentPage}
                              {totalPages ? ` з ${totalPages}` : ""}
                            </span>

                            <button
                              type="button"
                              className="current-books-dropdown__button"
                              onClick={() => handleOpenReading(book.id)}
                            >
                              Продовжити
                            </button>
                          </div>
                        </article>
                      );
                    })}
                  </div>
                </div>
              )}
            </>
          )}
        </section>

        {/* =========================
            WISHLIST
        ========================= */}

        <section className="profile-section">
          <div className="profile-section__header">
            <h2>Хочу прочитати</h2>

            {wishlistBooks.length > 0 && (
              <button type="button">
                Переглянути всі
                <ArrowIcon />
              </button>
            )}
          </div>

          {isWishlistLoading ? (
            <div className="profile-empty">Завантаження...</div>
          ) : wishlistError ? (
            <div className="profile-empty">{wishlistError}</div>
          ) : wishlistBooks.length === 0 ? (
            <div className="profile-empty">Список поки порожній</div>
          ) : (
            <div className="profile-books">
              {wishlistBooks.map(({ book, userBook }) => (
                <article className="profile-book" key={userBook.id}>
                  <div className="profile-book__cover">
                    {book.coverUrl ? (
                      <img src={book.coverUrl} alt={book.title} />
                    ) : (
                      <div className="book-no-cover">
                        Немає
                        <br />
                        обкладинки
                      </div>
                    )}

                    <button
                      type="button"
                      className="profile-book__bookmark"
                      onClick={() => handleRemoveFromWishlist(book.id)}
                      aria-label="Прибрати зі списку бажань"
                      title="Прибрати зі списку бажань"
                    >
                      <BookmarkIcon />
                    </button>
                  </div>

                  <h3>{book.title}</h3>

                  <p>{book.author}</p>
                </article>
              ))}
            </div>
          )}
        </section>

        {/* =========================
            FINISHED
        ========================= */}

        <section className="profile-section">
          <div className="profile-section__header">
            <h2>Прочитано</h2>

            {finishedBooks.length > 0 && (
              <button type="button">
                Переглянути всі
                <ArrowIcon />
              </button>
            )}
          </div>

          {isFinishedLoading ? (
            <div className="profile-empty">Завантаження...</div>
          ) : finishedError ? (
            <div className="profile-empty">{finishedError}</div>
          ) : finishedBooks.length === 0 ? (
            <div className="profile-empty">Тут з’являться прочитані книги</div>
          ) : (
            <div className="profile-books">
              {finishedBooks.map(({ book, userBook }) => (
                <article className="profile-book" key={userBook.id}>
                  <div className="profile-book__cover">
                    {book.coverUrl ? (
                      <img src={book.coverUrl} alt={book.title} />
                    ) : (
                      <div className="book-no-cover">
                        Немає
                        <br />
                        обкладинки
                      </div>
                    )}
                  </div>

                  <h3>{book.title}</h3>

                  <p>{book.author}</p>

                  {userBook.rating && (
                    <div className="profile-book__rating">
                      {"★".repeat(userBook.rating)}
                    </div>
                  )}
                </article>
              ))}
            </div>
          )}
        </section>

        {/* =========================
            ACTIVITY
        ========================= */}

        <section className="profile-section profile-section--activity">
          <ReadingActivityChart
            data={readingActivity.weeks}
            currentMonthSeconds={readingActivity.currentMonthSeconds}
            isLoading={isActivityLoading}
            error={activityError}
            onDetails={() => navigate("/stats")}
          />
        </section>
      </div>
    </main>
  );
};

export default UserPage;
