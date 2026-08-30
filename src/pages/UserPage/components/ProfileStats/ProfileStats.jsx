import { useEffect, useState } from "react";

import "./ProfileStats.css";

const API_URL = "https://library-backend-production-5d60.up.railway.app";

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

const StreakIcon = () => (
  <svg viewBox="0 0 24 24" aria-hidden="true">
    <path d="M13 2s1 4-2 7c-2 2-4 4-4 7a5 5 0 0 0 10 0c0-2-1-4-2-5 0 3-2 4-3 4 1-3-1-5-1-5" />
  </svg>
);

const ProfileStats = ({
  finishedCount,
  wishlistCount,
  currentBooksCount,
  readingBookId,
}) => {
  const [currentStreak, setCurrentStreak] = useState(0);
  const [isStreakLoading, setIsStreakLoading] = useState(true);

  useEffect(() => {
    const loadStreak = async () => {
      const token = localStorage.getItem("token");

      if (!token) {
        setIsStreakLoading(false);
        return;
      }

      try {
        setIsStreakLoading(true);

        const currentYear = new Date().getFullYear();
        const timeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;

        const response = await fetch(
          `${API_URL}/api/user-books/stats?year=${currentYear}&timeZone=${encodeURIComponent(
            timeZone,
          )}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          },
        );

        if (!response.ok) {
          throw new Error("Failed to load reading streak");
        }

        const data = await response.json();

        setCurrentStreak(Number(data?.stats?.streak?.current) || 0);
      } catch (error) {
        console.error("Load reading streak error:", error);
        setCurrentStreak(0);
      } finally {
        setIsStreakLoading(false);
      }
    };

    loadStreak();
  }, [readingBookId]);

  return (
    <section className="profile-stats">
      <article className="profile-stat">
        <BookIcon />
        <strong>{finishedCount}</strong>
        <span>Прочитано</span>
      </article>

      <article className="profile-stat">
        <BookmarkIcon />
        <strong>{wishlistCount}</strong>
        <span>Хочу прочитати</span>
      </article>

      <article className="profile-stat">
        <ReadingIcon />
        <strong>{currentBooksCount}</strong>
        <span>Читаю зараз</span>
      </article>

      <article className="profile-stat">
        <StreakIcon />
        <strong>{isStreakLoading ? "..." : currentStreak}</strong>
        <span>Днів поспіль</span>
      </article>
    </section>
  );
};

export default ProfileStats;
