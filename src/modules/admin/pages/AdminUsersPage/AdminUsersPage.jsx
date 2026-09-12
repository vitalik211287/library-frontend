import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import toast from "react-hot-toast";

import {
  blockAdminUser,
  getAdminUserById,
  getAdminUsers,
  unblockAdminUser,
} from "../../api/adminApi.js";

import { useAuth } from "../../../auth/context/AuthContext.jsx";
import Modal from "../../../../shared/components/Modal/Modal.jsx";

import "./AdminUsersPage.css";

const STATUS_LABELS = {
  NOT_STARTED: "Не розпочато",
  READING: "Читаю",
  PAUSED: "Призупинено",
  FINISHED: "Прочитано",
};

const BOOK_FILTERS = [
  { value: "ALL", label: "Усі" },
  { value: "READING", label: "Читає" },
  { value: "FINISHED", label: "Прочитано" },
  { value: "WISHLIST", label: "Хочу" },
  { value: "NOT_STARTED", label: "Не почато" },
];

const ACTIVITY_FILTERS = [
  { value: "ALL", label: "Уся активність" },
  { value: "SESSIONS", label: "Сесії читання" },
  { value: "STATUS", label: "Зміни статусу" },
];

const createUserSlug = (name) => {
  const transliteration = {
    "\u0430": "a",
    "\u0431": "b",
    "\u0432": "v",
    "\u0433": "h",
    "\u0491": "g",
    "\u0434": "d",
    "\u0435": "e",
    "\u0454": "ie",
    "\u0436": "zh",
    "\u0437": "z",
    "\u0438": "y",
    "\u0456": "i",
    "\u0457": "i",
    "\u0439": "i",
    "\u043a": "k",
    "\u043b": "l",
    "\u043c": "m",
    "\u043d": "n",
    "\u043e": "o",
    "\u043f": "p",
    "\u0440": "r",
    "\u0441": "s",
    "\u0442": "t",
    "\u0443": "u",
    "\u0444": "f",
    "\u0445": "kh",
    "\u0446": "ts",
    "\u0447": "ch",
    "\u0448": "sh",
    "\u0449": "shch",
    "\u044c": "",
    "\u044e": "iu",
    "\u044f": "ia",
  };

  return (name || "user")
    .toLowerCase()
    .split("")
    .map((char) => transliteration[char] ?? char)
    .join("")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "") || "user";
};

const AdminUsersPage = () => {
  const { user: currentUser } = useAuth();
  const navigate = useNavigate();
  const { userId } = useParams();

  const [users, setUsers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [actionUserId, setActionUserId] = useState(null);

  const [selectedUser, setSelectedUser] = useState(null);
  const [selectedBookId, setSelectedBookId] = useState(null);

  const [bookFilter, setBookFilter] = useState("ALL");
  const [activityFilter, setActivityFilter] = useState("ALL");

  const [isDetailsLoading, setIsDetailsLoading] = useState(false);

  useEffect(() => {
    const loadUsers = async () => {
      try {
        const adminUsers = await getAdminUsers();
        setUsers(adminUsers);
      } catch (error) {
        console.error("Load admin users error:", error);
        toast.error(error?.message || "Не вдалося завантажити користувачів");
      } finally {
        setIsLoading(false);
      }
    };

    loadUsers();
  }, []);

  const formatDate = (date) => {
    if (!date) {
      return "—";
    }

    return new Intl.DateTimeFormat("uk-UA", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    }).format(new Date(date));
  };

  const formatDateTime = (date) => {
    if (!date) {
      return "—";
    }

    return new Intl.DateTimeFormat("uk-UA", {
      day: "2-digit",
      month: "long",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(new Date(date));
  };

  const formatShortDate = (date) => {
    if (!date) {
      return "—";
    }

    return new Intl.DateTimeFormat("uk-UA", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    }).format(new Date(date));
  };

  const formatDuration = (seconds) => {
    const totalSeconds = Math.max(Number(seconds) || 0, 0);
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);

    if (hours > 0) {
      return `${hours} год ${minutes} хв`;
    }

    if (minutes > 0) {
      return `${minutes} хв`;
    }

    return "< 1 хв";
  };

  const getBookStatusLabel = (userBook) => {
    if (userBook?.isWishlist) {
      return "Хочу прочитати";
    }

    return STATUS_LABELS[userBook?.status] ?? "Не розпочато";
  };

  const getProgress = (userBook) => {
    if (userBook?.progressMode === "PERCENT") {
      return userBook.currentPercent ?? 0;
    }

    if (!userBook?.book?.pages) {
      return 0;
    }

    return Math.min(
      Math.round(((userBook.currentPage ?? 0) / userBook.book.pages) * 100),
      100,
    );
  };

  const getProgressLabel = (userBook) => {
    if (userBook?.progressMode === "PERCENT") {
      return `${userBook.currentPercent ?? 0}%`;
    }

    return `${userBook.currentPage ?? 0} / ${
      userBook?.book?.pages ?? "—"
    } стор.`;
  };

  const handleToggleBlocked = async (user) => {
    if (user.id === currentUser?.id) {
      return;
    }

    try {
      setActionUserId(user.id);

      const updatedUser = user.isBlocked
        ? await unblockAdminUser(user.id)
        : await blockAdminUser(user.id);

      setUsers((currentUsers) =>
        currentUsers.map((item) =>
          item.id === user.id
            ? {
                ...item,
                ...updatedUser,
              }
            : item,
        ),
      );

      toast.success(
        user.isBlocked ? "Користувача розблоковано" : "Користувача заблоковано",
      );
    } catch (error) {
      console.error("Update admin user error:", error);
      toast.error(error?.message || "Не вдалося змінити статус користувача");
    } finally {
      setActionUserId(null);
    }
  };

  useEffect(() => {
    if (!userId) {
      setSelectedUser(null);
      setSelectedBookId(null);
      return;
    }

    const loadUserDetails = async () => {
      try {
        setIsDetailsLoading(true);

        const userDetails = await getAdminUserById(userId);

        setSelectedUser(userDetails);
        setSelectedBookId(null);
        setBookFilter("ALL");
        setActivityFilter("ALL");
      } catch (error) {
        console.error("Load admin user details error:", error);
        toast.error(error?.message || "Не вдалося завантажити дані користувача");
        navigate("/admin/users", { replace: true });
      } finally {
        setIsDetailsLoading(false);
      }
    };

    loadUserDetails();
  }, [userId, navigate]);

  const handleOpenUserDetails = (user) => {
    const slug = createUserSlug(user.name);
    navigate(`/admin/users/${slug}/${user.id}`);
  };

  const handleCloseUserDetails = () => {
    navigate("/admin/users");
  };

  const handleSelectBook = (bookId) => {
    setSelectedBookId(bookId);
    setActivityFilter("ALL");
  };

  const handleBackToBooks = () => {
    setSelectedBookId(null);
  };

  const filteredBooks = useMemo(() => {
    const books = selectedUser?.books ?? [];

    if (bookFilter === "ALL") {
      return books;
    }

    if (bookFilter === "WISHLIST") {
      return books.filter((book) => book.isWishlist);
    }

    return books.filter(
      (book) => !book.isWishlist && book.status === bookFilter,
    );
  }, [selectedUser, bookFilter]);

  const selectedBook = useMemo(
    () =>
      selectedUser?.books?.find(
        (userBook) => userBook.book?.id === selectedBookId,
      ) ?? null,
    [selectedUser, selectedBookId],
  );

  const bookCounts = useMemo(() => {
    const books = selectedUser?.books ?? [];

    return {
      ALL: books.length,
      READING: books.filter(
        (book) => !book.isWishlist && book.status === "READING",
      ).length,
      FINISHED: books.filter(
        (book) => !book.isWishlist && book.status === "FINISHED",
      ).length,
      WISHLIST: books.filter((book) => book.isWishlist).length,
      NOT_STARTED: books.filter(
        (book) => !book.isWishlist && book.status === "NOT_STARTED",
      ).length,
    };
  }, [selectedUser]);

  const totalReadingSeconds = useMemo(
    () =>
      (selectedUser?.readingSessions ?? []).reduce(
        (total, session) => total + (Number(session.durationSeconds) || 0),
        0,
      ),
    [selectedUser],
  );

  const lastActivityDate = useMemo(() => {
    const dates = [
      ...(selectedUser?.activityLogs ?? []).map((item) => item.createdAt),
      ...(selectedUser?.readingSessions ?? []).map((item) => item.startedAt),
      ...(selectedUser?.libraryBookEvents ?? []).map(
        (item) => item.occurredAt,
      ),
    ]
      .filter(Boolean)
      .map((date) => new Date(date));

    if (!dates.length) {
      return null;
    }

    return new Date(Math.max(...dates.map((date) => date.getTime())));
  }, [selectedUser]);

  const timeline = useMemo(() => {
    if (!selectedUser) {
      return [];
    }

    const selectedBookId = selectedBook?.book?.id ?? null;

    const sessions = (selectedUser.readingSessions ?? [])
      .filter(
        (session) =>
          !selectedBookId || session.bookId === selectedBookId,
      )
      .map((session) => ({
        id: `session-${session.id}`,
        category: "SESSION",
        createdAt: session.startedAt,
        session,
      }));

    const activities = (selectedUser.activityLogs ?? [])
      .filter(
        (activity) =>
          !selectedBookId || activity.bookId === selectedBookId,
      )
      .map((activity) => ({
        id: `activity-${activity.id}`,
        category: activity.type,
        createdAt: activity.createdAt,
        activity,
      }));

    const libraryEvents = (selectedUser.libraryBookEvents ?? [])
      .filter(
        (event) =>
          !selectedBookId || event.bookId === selectedBookId,
      )
      .map((event) => ({
        id: `library-event-${event.id}`,
        category: event.type,
        createdAt: event.occurredAt,
        libraryEvent: event,
      }));

    const items = [
      ...sessions,
      ...activities,
      ...libraryEvents,
    ];

    return items
      .filter((item) => {
        if (activityFilter === "ALL") {
          return true;
        }

        if (activityFilter === "SESSIONS") {
          return item.category === "SESSION";
        }

        if (activityFilter === "STATUS") {
          return item.category === "STATUS_CHANGED";
        }

        return true;
      })
      .sort(
        (a, b) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
      );
  }, [selectedBook, selectedUser, activityFilter]);

  const getTimelineContent = (item) => {
    if (item.category === "SESSION") {
      const session = item.session;

      const progressText =
        session.progressMode === "PERCENT"
          ? `Прогрес ${session.startPercent ?? 0}% → ${
              session.endPercent ?? 0
            }%`
          : `Прочитано ${session.startPage ?? 0} → ${
              session.endPage ?? 0
            } стор.`;

      return {
        icon: "▶",
        type: "session",
        title: "Сесія читання",
        description: `${formatDuration(
          session.durationSeconds,
        )} · ${progressText}`,
      };
    }

    if (item.category === "STATUS_CHANGED") {
      const activity = item.activity;

      return {
        icon: "▣",
        type: "status",
        title: "Змінено статус",
        description: `${
          STATUS_LABELS[activity.oldValue] ?? activity.oldValue ?? "—"
        } → ${STATUS_LABELS[activity.newValue] ?? activity.newValue ?? "—"}`,
      };
    }

    if (item.category === "PROGRESS_CHANGED") {
      return {
        icon: "↗",
        type: "progress",
        title: "Змінено прогрес",
        description: `${item.activity.oldValue ?? "0"} → ${
          item.activity.newValue ?? "0"
        }`,
      };
    }

    if (item.category === "PROGRESS_RESET") {
      return {
        icon: "↺",
        type: "progress",
        title: "Скинуто прогрес",
        description: `${item.activity.oldValue ?? "0"} → 0`,
      };
    }

    if (item.category === "RATING_CHANGED") {
      return {
        icon: "★",
        type: "rating",
        title: "Змінено рейтинг",
        description: `${item.activity.oldValue ?? "—"} → ${
          item.activity.newValue ?? "—"
        }`,
      };
    }

    if (item.category === "WISHLIST_CHANGED") {
      const added = item.activity.newValue === "true";

      return {
        icon: "♡",
        type: "wishlist",
        title: added
          ? "Додано до «Хочу прочитати»"
          : "Прибрано з «Хочу прочитати»",
        description: "",
      };
    }

    if (item.category === "BOOK_ADDED") {
      const libraryName =
        item.libraryEvent?.library?.name || "Бібліотека";

      return {
        icon: "+",
        type: "added",
        title: "Додано книгу до бібліотеки",
        description: `${selectedUser?.name || "Користувач"} · ${libraryName}`,
      };
    }

    return {
      icon: "•",
      type: "default",
      title: item.category,
      description: "",
    };
  };

  if (isLoading) {
    return (
      <section className="admin-users-page">
        <p className="admin-users-page__message">
          Завантаження користувачів...
        </p>
      </section>
    );
  }

  return (
    <section className="admin-users-page">
      <div className="admin-users-page__header">
        <div>
          <h1 className="admin-users-page__title">Адміністрування</h1>

          <p className="admin-users-page__subtitle">
            Зареєстровані користувачі бібліотеки
          </p>
        </div>

        <span className="admin-users-page__count">{users.length}</span>
      </div>

      <div className="admin-users-page__list">
        {users.map((user) => {
          const isCurrentUser = user.id === currentUser?.id;
          const isActionLoading = actionUserId === user.id;

          return (
            <article key={user.id} className="admin-user-card">
              <div className="admin-user-card__main">
                <div className="admin-user-card__avatar">
                  {user.avatarUrl ? (
                    <img src={user.avatarUrl} alt={user.name || "Користувач"} />
                  ) : (
                    <span>
                      {(user.name || user.email || "?").charAt(0).toUpperCase()}
                    </span>
                  )}
                </div>

                <div className="admin-user-card__info">
                  <div className="admin-user-card__name-row">
                    <h2 className="admin-user-card__name">
                      {user.name || "Без імені"}
                    </h2>

                    {user.role === "ADMIN" && (
                      <span className="admin-user-card__role">ADMIN</span>
                    )}
                  </div>

                  <p className="admin-user-card__email">{user.email}</p>
                </div>
              </div>

              <div className="admin-user-card__meta">
                <div className="admin-user-card__meta-item">
                  <span>Реєстрація</span>
                  <strong>{formatDate(user.createdAt)}</strong>
                </div>

                <div className="admin-user-card__meta-item">
                  <span>Книг</span>

                  <button
                    type="button"
                    className="admin-user-card__books-button"
                    onClick={() => handleOpenUserDetails(user)}
                    disabled={isDetailsLoading}
                  >
                    {user._count?.books ?? 0}
                  </button>
                </div>

                <div className="admin-user-card__meta-item">
                  <span>Статус</span>

                  <strong
                    className={
                      user.isBlocked
                        ? "admin-user-card__status admin-user-card__status--blocked"
                        : "admin-user-card__status admin-user-card__status--active"
                    }
                  >
                    {user.isBlocked ? "Заблокований" : "Активний"}
                  </strong>
                </div>
              </div>

              <div className="admin-user-card__actions">
                <button
                  type="button"
                  className={
                    user.isBlocked
                      ? "admin-user-card__button admin-user-card__button--unblock"
                      : "admin-user-card__button admin-user-card__button--block"
                  }
                  onClick={() => handleToggleBlocked(user)}
                  disabled={isCurrentUser || isActionLoading}
                >
                  {isActionLoading
                    ? "Збереження..."
                    : user.isBlocked
                      ? "Розблокувати"
                      : "Заблокувати"}
                </button>

                {isCurrentUser && (
                  <span className="admin-user-card__self">Ваш акаунт</span>
                )}
              </div>
            </article>
          );
        })}
      </div>

      <Modal
        isOpen={Boolean(selectedUser)}
        onClose={handleCloseUserDetails}
        showHeader={true}
        className="admin-library-modal"
      >
        {selectedUser && (
          <div className="admin-library">
            <aside
              className={
                selectedBook
                  ? "admin-library__sidebar admin-library__sidebar--book-open"
                  : "admin-library__sidebar"
              }
            >
              <div className="admin-library__user">
                <div className="admin-library__user-avatar">
                  {selectedUser.avatarUrl ? (
                    <img
                      src={selectedUser.avatarUrl}
                      alt={selectedUser.name || "Користувач"}
                    />
                  ) : (
                    <span>
                      {(selectedUser.name || selectedUser.email || "?")
                        .charAt(0)
                        .toUpperCase()}
                    </span>
                  )}
                </div>

                <div className="admin-library__user-info">
                  <h2>{selectedUser.name || "Без імені"}</h2>
                  <p>{selectedUser.email}</p>
                  <span>Користувач з {formatDate(selectedUser.createdAt)}</span>
                </div>
              </div>

              <div className="admin-library__stats">
                <div>
                  <strong>{selectedUser.books?.length ?? 0}</strong>
                  <span>книг</span>
                </div>

                <div>
                  <strong>{selectedUser.readingSessions?.length ?? 0}</strong>
                  <span>сесій</span>
                </div>

                <div>
                  <strong>{formatDuration(totalReadingSeconds)}</strong>
                  <span>читання</span>
                </div>

                <div>
                  <strong>{formatShortDate(lastActivityDate)}</strong>
                  <span>остання активність</span>
                </div>
              </div>

              <div className="admin-library__filters">
                {BOOK_FILTERS.map((filter) => (
                  <button
                    key={filter.value}
                    type="button"
                    className={
                      bookFilter === filter.value
                        ? "admin-library__filter admin-library__filter--active"
                        : "admin-library__filter"
                    }
                    onClick={() => setBookFilter(filter.value)}
                  >
                    {filter.label} {bookCounts[filter.value]}
                  </button>
                ))}
              </div>

              <div className="admin-library__books">
                {filteredBooks.map((userBook) => {
                  const isSelected = selectedBookId === userBook.book?.id;

                  return (
                    <button
                      key={userBook.id}
                      type="button"
                      className={
                        isSelected
                          ? "admin-library-book admin-library-book--selected"
                          : "admin-library-book"
                      }
                      onClick={() => handleSelectBook(userBook.book?.id)}
                    >
                      <div className="admin-library-book__cover">
                        {userBook.book?.coverUrl ? (
                          <img
                            src={userBook.book.coverUrl}
                            alt={userBook.book?.title || "Книга"}
                          />
                        ) : (
                          <span>📖</span>
                        )}
                      </div>

                      <div className="admin-library-book__body">
                        <strong>{userBook.book?.title || "Без назви"}</strong>

                        <span>
                          {userBook.book?.author || "Автор не вказаний"}
                        </span>

                        <div className="admin-library-book__bottom">
                          <span
                            className={`admin-library-book__status admin-library-book__status--${userBook.status?.toLowerCase()}`}
                          >
                            {getBookStatusLabel(userBook)}
                          </span>

                          <span>{getProgressLabel(userBook)}</span>
                        </div>
                      </div>

                      <span className="admin-library-book__arrow">›</span>
                    </button>
                  );
                })}
              </div>
            </aside>

            <section
              className={
                selectedBook
                  ? "admin-book-history admin-book-history--open"
                  : "admin-book-history"
              }
            >

              {selectedBook ? (
                <>
                  <button
                    type="button"
                    className="admin-book-history__back"
                    onClick={handleBackToBooks}
                  >
                    ← До книг
                  </button>

                  <div className="admin-book-history__header">
                    <div className="admin-book-history__cover">
                      {selectedBook.book?.coverUrl ? (
                        <img
                          src={selectedBook.book.coverUrl}
                          alt={selectedBook.book?.title || "Книга"}
                        />
                      ) : (
                        <span>📖</span>
                      )}
                    </div>

                    <div className="admin-book-history__info">
                      <h2>{selectedBook.book?.title || "Без назви"}</h2>

                      <p>{selectedBook.book?.author || "Автор не вказаний"}</p>

                      <span className="admin-book-history__status">
                        {getBookStatusLabel(selectedBook)}
                      </span>

                      <strong>
                        {getProgressLabel(selectedBook)} (
                        {getProgress(selectedBook)}%)
                      </strong>

                      <div className="admin-book-history__progress">
                        <span
                          style={{
                            width: `${getProgress(selectedBook)}%`,
                          }}
                        />
                      </div>
                    </div>
                  </div>

                  <div className="admin-book-history__tabs">
                    {ACTIVITY_FILTERS.map((filter) => (
                      <button
                        key={filter.value}
                        type="button"
                        className={
                          activityFilter === filter.value
                            ? "admin-book-history__tab admin-book-history__tab--active"
                            : "admin-book-history__tab"
                        }
                        onClick={() => setActivityFilter(filter.value)}
                      >
                        {filter.label}
                      </button>
                    ))}
                  </div>

                  <div className="admin-book-history__title-row">
                    <h3>Хронологія</h3>
                    <span>{timeline.length} подій</span>
                  </div>

                  <div className="admin-timeline">
                    {timeline.length ? (
                      timeline.map((item) => {
                        const content = getTimelineContent(item);

                        return (
                          <article
                            key={item.id}
                            className="admin-timeline__item"
                          >
                            <div className="admin-timeline__rail">
                              <span
                                className={`admin-timeline__icon admin-timeline__icon--${content.type}`}
                              >
                                {content.icon}
                              </span>
                            </div>

                            <div className="admin-timeline__content">
                              <time>{formatDateTime(item.createdAt)}</time>

                              <strong>{content.title}</strong>

                              {content.description && (
                                <p>{content.description}</p>
                              )}
                            </div>
                          </article>
                        );
                      })
                    ) : (
                      <p className="admin-book-history__empty-message">
                        Для цієї книги історії поки немає.
                      </p>
                    )}
                  </div>
                </>
              ) : (
                <>
  <div className="admin-book-history__title-row">
    <div>
      <h3>Історія користувача</h3>
      <span>Уся активність</span>
    </div>

    <span>{timeline.length} подій</span>
  </div>

  <div className="admin-book-history__tabs">
    {ACTIVITY_FILTERS.map((filter) => (
      <button
        key={filter.value}
        type="button"
        className={
          activityFilter === filter.value
            ? "admin-book-history__tab admin-book-history__tab--active"
            : "admin-book-history__tab"
        }
        onClick={() => setActivityFilter(filter.value)}
      >
        {filter.label}
      </button>
    ))}
  </div>

  <div className="admin-timeline">
    {timeline.length ? (
      timeline.map((item) => {
        const content = getTimelineContent(item);

        return (
          <article
            key={item.id}
            className="admin-timeline__item"
          >
            <div className="admin-timeline__rail">
              <span
                className={`admin-timeline__icon admin-timeline__icon--${content.type}`}
              >
                {content.icon}
              </span>
            </div>

            <div className="admin-timeline__content">
              <time>{formatDateTime(item.createdAt)}</time>

              <strong>{content.title}</strong>

              {content.description && (
                <p>{content.description}</p>
              )}
            </div>
          </article>
        );
      })
    ) : (
      <p className="admin-book-history__empty-message">
        Історії користувача поки немає.
      </p>
    )}
  </div>
</>
              )}
            </section>
          </div>
        )}
      </Modal>
    </section>
  );
};

export default AdminUsersPage;
