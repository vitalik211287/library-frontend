import { useEffect, useMemo, useState } from "react";

import { useNavigate, useSearchParams } from "react-router-dom";

import toast from "react-hot-toast";

import "./HomePage.css";
import { useReadingStatsContext } from "../../modules/stats/context/ReadingStatsContext.jsx";
import { useReadingActivityContext } from "../../modules/reading/context/ReadingActivityContext.jsx";
import { useAuth } from "../../modules/auth/context/AuthContext.jsx";
import { useLibrary } from "../../modules/libraries/context/LibraryContext.jsx";
import { useUserBooks } from "../../modules/user-books/context/UserBooksContext.jsx";
import { useAchievementsContext } from "../../modules/stats/context/AchievementsContext.jsx";
import Modal from "../../shared/components/Modal/Modal.jsx";
import { useReadingGoalContext } from "../../modules/stats/context/ReadingGoalContext.jsx";
import ReadingGoalModal from "../../modules/users/pages/UserPage/components/ReadingGoal/ReadingGoalModal.jsx";
/* =========================
   ICONS
========================= */

const BookIcon = () => (
  <svg viewBox="0 0 24 24" aria-hidden="true">
    <path d="M4 5.5A2.5 2.5 0 0 1 6.5 3H11a2 2 0 0 1 2 2v16a2 2 0 0 0-2-2H6.5A2.5 2.5 0 0 0 4 21.5v-16Z" />
    <path d="M20 5.5A2.5 2.5 0 0 0 17.5 3H13v18a2 2 0 0 1 2-2h2.5a2.5 2.5 0 0 1 2.5 2.5v-16Z" />
  </svg>
);

const FlameIcon = () => (
  <svg viewBox="0 0 24 24" aria-hidden="true">
    <path
      fill="currentColor"
      d="M13.5 2.2c.4 2.7-.8 4.1-2 5.4-1.2 1.3-2.4 2.6-2.4 4.8 0 1.7 1.3 3.1 2.9 3.1s2.9-1.4 2.9-3.1c0-.8-.2-1.6-.7-2.4-.3 1-.8 1.7-1.6 2.2.2-2.2-.7-4.1.9-10Zm-5 5.3C5.8 9.6 4 12.5 4 15.4A8 8 0 0 0 20 15.4c0-3.8-2.2-7.1-5.4-9.2.3 1.4.1 2.5-.3 3.4 1.3 1.5 2 3.4 2 5.4a4.3 4.3 0 0 1-8.6 0c0-1.9.8-3.3 1.8-4.6.7-.9 1.4-1.8 1.7-3.1-1 .7-1.9 1.4-2.7 2.2Z"
    />
  </svg>
);

const ChevronIcon = () => (
  <svg viewBox="0 0 24 24" aria-hidden="true">
    <path d="m7 9 5 5 5-5" />
  </svg>
);

const ShareIcon = () => (
  <svg viewBox="0 0 24 24" aria-hidden="true">
    <circle cx="18" cy="5" r="2.5" />
    <circle cx="6" cy="12" r="2.5" />
    <circle cx="18" cy="19" r="2.5" />
    <path d="m8.2 10.8 7.6-4.5" />
    <path d="m8.2 13.2 7.6 4.5" />
  </svg>
);

const ClockIcon = () => (
  <svg viewBox="0 0 24 24" aria-hidden="true">
    <circle cx="12" cy="12" r="8" />
    <path d="M12 7v5l3 2" />
  </svg>
);

const PagesIcon = () => (
  <svg viewBox="0 0 24 24" aria-hidden="true">
    <path d="M4 5.5A2.5 2.5 0 0 1 6.5 3H11a2 2 0 0 1 2 2v16a2 2 0 0 0-2-2H6.5A2.5 2.5 0 0 0 4 21.5v-16Z" />
    <path d="M20 5.5A2.5 2.5 0 0 0 17.5 3H13v18a2 2 0 0 1 2-2h2.5a2.5 2.5 0 0 1 2.5 2.5v-16Z" />
  </svg>
);

const SessionsIcon = () => (
  <svg viewBox="0 0 24 24" aria-hidden="true">
    <rect x="4" y="6" width="16" height="14" rx="2" />
    <path d="M8 3v6M16 3v6M4 10h16" />
  </svg>
);

const TargetIcon = () => (
  <svg viewBox="0 0 24 24" aria-hidden="true">
    <circle cx="12" cy="12" r="8" />
    <circle cx="12" cy="12" r="4" />
    <circle cx="12" cy="12" r="1" />
  </svg>
);

const TrophyIcon = () => (
  <svg viewBox="0 0 24 24" aria-hidden="true">
    <path d="M8 4h8v4a4 4 0 0 1-8 0V4Z" />
    <path d="M8 6H5v2a3 3 0 0 0 3 3M16 6h3v2a3 3 0 0 1-3 3" />
    <path d="M12 12v4M9 20h6M10 16h4v4h-4z" />
  </svg>
);

const CalendarIcon = () => (
  <svg viewBox="0 0 24 24" aria-hidden="true">
    <rect x="4" y="5" width="16" height="15" rx="2" />
    <path d="M8 3v4M16 3v4M4 9h16" />
  </svg>
);

/* =========================
   DATE HELPERS
========================= */

const WEEK_DAYS = ["Пн", "Вт", "Ср", "Чт", "Пт", "Сб", "Нд"];

const MONTHS = [
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

const getMonday = (date) => {
  const result = new Date(date);

  result.setHours(0, 0, 0, 0);

  const day = result.getDay();

  const difference = day === 0 ? -6 : 1 - day;

  result.setDate(result.getDate() + difference);

  return result;
};

const getDateKey = (date) => {
  const year = date.getFullYear();

  const month = String(date.getMonth() + 1).padStart(2, "0");

  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
};

const getGreeting = () => {
  const hour = new Date().getHours();

  if (hour < 12) {
    return "Доброго ранку";
  }

  if (hour < 18) {
    return "Добрий день";
  }

  return "Добрий вечір";
};

const getFirstName = (name) => {
  if (!name) {
    return "";
  }

  return name.trim().split(/\s+/)[0];
};

const getProgress = (currentPage, pages) => {
  if (!pages || pages <= 0) {
    return 0;
  }

  return Math.min(100, Math.max(0, Math.round((currentPage / pages) * 100)));
};

const formatReadingTime = (seconds) => {
  const totalMinutes = Math.round((seconds ?? 0) / 60);

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

/* =========================
   HOME
========================= */

const HomePage = () => {
  const { user } = useAuth();

  const navigate = useNavigate();

  const [searchParams, setSearchParams] = useSearchParams();

  const { latestAchievement, featuredAchievement, isAchievementsLoading } =
    useAchievementsContext();

  const { stats, isStatsLoading } = useReadingStatsContext();

  const { activityByMonth, ensureActivity } = useReadingActivityContext();

  const {
    libraries,
    activeLibrary,
    activeLibraryId,
    setActiveLibraryId,
    createLibrary,
    addLibraryMember,
  } = useLibrary();

  const { readingGoal, isGoalLoading } = useReadingGoalContext();

  const { currentBooks, isCurrentBooksLoading, currentBooksError } =
    useUserBooks();

  const [isLibraryMenuOpen, setIsLibraryMenuOpen] = useState(false);

  const [modalType, setModalType] = useState(null);

  const [libraryName, setLibraryName] = useState("");

  const [memberEmail, setMemberEmail] = useState("");

  const [isSubmitting, setIsSubmitting] = useState(false);

  const [isReadingGoalModalOpen, setIsReadingGoalModalOpen] = useState(false);

  const now = useMemo(() => new Date(), []);

  const currentMonth = now.getMonth() + 1;

  /* =========================
     ACTIVITY
  ========================= */

  const activityMonths = useMemo(() => {
    const monday = getMonday(now);

    const sunday = new Date(monday);

    sunday.setDate(monday.getDate() + 6);

    const monthRequests = new Map();

    const addMonth = (date) => {
      const year = date.getFullYear();

      const month = date.getMonth() + 1;

      const key = `${year}-${month}`;

      monthRequests.set(key, {
        year,
        month,
      });
    };

    addMonth(monday);
    addMonth(sunday);
    addMonth(now);

    return [...monthRequests.values()];
  }, [now]);

  useEffect(() => {
    activityMonths.forEach(({ year, month }) => {
      ensureActivity(year, month);
    });
  }, [activityMonths, ensureActivity]);

  const activityData = useMemo(() => {
    const activityMap = new Map();

    activityMonths.forEach(({ year, month }) => {
      const key = `${year}-${month}`;

      const activity = activityByMonth[key];

      const days = Array.isArray(activity?.days) ? activity.days : [];

      days.forEach((day) => {
        const date = new Date(year, month - 1, day.day);

        activityMap.set(getDateKey(date), day);
      });
    });

    return activityMap;
  }, [activityByMonth, activityMonths]);

  /* =========================
     LIBRARY
  ========================= */

  const handleSelectLibrary = (libraryId) => {
    setActiveLibraryId(libraryId);

    setIsLibraryMenuOpen(false);
  };

  const handleCreateLibrary = async (event) => {
    event.preventDefault();

    try {
      setIsSubmitting(true);

      await createLibrary(libraryName);

      toast.success("Бібліотеку створено");

      setLibraryName("");
      setModalType(null);
    } catch (createError) {
      toast.error(
        createError instanceof Error
          ? createError.message
          : "Не вдалося створити бібліотеку",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleAddMember = async (event) => {
    event.preventDefault();

    if (!activeLibraryId) {
      toast.error("Спочатку виберіть бібліотеку");

      return;
    }

    try {
      setIsSubmitting(true);

      await addLibraryMember(activeLibraryId, memberEmail);

      toast.success("Учасника додано");

      setMemberEmail("");
      setModalType(null);
    } catch (memberError) {
      toast.error(
        memberError instanceof Error
          ? memberError.message
          : "Не вдалося додати учасника",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  /* =========================
     CURRENT BOOK
  ========================= */

  const book = currentBooks[0] ?? null;

  const currentPage = book?.currentPage ?? 0;

  const totalPages = book?.pages ?? 0;

  const progress =
    book?.progressMode === "PERCENT"
      ? (book?.currentPercent ?? 0)
      : getProgress(currentPage, totalPages);

  const handleContinueReading = () => {
    if (!book?.id) {
      return;
    }

    const params = new URLSearchParams(searchParams);

    params.set("reading", book.id);

    setSearchParams(params, {
      replace: true,
    });
  };

  /* =========================
     WEEK
  ========================= */

  const weeklyActivity = useMemo(() => {
    const monday = getMonday(now);

    return WEEK_DAYS.map((day, index) => {
      const date = new Date(monday);

      date.setDate(monday.getDate() + index);

      const activity =
        activityData instanceof Map ? activityData.get(getDateKey(date)) : null;

      return {
        day,
        date: date.getDate(),

        active: (activity?.sessions ?? 0) > 0,

        today: getDateKey(date) === getDateKey(now),

        activity: activity ?? {
          seconds: 0,
          pages: 0,
          sessions: 0,
        },
      };
    });
  }, [activityData, now]);

  const todayActivity = useMemo(() => {
    if (!(activityData instanceof Map)) {
      return null;
    }

    return activityData.get(getDateKey(now)) ?? null;
  }, [activityData, now]);

  const todayMinutes = Math.round((todayActivity?.seconds ?? 0) / 60);

  const todayPages = todayActivity?.pages ?? 0;

  const todaySessions = todayActivity?.sessions ?? 0;

  /* =========================
     STATS
  ========================= */

  const streak = stats?.streak?.current ?? 0;

  const goalBooks = readingGoal?.books ?? 0;
  const goalPages = readingGoal?.pages ?? 0;
  const goalMinutes = readingGoal?.minutes ?? 0;

  const hasReadingGoal = goalBooks > 0 || goalPages > 0 || goalMinutes > 0;

  const finishedBooks = stats?.summary?.finishedBooks ?? 0;
  const pagesRead = stats?.summary?.pagesRead ?? 0;
  const totalReadingMinutes = Math.round(
    (stats?.summary?.readingSeconds ?? 0) / 60,
  );

  const goalProgress = useMemo(() => {
    if (goalBooks > 0) {
      return {
        current: finishedBooks,
        goal: goalBooks,
        unit: "книг",
        label: "Прочитано цього року",
      };
    }

    if (goalPages > 0) {
      return {
        current: pagesRead,
        goal: goalPages,
        unit: "стор.",
        label: "Прочитано цього року",
      };
    }

    if (goalMinutes > 0) {
      return {
        current: totalReadingMinutes,
        goal: goalMinutes,
        unit: "хв",
        label: "Час читання цього року",
      };
    }

    return null;
  }, [
    finishedBooks,
    goalBooks,
    goalMinutes,
    goalPages,
    pagesRead,
    totalReadingMinutes,
  ]);

  const goalPercent = goalProgress
    ? Math.min(
        100,
        Math.round((goalProgress.current / goalProgress.goal) * 100),
      )
    : 0;

  const monthStats = stats?.months?.[currentMonth - 1] ?? null;

  const monthSeconds = monthStats?.seconds ?? 0;

  const monthPages = monthStats?.pages ?? 0;

  const monthBooks = monthStats?.books ?? 0;

  const firstName = getFirstName(user?.name);

  const handleOpenStats = () => {
    navigate("/stats");

    requestAnimationFrame(() => {
      window.scrollTo({
        top: 0,
        left: 0,
        behavior: "instant",
      });
    });
  };

  /* =========================
     SHARE
  ========================= */

  const handleShare = async () => {
    const text =
      streak > 0
        ? `Моя серія читання — ${streak} дн. поспіль 📚`
        : "Я читаю у своїй бібліотеці 📚";

    try {
      if (navigator.share) {
        await navigator.share({
          title: "Моя серія читання",
          text,
        });

        return;
      }

      await navigator.clipboard.writeText(text);
    } catch (shareError) {
      console.error("Share error:", shareError);
    }
  };

  /* =========================
     STATES
  ========================= */

  if (
    isCurrentBooksLoading ||
    isGoalLoading ||
    isStatsLoading ||
    isAchievementsLoading
  ) {
    return (
      <main className="home-page">
        <div className="home-section">Завантаження...</div>
      </main>
    );
  }

  if (currentBooksError) {
    return (
      <main className="home-page">
        <div className="home-section">{currentBooksError}</div>
      </main>
    );
  }

  return (
    <main className="home-page">
      {/* =========================
          LIBRARY SWITCHER
      ========================= */}

      <div className="library-switcher">
        <button
          type="button"
          className="library-switcher__button"
          onClick={() => setIsLibraryMenuOpen((current) => !current)}
          aria-expanded={isLibraryMenuOpen}
        >
          <BookIcon />

          <span>{activeLibrary?.name ?? "Бібліотека"}</span>

          <ChevronIcon />
        </button>

        {isLibraryMenuOpen && (
          <div className="library-switcher__menu">
            {libraries.map((library) => (
              <button
                type="button"
                className={`library-switcher__item ${
                  library.id === activeLibrary?.id
                    ? "library-switcher__item--active"
                    : ""
                }`}
                key={library.id}
                onClick={() => handleSelectLibrary(library.id)}
              >
                {library.name}
              </button>
            ))}

            <div className="library-switcher__separator" />

            <button
              type="button"
              className="library-switcher__item"
              onClick={() => {
                setIsLibraryMenuOpen(false);

                setModalType("create");
              }}
            >
              + Створити бібліотеку
            </button>

            <button
              type="button"
              className="library-switcher__item"
              disabled={!activeLibrary}
              onClick={() => {
                setIsLibraryMenuOpen(false);

                setModalType("member");
              }}
            >
              👥 Додати учасника
            </button>

            <button
              type="button"
              className="library-switcher__item"
              disabled={!activeLibrary}
              onClick={() => {
                setIsLibraryMenuOpen(false);

                navigate("/library/manage");
              }}
            >
              ⚙ Керування бібліотекою
            </button>
          </div>
        )}
      </div>

      {/* =========================
          WELCOME
      ========================= */}

      <section className="home-welcome">
        <span className="home-welcome__eyebrow">Твій читацький простір</span>

        <h1>
          {getGreeting()}
          {firstName ? `, ${firstName}` : ""}

          <span aria-hidden="true"> 👋</span>
        </h1>

        <p>Продовжуємо читати?</p>
      </section>

      {/* =========================
          STREAK
      ========================= */}

      <section className="streak-card">
        <div className="streak-card__top">
          <div>
            <span className="home-section__kicker">Активність</span>

            <h2>Твоя серія читання</h2>
          </div>

          <button
            type="button"
            className="streak-card__share"
            onClick={handleShare}
          >
            <ShareIcon />

            <span>Поділитися</span>
          </button>
        </div>

        <div className="streak-card__content">
          <div className="streak-card__counter">
            <div className="streak-card__flame">
              <FlameIcon />
            </div>

            <strong>{streak}</strong>

            <span>{streak === 1 ? "день" : "днів"}</span>
          </div>

          <div className="streak-week">
            {weeklyActivity.map((item) => (
              <div
                className="streak-day"
                key={`${item.day}-${item.date}`}
                title={
                  item.active
                    ? `${Math.round(item.activity.seconds / 60)} хв читання`
                    : "Без читання"
                }
              >
                <span className="streak-day__label">{item.day}</span>

                <div className="streak-day__marker-wrap">
                  {item.today && <span className="streak-day__today-dot" />}

                  <div
                    className={`streak-day__marker ${
                      item.active ? "streak-day__marker--active" : ""
                    }`}
                  >
                    {item.active ? <BookIcon /> : <span>{item.date}</span>}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="streak-card__pagination">
          <span className="streak-card__page-dot streak-card__page-dot--active" />
          <span className="streak-card__page-dot" />
          <span className="streak-card__page-dot" />
        </div>
      </section>

      {/* =========================
          CURRENT READING
      ========================= */}

      <section className="home-panel current-reading-section">
        <div className="home-panel__header">
          <div>
            <span className="home-section__kicker">У процесі</span>

            <h2>Зараз читаю</h2>
          </div>

          {book && <span className="home-panel__badge">{progress}%</span>}
        </div>

        {!book ? (
          <div className="home-empty-state">
            <div className="home-empty-state__icon">
              <BookIcon />
            </div>

            <div>
              <strong>Немає активної книги</strong>

              <span>Обери книгу в каталозі, щоб почати читання.</span>
            </div>
          </div>
        ) : (
          <article className="current-reading-card">
            <div className="current-reading-card__main">
              <div className="current-reading-card__cover">
                {book.coverUrl ? (
                  <img
                    src={book.coverUrl}
                    alt={book.title}
                    className="current-reading-card__cover-image"
                  />
                ) : (
                  <div className="current-reading-card__cover-placeholder">
                    <BookIcon />
                  </div>
                )}
              </div>

              <div className="current-reading-card__content">
                <div>
                  <h3>{book.title}</h3>

                  <p className="current-reading-card__author">{book.author}</p>
                </div>

                <div className="current-reading-card__progress-info">
                  <span>
                    {currentPage}

                    {totalPages ? ` / ${totalPages} стор.` : " стор."}
                  </span>

                  <strong>{progress}%</strong>
                </div>

                <div className="home-progress">
                  <div
                    className="home-progress__bar"
                    style={{
                      width: `${progress}%`,
                    }}
                  />
                </div>
              </div>
            </div>

            <button
              type="button"
              className="home-primary-button"
              onClick={handleContinueReading}
            >
              <span aria-hidden="true">▶</span>
              Продовжити читання
            </button>
          </article>
        )}
      </section>
      {/* =========================
    ACHIEVEMENT
========================= */}

      <section
        className="home-panel achievement-card home-panel--clickable"
        role="button"
        tabIndex={0}
        onClick={() => {
          navigate("/achievements");

          window.scrollTo({
            top: 0,
            left: 0,
            behavior: "instant",
          });
        }}
        onKeyDown={(event) => {
          if (event.key === "Enter" || event.key === " ") {
            event.preventDefault();

            navigate("/achievements");

            window.scrollTo({
              top: 0,
              left: 0,
              behavior: "instant",
            });
          }
        }}
      >
        <div className="achievement-card__inner">
          <div className="achievement-card__icon">
            <TrophyIcon />
          </div>

          <div className="achievement-card__content">
            <span className="home-section__kicker">
              {latestAchievement ? "Досягнення" : "Найближче досягнення"}
            </span>

            <h2>
              {featuredAchievement
                ? featuredAchievement.title
                : "Поки немає досягнень"}
            </h2>

            <p>
              {featuredAchievement
                ? featuredAchievement.description
                : "Продовжуй читати — перше досягнення вже близько."}
            </p>

            {featuredAchievement && !featuredAchievement.unlocked && (
              <div className="achievement-card__progress">
                <div className="achievement-card__progress-info">
                  <span>
                    {featuredAchievement.current} / {featuredAchievement.target}
                  </span>

                  <strong>{featuredAchievement.percent}%</strong>
                </div>

                <div className="home-progress">
                  <div
                    className="home-progress__bar"
                    style={{
                      width: `${featuredAchievement.percent}%`,
                    }}
                  />
                </div>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* =========================
          GOAL
      ========================= */}

      <section
        className="home-panel home-panel--clickable"
        role="button"
        tabIndex={0}
        onClick={() => setIsReadingGoalModalOpen(true)}
        onKeyDown={(event) => {
          if (event.key === "Enter" || event.key === " ") {
            event.preventDefault();

            setIsReadingGoalModalOpen(true);
          }
        }}
      >
        <div className="home-panel__header">
          <div>
            <span className="home-section__kicker">Прогрес</span>

            <h2>Ціль читання</h2>
          </div>

          <span className="reading-goal__percent">{goalPercent}%</span>
        </div>

        {hasReadingGoal && goalProgress ? (
          <div className="reading-goal">
            <div className="reading-goal__hero">
              <div className="reading-goal__icon">
                <TargetIcon />
              </div>

              <div>
                <span>{goalProgress.label}</span>

                <div className="reading-goal__numbers">
                  <strong>{goalProgress.current}</strong>

                  <span>
                    / {goalProgress.goal} {goalProgress.unit}
                  </span>
                </div>
              </div>
            </div>

            <div className="home-progress home-progress--large">
              <div
                className="home-progress__bar"
                style={{
                  width: `${goalPercent}%`,
                }}
              />
            </div>
          </div>
        ) : (
          <div className="home-empty-state">
            <div className="home-empty-state__icon">
              <TargetIcon />
            </div>

            <div>
              <strong>Мету ще не встановлено</strong>

              <span>Встанови річну ціль, щоб бачити прогрес.</span>
            </div>
          </div>
        )}
      </section>

      {/* =========================
          MONTH
      ========================= */}

      <section
        className="home-panel month-panel home-panel--clickable"
        role="button"
        tabIndex={0}
        onClick={handleOpenStats}
        onKeyDown={(event) => {
          if (event.key === "Enter" || event.key === " ") {
            event.preventDefault();
            handleOpenStats();
          }
        }}
      >
        <div className="home-panel__header">
          <div>
            <span className="home-section__kicker">Підсумок місяця</span>

            <h2>{MONTHS[currentMonth - 1]}</h2>
          </div>

          <div className="month-panel__icon">
            <CalendarIcon />
          </div>
        </div>

        <div className="monthly-summary">
          <div className="monthly-summary__primary">
            <span>Час читання</span>

            <strong>{formatReadingTime(monthSeconds)}</strong>
          </div>

          <div className="monthly-summary__grid">
            <div>
              <span>Сторінки</span>

              <strong>{monthPages}</strong>
            </div>

            <div>
              <span>Завершено книг</span>

              <strong>{monthBooks}</strong>
            </div>
          </div>
        </div>
      </section>

      {/* =========================
          READING GOAL MODAL
      ========================= */}

      {isReadingGoalModalOpen && (
        <ReadingGoalModal
          initialGoal={readingGoal}
          onClose={() => setIsReadingGoalModalOpen(false)}
        />
      )}

      {/* =========================
          CREATE LIBRARY MODAL
      ========================= */}

      {modalType === "create" && (
        <Modal
          isOpen
          onClose={() => {
            if (isSubmitting) {
              return;
            }

            setLibraryName("");
            setModalType(null);
          }}
          title="Створити бібліотеку"
          subtitle="Створіть нову поличку для книг"
          className="library-action-modal"
          closeOnEscape={!isSubmitting}
          closeOnBackdrop={!isSubmitting}
        >
          <form
            className="library-action-modal__form"
            onSubmit={handleCreateLibrary}
          >
            <label className="library-action-modal__field">
              <span>Назва бібліотеки</span>

              <input
                type="text"
                value={libraryName}
                onChange={(event) => setLibraryName(event.target.value)}
                placeholder="Наприклад: Домашня бібліотека"
                autoFocus
                required
              />
            </label>

            <div className="library-action-modal__actions">
              <button
                type="button"
                className="library-action-modal__cancel"
                onClick={() => {
                  if (isSubmitting) {
                    return;
                  }

                  setLibraryName("");
                  setModalType(null);
                }}
                disabled={isSubmitting}
              >
                Скасувати
              </button>

              <button
                type="submit"
                className="library-action-modal__submit"
                disabled={isSubmitting || !libraryName.trim()}
              >
                {isSubmitting ? "Створення..." : "Створити"}
              </button>
            </div>
          </form>
        </Modal>
      )}

      {/* =========================
          ADD MEMBER MODAL
      ========================= */}

      {modalType === "member" && (
        <Modal
          isOpen
          onClose={() => {
            if (isSubmitting) {
              return;
            }

            setMemberEmail("");
            setModalType(null);
          }}
          title="Додати учасника"
          subtitle={
            activeLibrary?.name
              ? `Бібліотека «${activeLibrary.name}»`
              : "Додайте користувача до бібліотеки"
          }
          className="library-action-modal"
          closeOnEscape={!isSubmitting}
          closeOnBackdrop={!isSubmitting}
        >
          <form
            className="library-action-modal__form"
            onSubmit={handleAddMember}
          >
            <label className="library-action-modal__field">
              <span>Email користувача</span>

              <input
                type="email"
                value={memberEmail}
                onChange={(event) => setMemberEmail(event.target.value)}
                placeholder="user@example.com"
                autoComplete="email"
                autoFocus
                required
              />
            </label>

            <div className="library-action-modal__actions">
              <button
                type="button"
                className="library-action-modal__cancel"
                onClick={() => {
                  if (isSubmitting) {
                    return;
                  }

                  setMemberEmail("");
                  setModalType(null);
                }}
                disabled={isSubmitting}
              >
                Скасувати
              </button>

              <button
                type="submit"
                className="library-action-modal__submit"
                disabled={isSubmitting || !memberEmail.trim()}
              >
                {isSubmitting ? "Додавання..." : "Додати"}
              </button>
            </div>
          </form>
        </Modal>
      )}
    </main>
  );
};

export default HomePage;







