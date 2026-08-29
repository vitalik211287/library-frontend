import { useEffect, useMemo, useState } from "react";

import { useNavigate, useSearchParams } from "react-router-dom";

import "./UserPage.css";

import { useAuth } from "../../context/AuthContext.jsx";

const API_URL = "https://library-backend-production-5d60.up.railway.app";

/* =========================
   ICONS
========================= */

const BookIcon = () => (
  <svg viewBox="0 0 24 24" aria-hidden="true">
    <path d="M4 5.5A2.5 2.5 0 0 1 6.5 3H11a2 2 0 0 1 2 2v16a2 2 0 0 0-2-2H6.5A2.5 2.5 0 0 0 4 21.5v-16Z" />

    <path d="M20 5.5A2.5 2.5 0 0 0 17.5 3H13v18a2 2 0 0 1 2-2h2.5a2.5 2.5 0 0 1 2.5 2.5v-16Z" />
  </svg>
);

const BookmarkIcon = () => (
  <svg viewBox="0 0 24 24" aria-hidden="true">
    <path d="M6 4.5A1.5 1.5 0 0 1 7.5 3h9A1.5 1.5 0 0 1 18 4.5V21l-6-4-6 4V4.5Z" />
  </svg>
);

const ReadingIcon = () => (
  <svg viewBox="0 0 24 24" aria-hidden="true">
    <path d="M3.5 5.5A2.5 2.5 0 0 1 6 3h4a2 2 0 0 1 2 2v15a2 2 0 0 0-2-2H6a2.5 2.5 0 0 0-2.5 2.5v-15Z" />

    <path d="M20.5 5.5A2.5 2.5 0 0 0 18 3h-4a2 2 0 0 0-2 2v15a2 2 0 0 1 2-2h4a2.5 2.5 0 0 1 2.5 2.5v-15Z" />

    <path d="M7 7h2" />
    <path d="M15 7h2" />
  </svg>
);

const StarIcon = () => (
  <svg viewBox="0 0 24 24" aria-hidden="true">
    <path d="m12 3 2.8 5.7 6.2.9-4.5 4.4 1.1 6.2-5.6-2.9-5.6 2.9 1.1-6.2L3 9.6l6.2-.9L12 3Z" />
  </svg>
);

const EditIcon = () => (
  <svg viewBox="0 0 24 24" aria-hidden="true">
    <path d="m4 20 4.4-1 9.8-9.8-3.4-3.4L5 15.6 4 20Z" />
    <path d="m13.8 6.8 3.4 3.4" />
  </svg>
);

const ArrowIcon = () => (
  <svg viewBox="0 0 24 24" aria-hidden="true">
    <path d="m9 6 6 6-6 6" />
  </svg>
);

const ChevronIcon = ({ isOpen = false }) => (
  <svg
    className={
      isOpen
        ? "current-books-toggle__icon current-books-toggle__icon--open"
        : "current-books-toggle__icon"
    }
    viewBox="0 0 24 24"
    aria-hidden="true"
  >
    <path d="m7 9 5 5 5-5" />
  </svg>
);

/* =========================
   PAGE
========================= */

const UserPage = () => {
  const navigate = useNavigate();

  const [searchParams, setSearchParams] = useSearchParams();

  const { user } = useAuth();

  const [currentBooks, setCurrentBooks] = useState([]);

  const [wishlistBooks, setWishlistBooks] = useState([]);

  const [finishedBooks, setFinishedBooks] = useState([]);

  const [wishlistCount, setWishlistCount] = useState(0);

  const [finishedCount, setFinishedCount] = useState(0);

  const [isCurrentReadingLoading, setIsCurrentReadingLoading] = useState(true);

  const [isWishlistLoading, setIsWishlistLoading] = useState(true);

  const [isFinishedLoading, setIsFinishedLoading] = useState(true);

  const [currentReadingError, setCurrentReadingError] = useState("");

  const [wishlistError, setWishlistError] = useState("");

  const [finishedError, setFinishedError] = useState("");

  const [isCurrentBooksOpen, setIsCurrentBooksOpen] = useState(false);

  /* =========================
     CURRENT
  ========================= */

  useEffect(() => {
    const loadCurrentBooks = async () => {
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
          throw new Error();
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

    loadCurrentBooks();
  }, []);

  /* =========================
     WISHLIST
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
          throw new Error();
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
     FINISHED
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
          throw new Error();
        }

        const data = await response.json();

        setFinishedBooks(Array.isArray(data.books) ? data.books : []);

        setFinishedCount(Number(data.count) || 0);
      } catch (error) {
        console.error("Load finished error:", error);

        setFinishedError("Не вдалося завантажити прочитані книги");
      } finally {
        setIsFinishedLoading(false);
      }
    };

    loadFinishedBooks();
  }, []);

  /* =========================
     REMOVE WISHLIST
  ========================= */

  const handleRemoveFromWishlist = async (bookId) => {
    const token = localStorage.getItem("token");

    if (!token || !bookId) {
      return;
    }

    try {
      const response = await fetch(
        `${API_URL}/api/user-books/${bookId}/wishlist`,
        {
          method: "DELETE",

          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      if (!response.ok) {
        throw new Error("Не вдалося прибрати книгу зі списку бажань");
      }

      setWishlistBooks((books) =>
        books.filter(({ book }) => book.id !== bookId),
      );

      setWishlistCount((count) => Math.max(count - 1, 0));
    } catch (error) {
      console.error("Remove wishlist error:", error);
    }
  };

  /* =========================
     OPEN READING
  ========================= */

  const handleOpenReading = (bookId) => {
    if (!bookId) {
      return;
    }

    const params = new URLSearchParams(searchParams);

    params.set("reading", bookId);

    setSearchParams(params);
  };

  /* =========================
     HELPERS
  ========================= */

  const getProgress = (currentPage, totalPages) => {
    if (!totalPages || totalPages <= 0) {
      return 0;
    }

    return Math.min(Math.round((currentPage / totalPages) * 100), 100);
  };

  const averageRating = useMemo(() => {
    const values = finishedBooks
      .map(({ userBook }) => Number(userBook?.rating))
      .filter((rating) => Number.isFinite(rating) && rating > 0);

    if (!values.length) {
      return 0;
    }

    const sum = values.reduce((total, rating) => total + rating, 0);

    return (sum / values.length).toFixed(1);
  }, [finishedBooks]);

  const mainCurrentBook = currentBooks[0] ?? null;

  const otherCurrentBooks = currentBooks.slice(1);

  const profileName = user?.name || "Користувач";

  return (
    <main className="user-page">
      <div className="user-profile">
        {/* =========================
            PROFILE HERO
        ========================= */}

        <section className="profile-hero">
          <div className="profile-hero__avatar-wrap">
            <div className="profile-hero__avatar">
              {user?.avatarUrl ? (
                <img src={user.avatarUrl} alt={profileName} />
              ) : (
                <span>{profileName.charAt(0).toUpperCase()}</span>
              )}
            </div>

            <button
              type="button"
              className="profile-hero__edit"
              onClick={() => navigate("/settings")}
              aria-label="Редагувати профіль"
            >
              <EditIcon />
            </button>
          </div>

          <div className="profile-hero__content">
            <h1>{profileName}</h1>

            {user?.email && <p className="profile-hero__email">{user.email}</p>}

            <p className="profile-hero__quote">
              «Читання — це подорож,
              <br />
              яка ніколи не закінчується.»
            </p>
          </div>
        </section>

        {/* =========================
            STATS
        ========================= */}

        <section className="profile-stats">
          <article className="profile-stat">
            <BookIcon />

            <strong>{isFinishedLoading ? "..." : finishedCount}</strong>

            <span>Прочитано</span>
          </article>

          <article className="profile-stat">
            <BookmarkIcon />

            <strong>{isWishlistLoading ? "..." : wishlistCount}</strong>

            <span>Хочу прочитати</span>
          </article>

          <article className="profile-stat">
            <ReadingIcon />

            <strong>
              {isCurrentReadingLoading ? "..." : currentBooks.length}
            </strong>

            <span>Читаю зараз</span>
          </article>

          <article className="profile-stat">
            <StarIcon />

            <strong>{isFinishedLoading ? "..." : averageRating}</strong>

            <span>Середній рейтинг</span>
          </article>
        </section>

        {/* =========================
            CURRENT
        ========================= */}

        <section className="profile-section">
          <div className="profile-section__header">
            <h2>Зараз читаю</h2>

            {otherCurrentBooks.length > 0 && (
              <button
                type="button"
                className="current-books-toggle"
                onClick={() => setIsCurrentBooksOpen((isOpen) => !isOpen)}
              >
                {isCurrentBooksOpen
                  ? "Згорнути"
                  : `Ще ${otherCurrentBooks.length}`}

                <ChevronIcon isOpen={isCurrentBooksOpen} />
              </button>
            )}
          </div>

          {isCurrentReadingLoading ? (
            <div className="profile-empty">Завантаження...</div>
          ) : currentReadingError ? (
            <div className="profile-empty">{currentReadingError}</div>
          ) : !mainCurrentBook ? (
            <div className="profile-empty">Немає активних книг</div>
          ) : (
            <>
              <article className="current-book">
                <div className="current-book__cover">
                  {mainCurrentBook.book?.coverUrl ? (
                    <img
                      src={mainCurrentBook.book.coverUrl}
                      alt={mainCurrentBook.book.title}
                    />
                  ) : (
                    <div className="book-no-cover">
                      Немає
                      <br />
                      обкладинки
                    </div>
                  )}
                </div>

                <div className="current-book__content">
                  <h3>{mainCurrentBook.book?.title}</h3>

                  <p className="current-book__author">
                    {mainCurrentBook.book?.author}
                  </p>

                  {(() => {
                    const currentPage =
                      mainCurrentBook.userBook?.currentPage ?? 0;

                    const totalPages = mainCurrentBook.book?.pages ?? 0;

                    const progress = getProgress(currentPage, totalPages);

                    return (
                      <>
                        <div className="current-book__progress">
                          <span
                            style={{
                              width: `${progress}%`,
                            }}
                          />
                        </div>

                        <div className="current-book__progress-info">
                          <span>
                            Сторінка {currentPage}
                            {totalPages ? ` з ${totalPages}` : ""}
                          </span>

                          <strong>{progress}%</strong>
                        </div>
                      </>
                    );
                  })()}

                  <button
                    type="button"
                    className="current-book__button"
                    onClick={() => handleOpenReading(mainCurrentBook.book.id)}
                  >
                    Продовжити читання
                  </button>
                </div>
              </article>

              {otherCurrentBooks.length > 0 && (
                <div
                  className={`current-books-dropdown ${
                    isCurrentBooksOpen ? "current-books-dropdown--open" : ""
                  }`}
                >
                  <div className="current-books-dropdown__inner">
                    {otherCurrentBooks.map(({ book, userBook }) => {
                      const currentPage = userBook?.currentPage ?? 0;

                      const totalPages = book?.pages ?? 0;

                      const progress = getProgress(currentPage, totalPages);

                      return (
                        <article
                          className="current-books-dropdown__book"
                          key={userBook.id}
                        >
                          <div className="current-books-dropdown__cover">
                            {book.coverUrl ? (
                              <img src={book.coverUrl} alt={book.title} />
                            ) : (
                              <div className="book-no-cover">
                                Немає
                                <br />
                                обкладинки
                              </div>
                            )}
                          </div>

                          <div className="current-books-dropdown__content">
                            <h3>{book.title}</h3>

                            <p>{book.author}</p>

                            <div className="current-books-dropdown__progress-row">
                              <div className="current-books-dropdown__progress">
                                <span
                                  style={{
                                    width: `${progress}%`,
                                  }}
                                />
                              </div>

                              <strong>{progress}%</strong>
                            </div>

                            <span className="current-books-dropdown__page">
                              Сторінка {currentPage}
                              {totalPages ? ` з ${totalPages}` : ""}
                            </span>

                            <button
                              type="button"
                              className="current-books-dropdown__button"
                              onClick={() => handleOpenReading(book.id)}
                            >
                              Продовжити
                            </button>
                          </div>
                        </article>
                      );
                    })}
                  </div>
                </div>
              )}
            </>
          )}
        </section>

        {/* =========================
            WISHLIST
        ========================= */}

        <section className="profile-section">
          <div className="profile-section__header">
            <h2>Хочу прочитати</h2>

            {wishlistBooks.length > 0 && (
              <button type="button">
                Переглянути всі
                <ArrowIcon />
              </button>
            )}
          </div>

          {isWishlistLoading ? (
            <div className="profile-empty">Завантаження...</div>
          ) : wishlistError ? (
            <div className="profile-empty">{wishlistError}</div>
          ) : wishlistBooks.length === 0 ? (
            <div className="profile-empty">Список поки порожній</div>
          ) : (
            <div className="profile-books">
              {wishlistBooks.map(({ book, userBook }) => (
                <article className="profile-book" key={userBook.id}>
                  <div className="profile-book__cover">
                    {book.coverUrl ? (
                      <img src={book.coverUrl} alt={book.title} />
                    ) : (
                      <div className="book-no-cover">
                        Немає
                        <br />
                        обкладинки
                      </div>
                    )}

                    <button
                      type="button"
                      className="profile-book__bookmark"
                      onClick={() => handleRemoveFromWishlist(book.id)}
                      aria-label="Прибрати зі списку бажань"
                      title="Прибрати зі списку бажань"
                    >
                      <BookmarkIcon />
                    </button>
                  </div>

                  <h3>{book.title}</h3>

                  <p>{book.author}</p>
                </article>
              ))}
            </div>
          )}
        </section>

        {/* =========================
            FINISHED
        ========================= */}

        <section className="profile-section">
          <div className="profile-section__header">
            <h2>Прочитано</h2>

            {finishedBooks.length > 0 && (
              <button type="button">
                Переглянути всі
                <ArrowIcon />
              </button>
            )}
          </div>

          {isFinishedLoading ? (
            <div className="profile-empty">Завантаження...</div>
          ) : finishedError ? (
            <div className="profile-empty">{finishedError}</div>
          ) : finishedBooks.length === 0 ? (
            <div className="profile-empty">Тут з’являться прочитані книги</div>
          ) : (
            <div className="profile-books">
              {finishedBooks.map(({ book, userBook }) => (
                <article className="profile-book" key={userBook.id}>
                  <div className="profile-book__cover">
                    {book.coverUrl ? (
                      <img src={book.coverUrl} alt={book.title} />
                    ) : (
                      <div className="book-no-cover">
                        Немає
                        <br />
                        обкладинки
                      </div>
                    )}
                  </div>

                  <h3>{book.title}</h3>

                  <p>{book.author}</p>

                  {userBook.rating && (
                    <div className="profile-book__rating">
                      {"★".repeat(userBook.rating)}
                    </div>
                  )}
                </article>
              ))}
            </div>
          )}
        </section>

        {/* =========================
            ACTIVITY
        ========================= */}

        <section className="profile-section">
          <div className="profile-section__header">
            <h2>Активність читання</h2>
          </div>

          <div className="reading-activity">
            <div className="reading-activity__bars">
              {[18, 34, 22, 58, 40, 66, 52, 70, 48, 51, 30, 15].map(
                (height, index) => (
                  <span
                    key={index}
                    style={{
                      height: `${height}%`,
                    }}
                  />
                ),
              )}
            </div>

            <div className="reading-activity__months">
              <span>Січ</span>
              <span>Бер</span>
              <span>Тра</span>
              <span>Лип</span>
              <span>Вер</span>
              <span>Лис</span>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
};

export default UserPage;
