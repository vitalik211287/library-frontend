import Icon from "../../../../../../shared/components/Icon/Icon.jsx";
import AppPanel from "../../../../../../shared/components/AppPanel/AppPanel.jsx";
import useReadingStreak from "../../hooks/useReadingStreak.js";
import { FinishedBookIcon } from "../../../../../home/components/HomeIcons.jsx";

import "./ProfileStats.css";

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
        <Icon name="bookmark" />

        <strong>{wishlistCount}</strong>

        <span>Хочу прочитати</span>
      </AppPanel>

      <AppPanel as="article" variant="secondary" className="profile-stat">
        <Icon name="reading" />

        <strong>{currentBooksCount}</strong>

        <span>Читаю зараз</span>
      </AppPanel>

      <AppPanel as="article" variant="secondary" className="profile-stat">
        <Icon name="flame" className="profile-stat__flame" />

        <strong>{isStreakLoading ? "..." : currentStreak}</strong>

        <span>Днів поспіль</span>
      </AppPanel>
    </section>
  );
};

export default ProfileStats;
