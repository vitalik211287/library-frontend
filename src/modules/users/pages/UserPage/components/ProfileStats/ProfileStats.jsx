import Icon from "../../../../../../shared/components/Icon/Icon.jsx";
import AppPanel from "../../../../../../shared/components/AppPanel/AppPanel.jsx";
import useReadingStreak from "../../hooks/useReadingStreak.js";
import { FinishedBookIcon } from "../../../../../home/components/HomeIcons.jsx";

import "./ProfileStats.css";

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

const ProfileStats = ({ finishedCount, wishlistCount, currentBooksCount }) => {
  const { currentStreak, isStreakLoading } = useReadingStreak();

  return (
    <section className="profile-stats">
      <AppPanel as="article" variant="secondary" className="profile-stat">
        <FinishedBookIcon />

        <strong>{finishedCount}</strong>

        <span>Прочитано</span>
      </AppPanel>

      <AppPanel as="article" variant="secondary" className="profile-stat">
        <BookmarkIcon />

        <strong>{wishlistCount}</strong>

        <span>Хочу прочитати</span>
      </AppPanel>

      <AppPanel as="article" variant="secondary" className="profile-stat">
        <ReadingIcon />

        <strong>{currentBooksCount}</strong>

        <span>Читаю зараз</span>
      </AppPanel>

      <AppPanel as="article" variant="secondary" className="profile-stat">
        <Icon name="flame" />

        <strong>{isStreakLoading ? "..." : currentStreak}</strong>

        <span>Днів поспіль</span>
      </AppPanel>
    </section>
  );
};

export default ProfileStats;
