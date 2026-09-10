import { useEffect, useState } from "react";

import { apiFetch } from "../../../../../../shared/api/apiClient.js";
import { useLibrary } from "../../../../../libraries/context/LibraryContext.jsx";

import GoalProgress from "../StatsGoals/GoalProgress.jsx";
import LibraryGoalModal from "./LibraryGoalModal.jsx";

const LibraryGoalProgress = ({ year }) => {
  const { activeLibrary, activeLibraryId } = useLibrary();

  const [goal, setGoal] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    const loadGoal = async () => {
      if (!activeLibraryId) {
        setGoal(null);
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);

        const data = await apiFetch(
          `/api/libraries/${activeLibraryId}/goal?year=${year}`,
        );

        setGoal(data);
      } catch (error) {
        console.error("Load library goal error:", error);
        setGoal(null);
      } finally {
        setIsLoading(false);
      }
    };

    loadGoal();
  }, [activeLibraryId, year, refreshKey]);

  useEffect(() => {
    const handleLibraryBookAdded = (event) => {
      if (event.detail?.libraryId === activeLibraryId) {
        setRefreshKey((value) => value + 1);
      }
    };

    window.addEventListener("library-book-added", handleLibraryBookAdded);

    return () => {
      window.removeEventListener("library-book-added", handleLibraryBookAdded);
    };
  }, [activeLibraryId]);

  if (!activeLibraryId || isLoading) {
    return null;
  }

  const canManage =
    activeLibrary?.role === "OWNER" ||
    activeLibrary?.role === "ADMIN";

  const handleOpen = (event) => {
    event.stopPropagation();

    if (canManage) {
      setIsModalOpen(true);
    }
  };

  const handleKeyDown = (event) => {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      event.stopPropagation();

      if (canManage) {
        setIsModalOpen(true);
      }
    }
  };

  return (
    <>
      <div
        className={
          canManage
            ? "reading-goals library-goal--clickable"
            : "reading-goals"
        }
        role={canManage ? "button" : undefined}
        tabIndex={canManage ? 0 : undefined}
        onClick={handleOpen}
        onKeyDown={canManage ? handleKeyDown : undefined}
      >
        <GoalProgress
          label="Поповнення бібліотеки"
          current={goal?.progress ?? 0}
          target={goal?.goal ?? null}
          percent={goal?.percent ?? 0}
        />
      </div>

      {isModalOpen && (
        <LibraryGoalModal
          libraryId={activeLibraryId}
          year={year}
          initialGoal={goal?.goal ?? null}
          onClose={() => setIsModalOpen(false)}
          onSaved={setGoal}
        />
      )}
    </>
  );
};

export default LibraryGoalProgress;