import {
  useEffect,
  useState,
} from "react";

import { useNavigate } from "react-router-dom";

import "./UserPage.css";

import { useAuth } from "../../context/AuthContext.jsx";

const API_URL =
  "https://library-backend-production-5d60.up.railway.app";

function UserPage() {
  const navigate = useNavigate();

  const { user } = useAuth();

  const [currentReading, setCurrentReading] =
    useState(null);

  const [isCurrentReadingLoading, setIsCurrentReadingLoading] =
    useState(true);

  const [currentReadingError, setCurrentReadingError] =
    useState("");

  useEffect(() => {
    const loadCurrentReading = async () => {
      const token =
        localStorage.getItem("token");

      if (!token) {
        setIsCurrentReadingLoading(false);
        return;
      }

      try {
        setCurrentReadingError("");

        const response = await fetch(
          `${API_URL}/api/user-books/current`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          },
        );

        if (!response.ok) {
          throw new Error(
            "Не вдалося завантажити поточну книгу",
          );
        }

        const data =
          await response.json();

        setCurrentReading(data);
      } catch (error) {
        console.error(
          "Load current reading error:",
          error,
        );

        setCurrentReadingError(
          "Не вдалося завантажити поточне читання",
        );
      } finally {
        setIsCurrentReadingLoading(false);
      }
    };

    loadCurrentReading();
  }, []);

  const handleSettings = () => {
    navigate("/settings");
  };

  const handleContinueReading = () => {
    if (!currentReading?.book?.id) {
      return;
    }

    navigate(
      `/?bookId=${currentReading.book.id}`,
    );
  };

  const book =
    currentReading?.book;

  const userBook =
    currentReading?.userBook;

  const currentPage =
    userBook?.currentPage ?? 0;

  const totalPages =
    book?.pages ?? 0;

  const progress =
    totalPages > 0
      ? Math.min(
          Math.round(
            (currentPage / totalPages) * 100,
          ),
          100,
        )
      : 0;

  return (
    <main className="user-page">
      <section className="user-profile">
        <div className="user-profile__top">
          <div className="user-profile__avatar">
            {user?.avatarUrl ? (
              <img
                src={user.avatarUrl}
                alt={
                  user?.name ||
                  "Користувач"
                }
              />
            ) : (
              <span>
                {(
                  user?.name ||
                  user?.email ||
                  "U"
                )
                  .charAt(0)
                  .toUpperCase()}
              </span>
            )}
          </div>

          <div className="user-profile__identity">
            <h1>
              {user?.name ||
                "Мій профіль"}
            </h1>

            {user?.email && (
              <p>{user.email}</p>
            )}
          </div>

          <button
            type="button"
            className="user-profile__settings"
            onClick={
              handleSettings
            }
            aria-label="Налаштування"
            title="Налаштування"
          >
            <svg
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <path d="M12 15.5A3.5 3.5 0 1 0 12 8a3.5 3.5 0 0 0 0 7.5Z" />
              <path d="M19.4 15a1.7 1.7 0 0 0 .34 1.88l.06.06-2.83 2.83-.06-.06a1.7 1.7 0 0 0-1.88-.34 1.7 1.7 0 0 0-1.03 1.56V21h-4v-.08a1.7 1.7 0 0 0-1.03-1.56 1.7 1.7 0 0 0-1.88.34l-.06.06-2.83-2.83.06-.06A1.7 1.7 0 0 0 4.6 15a1.7 1.7 0 0 0-1.56-1.03H3v-4h.08A1.7 1.7 0 0 0 4.64 8.9a1.7 1.7 0 0 0-.34-1.88l-.06-.06 2.83-2.83.06.06A1.7 1.7 0 0 0 9 4.53a1.7 1.7 0 0 0 1.03-1.56V3h4v.08A1.7 1.7 0 0 0 15.1 4.64a1.7 1.7 0 0 0 1.88-.34l.06-.06 2.83 2.83-.06.06a1.7 1.7 0 0 0-.34 1.88 1.7 1.7 0 0 0 1.56 1.03H21v4h-.08A1.7 1.7 0 0 0 19.4 15Z" />
            </svg>
          </button>
        </div>

        <section className="user-profile__stats">
          <div className="user-profile__stat">
            <strong>0</strong>
            <span>Прочитано</span>
          </div>

          <div className="user-profile__stat">
            <strong>0</strong>
            <span>
              Хочу прочитати
            </span>
          </div>

          <div className="user-profile__stat">
            <strong>0</strong>
            <span>
              Годин читання
            </span>
          </div>

          <div className="user-profile__stat">
            <strong>0</strong>
            <span>
              Днів поспіль
            </span>
          </div>
        </section>

        <section className="user-profile__section">
          <div className="user-profile__section-header">
            <h2>Зараз читаю</h2>
          </div>

          {isCurrentReadingLoading ? (
            <div className="user-profile__empty">
              Завантаження...
            </div>
          ) : currentReadingError ? (
            <div className="user-profile__empty">
              {
                currentReadingError
              }
            </div>
          ) : !currentReading ? (
            <div className="user-profile__empty">
              Немає активної книги
            </div>
          ) : (
            <article className="user-profile__current-book">
              <div className="user-profile__current-book-cover">
                {book?.coverUrl ? (
                  <img
                    src={
                      book.coverUrl
                    }
                    alt={book.title}
                  />
                ) : (
                  <div className="user-profile__no-cover">
                    Немає
                    <br />
                    обкладинки
                  </div>
                )}
              </div>

              <div className="user-profile__current-book-content">
                <h3>
                  {book?.title}
                </h3>

                <p>
                  {book?.author}
                </p>

                <div className="user-profile__progress">
                  <div
                    className="user-profile__progress-bar"
                    style={{
                      width: `${progress}%`,
                    }}
                  />
                </div>

                <div className="user-profile__progress-text">
                  <span>
                    Сторінка{" "}
                    {currentPage}
                    {totalPages
                      ? ` з ${totalPages}`
                      : ""}
                  </span>

                  <strong>
                    {progress}%
                  </strong>
                </div>

                <button
                  type="button"
                  className="user-profile__continue"
                  onClick={
                    handleContinueReading
                  }
                >
                  Продовжити читання
                </button>
              </div>
            </article>
          )}
        </section>

        <section className="user-profile__section">
          <div className="user-profile__section-header">
            <h2>
              Хочу прочитати
            </h2>

            <button type="button">
              Всі
            </button>
          </div>

          <div className="user-profile__empty">
            Список поки порожній
          </div>
        </section>

        <section className="user-profile__section">
          <div className="user-profile__section-header">
            <h2>Прочитано</h2>

            <button type="button">
              Всі
            </button>
          </div>

          <div className="user-profile__empty">
            Тут з’являться
            прочитані книги
          </div>
        </section>

        <section className="user-profile__section">
          <div className="user-profile__section-header">
            <h2>
              Активність читання
            </h2>
          </div>

          <div className="user-profile__chart-placeholder">
            Графік додамо
            наступним етапом
          </div>
        </section>
      </section>
    </main>
  );
}

export default UserPage;