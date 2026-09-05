import { useMemo, useState } from "react";

import { useNavigate, useSearchParams } from "react-router-dom";

import "./HomePage.css";
import { useReadingStatsContext } from "../../../stats/context/ReadingStatsContext.jsx";
import { useReadingActivityContext } from "../../../reading/context/ReadingActivityContext.jsx";
import { useAuth } from "../../../auth/context/AuthContext.jsx";
import { useLibrary } from "../../../libraries/context/LibraryContext.jsx";
import { useUserBooks } from "../../../user-books/context/UserBooksContext.jsx";
import { useAchievementsContext } from "../../../stats/context/AchievementsContext.jsx";
import { useReadingGoalContext } from "../../../stats/context/ReadingGoalContext.jsx";
import ReadingGoalModal from "../../../stats/components/ReadingGoal/ReadingGoalModal.jsx";
import LibrarySwitcher from "../../components/LibrarySwitcher/LibrarySwitcher.jsx";
import HomeWelcome from "../../components/HomeWelcome/HomeWelcome.jsx";
import ReadingStreak from "../../components/ReadingStreak/ReadingStreak.jsx";
import CurrentReading from "../../components/CurrentReading/CurrentReading.jsx";
import AchievementCard from "../../components/AchievementCard/AchievementCard.jsx";
import ReadingGoalCard from "../../components/ReadingGoalCard/ReadingGoalCard.jsx";
import MonthlySummary from "../../components/MonthlySummary/MonthlySummary.jsx";
import CreateLibraryModal from "../../components/CreateLibraryModal/CreateLibraryModal.jsx";
import AddLibraryMemberModal from "../../components/AddLibraryMemberModal/AddLibraryMemberModal.jsx";
import useHomeActivity from "../../hooks/useHomeActivity.js";
import useHomeStats from "../../hooks/useHomeStats.js";
import useHomeLibraryActions from "../../hooks/useHomeLibraryActions.js";
import useCurrentBook from "../../hooks/useCurrentBook.js";
import useHomeShare from "../../hooks/useHomeShare.js";
import {
  MONTHS,
  getGreeting,
  getFirstName,
  formatReadingTime,
} from "../../utils/homeHelpers.js";
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
  const {
    modalType,
    setModalType,
    libraryName,
    setLibraryName,
    memberEmail,
    setMemberEmail,
    isSubmitting,
    handleSelectLibrary,
    handleCreateLibrary,
    handleAddMember,
  } = useHomeLibraryActions({
    activeLibraryId,
    createLibrary,
    addLibraryMember,
    setActiveLibraryId,
    setIsLibraryMenuOpen,
  });

  const [isReadingGoalModalOpen, setIsReadingGoalModalOpen] = useState(false);

  const now = useMemo(() => new Date(), []);

  const currentMonth = now.getMonth() + 1;

  const { weeklyActivity } = useHomeActivity({
    now,
    activityByMonth,
    ensureActivity,
  });

  const {
    streak,
    hasReadingGoal,
    goalProgress,
    goalPercent,
    monthSeconds,
    monthPages,
    monthBooks,
  } = useHomeStats({
    stats,
    readingGoal,
    currentMonth,
  });
  const { book, currentPage, totalPages, progress } =
    useCurrentBook(currentBooks);

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

  const { handleShare } = useHomeShare(streak);

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
      <LibrarySwitcher
        libraries={libraries}
        activeLibrary={activeLibrary}
        isOpen={isLibraryMenuOpen}
        onToggle={() => setIsLibraryMenuOpen((current) => !current)}
        onSelect={handleSelectLibrary}
        onCreate={() => {
          setIsLibraryMenuOpen(false);
          setModalType("create");
        }}
        onAddMember={() => {
          setIsLibraryMenuOpen(false);
          setModalType("member");
        }}
        onManage={() => {
          setIsLibraryMenuOpen(false);
          navigate("/library/manage");
        }}
      />
      <HomeWelcome greeting={getGreeting()} firstName={firstName} />
      <ReadingStreak
        streak={streak}
        weeklyActivity={weeklyActivity}
        onShare={handleShare}
      />
      <CurrentReading
        book={book}
        currentPage={currentPage}
        totalPages={totalPages}
        progress={progress}
        onContinue={handleContinueReading}
      />
      <AchievementCard
        latestAchievement={latestAchievement}
        featuredAchievement={featuredAchievement}
        onOpen={() => {
          navigate("/achievements");

          window.scrollTo({
            top: 0,
            left: 0,
            behavior: "instant",
          });
        }}
      />
      <ReadingGoalCard
        hasReadingGoal={hasReadingGoal}
        goalProgress={goalProgress}
        goalPercent={goalPercent}
        onOpen={() => setIsReadingGoalModalOpen(true)}
      />
      <MonthlySummary
        monthName={MONTHS[currentMonth - 1]}
        monthSeconds={monthSeconds}
        monthPages={monthPages}
        monthBooks={monthBooks}
        formatReadingTime={formatReadingTime}
        onOpen={handleOpenStats}
      />

      {/* =========================
          READING GOAL MODAL
      ========================= */}

      {isReadingGoalModalOpen && (
        <ReadingGoalModal
          initialGoal={readingGoal}
          onClose={() => setIsReadingGoalModalOpen(false)}
        />
      )}
      <CreateLibraryModal
        isOpen={modalType === "create"}
        libraryName={libraryName}
        setLibraryName={setLibraryName}
        isSubmitting={isSubmitting}
        onSubmit={handleCreateLibrary}
        onClose={() => setModalType(null)}
      />

      <AddLibraryMemberModal
        isOpen={modalType === "member"}
        activeLibrary={activeLibrary}
        memberEmail={memberEmail}
        setMemberEmail={setMemberEmail}
        isSubmitting={isSubmitting}
        onSubmit={handleAddMember}
        onClose={() => setModalType(null)}
      />
    </main>
  );
};

export default HomePage;
