import { useEffect, useState } from "react";

import AppPanel from "../../../../../../shared/components/AppPanel/AppPanel.jsx";
import { apiFetch } from "../../../../../../shared/api/apiClient.js";
import { useLibrary } from "../../../../../libraries/context/LibraryContext.jsx";
import LibraryGoalModal from "../../../../../stats/pages/StatsPage/components/LibraryGoalProgress/LibraryGoalModal.jsx";

import "../../../../../stats/components/ReadingGoal/ReadingGoal.css";
import "./LibraryGoal.css";
import Icon from "../../../../../../shared/components/Icon/Icon.jsx";

const LibraryGoal = () => {
  const { activeLibrary, activeLibraryId } = useLibrary();

  const year = new Date().getUTCFullYear();

  const [goal, setGoal] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);

  const canManage =
    activeLibrary?.role === "OWNER" || activeLibrary?.role === "ADMIN";

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
              <Icon name="edit" />
              Змінити
            </button>
          )}
        </div>

        {isLoading ? (
          <div className="profile-empty">Завантаження мети...</div>
        ) : (
          <AppPanel variant="secondary" className="library-goal-card">
            <div className="library-goal-card__main">
              <Icon name="book" />

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
                {goal?.goal ? `${percent}% виконано` : "Ціль ще не встановлена"}
              </span>

              {goal?.remaining !== null && goal?.remaining !== undefined && (
                <span>Залишилось {goal.remaining}</span>
              )}
            </div>
          </AppPanel>
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
