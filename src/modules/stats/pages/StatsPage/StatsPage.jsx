import { useState } from "react";

import useReadingStats from "./hooks/useReadingStats.js";

import { useReadingStatsContext } from "../../context/ReadingStatsContext.jsx";
import useRefreshReadingData from "../../../reading/hooks/useRefreshReadingData.js";

import ReadingSessionsModal from "../../../reading/components/ReadingModal/components/ReadingSessionsModal/ReadingSessionsModal.jsx";
import ReadingGoalModal from "../../components/ReadingGoal/ReadingGoalModal.jsx";

import StatsHeader from "./components/StatsHeader/StatsHeader.jsx";
import StatsSummary from "./components/StatsSummary/StatsSummary.jsx";
import StatsGoals from "./components/StatsGoals/StatsGoals.jsx";
import YearActivity from "./components/YearActivity/YearActivity.jsx";
import StreakCard from "./components/StreakCard/StreakCard.jsx";
import GenreStats from "./components/GenreStats/GenreStats.jsx";
import AuthorsStats from "./components/AuthorsStats/AuthorsStats.jsx";
import StatsExtra from "./components/StatsExtra/StatsExtra.jsx";

import "./StatsPage.css";

const StatsPage = () => {
  const currentYear = new Date().getFullYear();

  const [year, setYear] = useState(currentYear);
  const [sessionsModalOpen, setSessionsModalOpen] = useState(false);
  const [goalModalOpen, setGoalModalOpen] = useState(false);

  const { refreshReadingStats } = useReadingStatsContext();
  const { refreshReadingData } = useRefreshReadingData();

  const { stats, goal, isLoading, error } = useReadingStats({
    year,
  });

  const handleSessionsChanged = async () => {
    if (year === currentYear) {
      await refreshReadingData();
      return;
    }

    await Promise.all([refreshReadingStats(year), refreshReadingData()]);
  };

  if (isLoading) {
    return (
      <main className="stats-page">
        <div className="stats-state">Завантажуємо статистику...</div>
      </main>
    );
  }

  if (error) {
    return (
      <main className="stats-page">
        <div className="stats-state stats-state--error">{error}</div>
      </main>
    );
  }

  if (!stats) {
    return null;
  }

  const { summary, streak, genres = [], authors = [], months = [] } = stats;

  return (
    <>
      <main className="stats-page">
        <StatsHeader
          year={year}
          currentYear={currentYear}
          onYearChange={setYear}
        />

        <StatsSummary summary={summary} streak={streak} />

        <StatsGoals
          year={year}
          goal={goal}
          onOpen={() => setGoalModalOpen(true)}
        />

        <section className="stats-grid">
          <YearActivity months={months} />

          <StreakCard streak={streak} />

          <GenreStats genres={genres} />

          <AuthorsStats authors={authors} />
        </section>

        <StatsExtra
          summary={summary}
          onOpenSessions={() => setSessionsModalOpen(true)}
        />
      </main>

      {sessionsModalOpen && (
        <ReadingSessionsModal
          onClose={() => setSessionsModalOpen(false)}
          onChanged={handleSessionsChanged}
        />
      )}

      {goalModalOpen && (
        <ReadingGoalModal
          year={year}
          initialGoal={goal?.goal ?? null}
          onClose={() => setGoalModalOpen(false)}
        />
      )}
    </>
  );
};

export default StatsPage;
