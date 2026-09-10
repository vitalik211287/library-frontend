import { useEffect, useState } from "react";

import { apiFetch } from "../../../../../../shared/api/apiClient.js";
import { useLibrary } from "../../../../../libraries/context/LibraryContext.jsx";
import LibraryGoalModal from "../../../../../stats/pages/StatsPage/components/LibraryGoalProgress/LibraryGoalModal.jsx";

import "../../../../../stats/components/ReadingGoal/ReadingGoal.css";
import "./LibraryGoal.css";

const EditIcon = () => (
  <svg viewBox="0 0 24 24" aria-hidden="true">
    <path d="m4 20 4.4-1 9.8-9.8-3.4-3.4L5 15.6 4 20Z" />
    <path d="m13.8 6.8 3.4 3.4" />
  </svg>
);

const LibraryIcon = () => (
  <svg viewBox="0 0 24 24" aria-hidden="true">
    <path d="M4 5.5A2.5 2.5 0 0 1 6.5 3H11a2 2 0 0 1 2 2v16a2 2 0 0 0-2-2H6.5A2.5 2.5 0 0 0 4 21.5v-16Z" />
    <path d="M20 5.5A2.5 2.5 0 0 0 17.5 3H13v18a2 2 0 0 1 2-2h2.5a2.5 2.5 0 0 1 2.5 2.5v-16Z" />
  </svg>
);

const LibraryGoal = () => {
  const { activeLibrary, activeLibraryId } = useLibrary();

  const year = new Date().getUTCFullYear();

  const [goal, setGoal] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);

  const canManage =
    activeLibrary?.role === "OWNER" ||
    activeLibrary?.role === "ADMIN";

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
    const handleRefresh = (event) => {
      if (event.detail?.libraryId === activeLibraryId) {
        setRefreshKey((value) => value + 1);
      }
    };

    window.addEventListener("library-book-added", handleRefresh);
    window.addEventListener("library-goal-updated", handleRefresh);

    return () => {
      window.removeEventListener("library-book-added", handleRefresh);
      window.removeEventListener("library-goal-updated", handleRefresh);
    };
  }, [activeLibraryId]);

  if (!activeLibraryId) {
    return null;
  }

  const percent = Math.min(Math.max(goal?.percent ?? 0, 0), 100);

  return (
    <>
      <section className="profile-section profile-section--library-goal">
        <div className="profile-section__header">
          <h2>Поповнення бібліотеки · {year}</h2>

          {canManage && (
            <button
              type="button"
              onClick={() => setIsModalOpen(true)}
              disabled={isLoading}
            >
              <EditIcon />
              Змінити
            </button>
          )}
        </div>

        {isLoading ? (
          <div className="profile-empty">Завантаження мети...</div>
        ) : (
          <div className="library-goal-card">
            <div className="library-goal-card__main">
              <LibraryIcon />

              <div>
                <strong>
                  {goal?.progress ?? 0} / {goal?.goal ?? "—"}
                </strong>

                <span>книг</span>
              </div>
            </div>

            <div className="library-goal-card__track">
              <div
                className="library-goal-card__bar"
                style={{ width: `${goal?.goal ? percent : 0}%` }}
              />
            </div>

            <div className="library-goal-card__footer">
              <span>
                {goal?.goal
                  ? `${percent}% виконано`
                  : "Ціль ще не встановлена"}
              </span>

              {goal?.remaining !== null &&
                goal?.remaining !== undefined && (
                  <span>Залишилось {goal.remaining}</span>
                )}
            </div>
          </div>
        )}
      </section>

      {isModalOpen && (
        <LibraryGoalModal
          libraryId={activeLibraryId}
          year={year}
          initialGoal={goal?.goal ?? null}
          onClose={() => setIsModalOpen(false)}
          onSaved={(data) => {
            setGoal(data);

            window.dispatchEvent(
              new CustomEvent("library-goal-updated", {
                detail: {
                  libraryId: activeLibraryId,
                  year,
                },
              }),
            );
          }}
        />
      )}
    </>
  );
};

export default LibraryGoal;