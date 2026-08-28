import { useEffect, useState } from "react";

import { useNavigate } from "react-router-dom";

import "./UserPage.css";

import { useAuth } from "../../context/AuthContext.jsx";

const API_URL = "https://library-backend-production-5d60.up.railway.app";

function UserPage() {
  const navigate = useNavigate();

  const { user } = useAuth();

  /* =========================
     CURRENT READING
  ========================= */

  const [currentBooks, setCurrentBooks] = useState([]);

  const [isCurrentReadingLoading, setIsCurrentReadingLoading] = useState(true);

  const [currentReadingError, setCurrentReadingError] = useState("");

  const [isCurrentBooksOpen, setIsCurrentBooksOpen] = useState(false);

  /* =========================
     WISHLIST
  ========================= */

  const [wishlistBooks, setWishlistBooks] = useState([]);

  const [wishlistCount, setWishlistCount] = useState(0);

  const [isWishlistLoading, setIsWishlistLoading] = useState(true);

  const [wishlistError, setWishlistError] = useState("");

  /* =========================
     FINISHED BOOKS
  ========================= */

  const [finishedBooks, setFinishedBooks] = useState([]);

  const [finishedCount, setFinishedCount] = useState(0);

  const [isFinishedLoading, setIsFinishedLoading] = useState(true);

  const [finishedError, setFinishedError] = useState("");

  /* =========================
     LOAD CURRENT READING
  ========================= */

  useEffect(() => {
    const loadCurrentReading = async () => {
      const token = localStorage.getItem("token");

      if (!token) {
        setIsCurrentReadingLoading(false);

        return;
      }

      try {
        setCurrentReadingError("");

        const response = await fetch(`${API_URL}/api/user-books/current`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (!response.ok) {
          throw new Error("Не вдалося завантажити поточні книги");
        }

        const data = await response.json();

        setCurrentBooks(Array.isArray(data.books) ? data.books : []);
      } catch (error) {
        console.error("Load current reading error:", error);

        setCurrentReadingError("Не вдалося завантажити поточне читання");
      } finally {
        setIsCurrentReadingLoading(false);
      }
    };

    loadCurrentReading();
  }, []);

  /* =========================
     LOAD WISHLIST
  ========================= */

  useEffect(() => {
    const loadWishlist = async () => {
      const token = localStorage.getItem("token");

      if (!token) {
        setIsWishlistLoading(false);

        return;
      }

      try {
        setWishlistError("");

        const response = await fetch(`${API_URL}/api/user-books/wishlist`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (!response.ok) {
          throw new Error("Не вдалося завантажити wishlist");
        }

        const data = await response.json();

        setWishlistBooks(Array.isArray(data.books) ? data.books : []);

        setWishlistCount(Number(data.count) || 0);
      } catch (error) {
        console.error("Load wishlist error:", error);

        setWishlistError("Не вдалося завантажити список");
      } finally {
        setIsWishlistLoading(false);
      }
    };

    loadWishlist();
  }, []);

  /* =========================
     LOAD FINISHED BOOKS
  ========================= */

  useEffect(() => {
    const loadFinishedBooks = async () => {
      const token = localStorage.getItem("token");

      if (!token) {
        setIsFinishedLoading(false);

        return;
      }

      try {
        setFinishedError("");

        const response = await fetch(`${API_URL}/api/user-books/finished`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (!response.ok) {
          throw new Error("Не вдалося завантажити прочитані книги");
        }

        const data = await response.json();

        setFinishedBooks(Array.isArray(data.books) ? data.books : []);

        setFinishedCount(Number(data.count) || 0);
      } catch (error) {
        console.error("Load finished books error:", error);

        setFinishedError("Не вдалося завантажити прочитані книги");
      } finally {
        setIsFinishedLoading(false);
      }
    };

    loadFinishedBooks();
  }, []);

  /* =========================
     NAVIGATION
  ========================= */

  const handleSettings = () => {
    navigate("/settings");
  };

  const handleContinueReading = (bookId) => {
    if (!bookId) {
      return;
    }

    navigate(`/?reading=${bookId}`);
  };

  /* =========================
     PROGRESS
  ========================= */

  const getProgress = (currentPage, totalPages) => {
    if (!totalPages || totalPages <= 0) {
      return 0;
    }

    return Math.min(Math.round((currentPage / totalPages) * 100), 100);
  };

  const mainCurrentBook = currentBooks[0] ?? null;

  const otherCurrentBooks = currentBooks.slice(1);

  return (
    <main className="user-page">
      <section className="user-profile">
        {/* =====================
            PROFILE HEADER
        ===================== */}

        <div className="user-profile__top">
          <div className="user-profile__avatar">
            {user?.avatarUrl ? (
              <img src={user.avatarUrl} alt={user?.name || "Користувач"} />
            ) : (
              <span>
                {(user?.name || user?.email || "U").charAt(0).toUpperCase()}
              </span>
            )}
          </div>

          <div className="user-profile__identity">
            <h1>{user?.name || "Мій профіль"}</h1>

            {user?.email && <p>{user.email}</p>}
          </div>

          <button
            type="button"
            className="user-profile__settings"
            onClick={handleSettings}
            aria-label="Налаштування"
            title="Налаштування"
          >
            <svg viewBox="0 0 24 24" aria-hidden="true">
              <path d="M12 15.5A3.5 3.5 0 1 0 12 8a3.5 3.5 0 0 0 0 7.5Z" />

              <path d="M19.4 15a1.7 1.7 0 0 0 .34 1.88l.06.06-2.83 2.83-.06-.06a1.7 1.7 0 0 0-1.88-.34 1.7 1.7 0 0 0-1.03 1.56V21h-4v-.08a1.7 1.7 0 0 0-1.03-1.56 1.7 1.7 0 0 0-1.88.34l-.06.06-2.83-2.83.06-.06A1.7 1.7 0 0 0 4.6 15a1.7 1.7 0 0 0-1.56-1.03H3v-4h.08A1.7 1.7 0 0 0 4.64 8.9a1.7 1.7 0 0 0-.34-1.88l-.06-.06 2.83-2.83.06.06A1.7 1.7 0 0 0 9 4.53a1.7 1.7 0 0 0 1.03-1.56V3h4v.08A1.7 1.7 0 0 0 15.1 4.64a1.7 1.7 0 0 0 1.88-.34l.06-.06 2.83 2.83-.06.06a1.7 1.7 0 0 0-.34 1.88 1.7 1.7 0 0 0 1.56 1.03H21v4h-.08A1.7 1.7 0 0 0 19.4 15Z" />
            </svg>
          </button>
        </div>

        {/* =====================
            STATS
        ===================== */}

        <section className="user-profile__stats">
          <div className="user-profile__stat">
            <strong>{isFinishedLoading ? "..." : finishedCount}</strong>

            <span>Прочитано</span>
          </div>

          <div className="user-profile__stat">
            <strong>{isWishlistLoading ? "..." : wishlistCount}</strong>

            <span>Хочу прочитати</span>
          </div>

          <div className="user-profile__stat">
            <strong>0</strong>

            <span>Годин читання</span>
          </div>

          <div className="user-profile__stat">
            <strong>0</strong>

            <span>Днів поспіль</span>
          </div>
        </section>

        {/* =====================
            CURRENT READING
        ===================== */}

        <section className="user-profile__section">
          <div className="user-profile__section-header">
            <h2>Зараз читаю</h2>

            {currentBooks.length > 0 && (
              <span className="user-profile__section-count">
                {currentBooks.length}
              </span>
            )}
          </div>

          {isCurrentReadingLoading ? (
            <div className="user-profile__empty">Завантаження...</div>
          ) : currentReadingError ? (
            <div className="user-profile__empty">{currentReadingError}</div>
          ) : !mainCurrentBook ? (
            <div className="user-profile__empty">Немає активних книг</div>
          ) : (
            <>
              <div className="user-profile__current-books">
                {[mainCurrentBook, ...otherCurrentBooks].map(
                  ({ book, userBook }, index) => {
                    const currentPage = userBook?.currentPage ?? 0;

                    const totalPages = book?.pages ?? 0;

                    const progress = getProgress(currentPage, totalPages);

                    const isSecondary = index > 0;

                    return (
                      <article
                        className={`user-profile__current-book ${
                          isSecondary
                            ? "user-profile__current-book--secondary"
                            : ""
                        }`}
                        key={userBook.id}
                      >
                        <div className="user-profile__current-book-cover">
                          {book?.coverUrl ? (
                            <img src={book.coverUrl} alt={book.title} />
                          ) : (
                            <div className="user-profile__no-cover">
                              Немає
                              <br />
                              обкладинки
                            </div>
                          )}
                        </div>

                        <div className="user-profile__current-book-content">
                          <h3>{book?.title}</h3>

                          <p>{book?.author}</p>

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
                              Сторінка {currentPage}
                              {totalPages ? ` з ${totalPages}` : ""}
                            </span>

                            <strong>{progress}%</strong>
                          </div>

                          <button
                            type="button"
                            className="user-profile__continue"
                            onClick={() => handleContinueReading(book.id)}
                          >
                            Продовжити читання
                          </button>
                        </div>
                      </article>
                    );
                  },
                )}
              </div>

              {otherCurrentBooks.length > 0 && (
                <button
                  type="button"
                  className={`user-profile__more-current ${
                    isCurrentBooksOpen ? "user-profile__more-current--open" : ""
                  }`}
                  onClick={() => setIsCurrentBooksOpen((current) => !current)}
                >
                  <span>
                    {isCurrentBooksOpen
                      ? "Згорнути"
                      : `Ще ${otherCurrentBooks.length} ${
                          otherCurrentBooks.length === 1 ? "книга" : "книги"
                        }`}
                  </span>

                  <svg viewBox="0 0 24 24" aria-hidden="true">
                    <path d="m7 9 5 5 5-5" />
                  </svg>
                </button>
              )}
            </>
          )}
        </section>

        {/* =====================
            WISHLIST
        ===================== */}

        <section className="user-profile__section">
          <div className="user-profile__section-header">
            <h2>Хочу прочитати</h2>

            {wishlistBooks.length > 0 && <button type="button">Всі</button>}
          </div>

          {isWishlistLoading ? (
            <div className="user-profile__empty">Завантаження...</div>
          ) : wishlistError ? (
            <div className="user-profile__empty">{wishlistError}</div>
          ) : wishlistBooks.length === 0 ? (
            <div className="user-profile__empty">Список поки порожній</div>
          ) : (
            <div className="user-profile__books">
              {wishlistBooks.map(({ book, userBook }) => (
                <article className="user-profile__book" key={userBook.id}>
                  <div className="user-profile__book-cover">
                    {book.coverUrl ? (
                      <img src={book.coverUrl} alt={book.title} />
                    ) : (
                      <div className="user-profile__no-cover">
                        Немає
                        <br />
                        обкладинки
                      </div>
                    )}
                  </div>

                  <h3>{book.title}</h3>

                  <p>{book.author}</p>
                </article>
              ))}
            </div>
          )}
        </section>

        {/* =====================
            FINISHED
        ===================== */}

        <section className="user-profile__section">
          <div className="user-profile__section-header">
            <h2>Прочитано</h2>

            {finishedBooks.length > 0 && <button type="button">Всі</button>}
          </div>

          {isFinishedLoading ? (
            <div className="user-profile__empty">Завантаження...</div>
          ) : finishedError ? (
            <div className="user-profile__empty">{finishedError}</div>
          ) : finishedBooks.length === 0 ? (
            <div className="user-profile__empty">
              Тут з’являться прочитані книги
            </div>
          ) : (
            <div className="user-profile__books">
              {finishedBooks.map(({ book, userBook }) => (
                <article className="user-profile__book" key={userBook.id}>
                  <div className="user-profile__book-cover">
                    {book.coverUrl ? (
                      <img src={book.coverUrl} alt={book.title} />
                    ) : (
                      <div className="user-profile__no-cover">
                        Немає
                        <br />
                        обкладинки
                      </div>
                    )}
                  </div>

                  <h3>{book.title}</h3>

                  <p>{book.author}</p>

                  {userBook.rating && (
                    <div className="user-profile__book-rating">
                      {"★".repeat(userBook.rating)}
                    </div>
                  )}
                </article>
              ))}
            </div>
          )}
        </section>

        {/* =====================
            ACTIVITY
        ===================== */}

        <section className="user-profile__section">
          <div className="user-profile__section-header">
            <h2>Активність читання</h2>
          </div>

          <div className="user-profile__chart-placeholder">
            Графік додамо наступним етапом
          </div>
        </section>
      </section>
    </main>
  );
}

export default UserPage;
