import { useState } from "react";

import useReadingStats from "./hooks/useReadingStats.js";

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

  const { stats, goal, isLoading, error } = useReadingStats({
    year,
  });

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
    <main className="stats-page">
      <StatsHeader
        year={year}
        currentYear={currentYear}
        onYearChange={setYear}
      />

      <StatsSummary summary={summary} streak={streak} />

      <StatsGoals year={year} goal={goal} />

      <section className="stats-grid">
        <YearActivity months={months} />

        <StreakCard streak={streak} />

        <GenreStats genres={genres} />

        <AuthorsStats authors={authors} />
      </section>

      <StatsExtra summary={summary} />
    </main>
  );
};

export default StatsPage;

