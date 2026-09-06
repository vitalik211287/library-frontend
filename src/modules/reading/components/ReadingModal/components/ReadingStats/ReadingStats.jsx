import { useState } from "react";
import { useNavigate } from "react-router-dom";

import { formatDuration } from "../../utils/readingModalHelpers.js";
import { formatEstimatedTime } from "./utils/readingStatsHelpers.js";

import ReadingQuickStats from "./components/ReadingQuickStats.jsx";
import ReadingStatsDetails from "./components/ReadingStatsDetails.jsx";

import "./ReadingStats.css";

const ReadingStats = ({
  stats,
  activeSession,
  elapsedSeconds,
  bookId,
  onOpenSessions,
}) => {
  const navigate = useNavigate();

  const [detailsOpen, setDetailsOpen] = useState(false);

  if (!stats) {
    return null;
  }

  const handleOpenCalendar = () => {
    navigate(`/calendar?book=${bookId}`, {
      state: {
        fromReadingModal: true,
        bookId,
      },
    });
  };

  const handleOpenSessions = () => {
    if (onOpenSessions) {
      onOpenSessions();
    }
  };

  const isPercentMode = stats.progressMode === "PERCENT";

  const longestSessionSeconds = Math.max(
    stats.longestSessionSeconds ?? 0,
    activeSession ? elapsedSeconds : 0,
  );

  const totalReadingSeconds = stats.totalReadingSeconds ?? 0;

  const pagesRead = stats.pagesRead ?? 0;

  const percentRead = stats.percentRead ?? 0;

  const sessionsCount = stats.sessionsCount ?? 0;

  const pagesPerHour = stats.pagesPerHour ?? 0;

  const percentPerHour = stats.percentPerHour ?? 0;

  const progressReadValue = isPercentMode
    ? `${percentRead}%`
    : `${pagesRead} стор.`;

  const speedValue = isPercentMode ? percentPerHour : pagesPerHour;

  const speedUnit = isPercentMode ? "%/год" : "стор./год";

  const remainingValue = isPercentMode
    ? stats.remainingPercent !== null && stats.remainingPercent !== undefined
      ? `${stats.remainingPercent}%`
      : "—"
    : stats.remainingPages !== null && stats.remainingPages !== undefined
      ? `${stats.remainingPages} стор.`
      : "—";

  const estimatedTimeValue = formatEstimatedTime(
    stats.estimatedRemainingSeconds,
  );

  return (
    <section className="reading-modal__stats-section">
      <ReadingQuickStats
        totalReadingValue={formatDuration(totalReadingSeconds)}
        progressReadValue={progressReadValue}
        speedValue={speedValue}
        speedUnit={speedUnit}
        sessionsCount={sessionsCount}
        detailsOpen={detailsOpen}
        onToggleDetails={() => setDetailsOpen((current) => !current)}
      />

      <ReadingStatsDetails
        detailsOpen={detailsOpen}
        activeSession={activeSession}
        elapsedSeconds={elapsedSeconds}
        progressReadValue={progressReadValue}
        totalReadingValue={formatDuration(totalReadingSeconds)}
        speedValue={speedValue}
        speedUnit={speedUnit}
        remainingValue={remainingValue}
        estimatedTimeValue={estimatedTimeValue}
        sessionsCount={sessionsCount}
        longestSessionSeconds={longestSessionSeconds}
        onOpenSessions={handleOpenSessions}
        onOpenCalendar={handleOpenCalendar}
      />
    </section>
  );
};

export default ReadingStats;

