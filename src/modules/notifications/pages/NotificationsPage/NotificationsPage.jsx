import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import AppPanel from "../../../../shared/components/AppPanel/AppPanel.jsx";
import PageBackButton from "../../../../shared/components/PageBackButton/PageBackButton.jsx";
import SocialBookModal from "../../../home/components/SocialFeed/components/SocialBookModal/SocialBookModal.jsx";

import { useNotifications } from "../../context/NotificationsContext.jsx";

import "./NotificationsPage.css";

const NotificationsPage = () => {
  const [selectedBook, setSelectedBook] = useState(null);
  const [isSelectionMode, setIsSelectionMode] = useState(false);
  const [selectedNotificationIds, setSelectedNotificationIds] = useState([]);
  const navigate = useNavigate();

  const {
    notifications,
    unreadCount,
    isNotificationsLoading,
    notificationsError,
    refreshNotifications,
    markAsRead,
    markAllAsRead,
    deleteNotifications,
  } = useNotifications();

  useEffect(() => {
    refreshNotifications();
  }, [refreshNotifications]);

  const formatTime = (value) => {
    const date = new Date(value);

    return date.toLocaleString("uk-UA", {
      day: "2-digit",
      month: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const handleOpenNotification = async (notification) => {
    if (!notification.isRead) {
      await markAsRead(notification.id);
    }
    if (notification.type === "KUDOS_RECEIVED" && notification.activity?.id) {
      const activityId = notification.activity.id;
      navigate(`/community?activityId=${activityId}`);
      return;
    }

    if (notification.type === "LIBRARY_BOOK_ADDED" && notification.book?.id) {
      navigate(`/catalog?bookId=${notification.book.id}`);
      return;
    }

    if (
      notification.type === "SOCIAL_ACTIVITY" &&
      ["READING_STARTED", "BOOK_FINISHED", "RATING_ADDED"].includes(
        notification.activity?.type,
      ) &&
      notification.book?.id
    ) {
      setSelectedBook(notification.book);
      return;
    }

    if (
      notification.type === "SOCIAL_ACTIVITY" &&
      notification.activity?.type === "ACHIEVEMENT_UNLOCKED" &&
      notification.actor?.id
    ) {
      navigate(`/users/${notification.actor.id}/achievements`);
      return;
    }

    if (notification.actor?.id) {
      navigate(`/users/${notification.actor.id}`);
    }
  };

  const areAllNotificationsSelected = notifications.length > 0 && selectedNotificationIds.length === notifications.length;

  const selectAllNotifications = () => {
    setSelectedNotificationIds(areAllNotificationsSelected ? [] : notifications.map((notification) => notification.id));
  };

  const toggleNotificationSelection = (notificationId) => {
    setSelectedNotificationIds((current) =>
      current.includes(notificationId)
        ? current.filter((id) => id !== notificationId)
        : [...current, notificationId],
    );
  };

  const handleDeleteSelectedNotifications = async () => {
    if (selectedNotificationIds.length === 0) return;
    await deleteNotifications(selectedNotificationIds);
    setSelectedNotificationIds([]);
    setIsSelectionMode(false);
  };

  const handleDeleteNotification = async (event, notificationId) => {
    event.stopPropagation();
    await deleteNotifications([notificationId]);
  };

  const renderLibraryBookNotification = (notification) => {
    const actorName = notification.actor?.name || "Користувач";
    const book = notification.book;

    return (
      <AppPanel
        as="div"
        variant="secondary"
        clickable
        key={notification.id}
        type="button"
        className={
          notification.isRead
            ? `activity-notification${isSelectionMode ? " activity-notification--selecting" : ""}`
            : `activity-notification activity-notification--unread${isSelectionMode ? " activity-notification--selecting" : ""}`
        }
        onClick={() => isSelectionMode ? toggleNotificationSelection(notification.id) : handleOpenNotification(notification)}
      >
        {isSelectionMode && <input type="checkbox" className="notification-select-checkbox" checked={selectedNotificationIds.includes(notification.id)} onChange={() => toggleNotificationSelection(notification.id)} onClick={(event) => event.stopPropagation()} aria-label="вибрати сповіщення" />}
        <div className="activity-notification__top">
          <div className="activity-notification__actor">
            <div className="activity-notification__avatar">
              {notification.actor?.avatarUrl ? (
                <img src={notification.actor.avatarUrl} alt={actorName} />
              ) : (
                <span>{actorName.charAt(0).toUpperCase()}</span>
              )}
            </div>

            <div className="activity-notification__actor-text">
              <strong>{actorName}</strong>

              <span>додав книгу · {formatTime(notification.createdAt)}</span>
            </div>
          </div>

          {!notification.isRead && (
            <span className="activity-notification__dot" />
          )}
        </div>

        <div className="activity-notification__book">
          <div className="activity-notification__cover">
            {book?.coverUrl ? (
              <img src={book.coverUrl} alt={book.title || "Книга"} />
            ) : (
              <span>📚</span>
            )}
          </div>

          <div className="activity-notification__book-content">
            <span className="activity-notification__label">
              Нова книга у бібліотеці
            </span>

            <h2>{book?.title || "Нова книга"}</h2>

            {book?.author && <p>{book.author}</p>}

            <div className="activity-notification__library">
              <span className="activity-notification__library-icon">📖</span>
              <span>Домашня бібліотека</span>
            </div>
          </div>

          <button
            type="button"
            className="notification-delete"
            onClick={(event) =>
              handleDeleteNotification(event, notification.id)
            }
            aria-label="Видалити сповіщення"
          >
            🗑️
          </button>

          <span className="activity-notification__arrow" aria-hidden="true">
            ›
          </span>
        </div>
      </AppPanel>
    );
  };

  const getKudosActivityText = (notification) => {
    const activity = notification.activity;
    const bookTitle = activity?.book?.title;

    switch (activity?.type) {
      case "READING_STARTED":
        return bookTitle
          ? `Ви почали читати «${bookTitle}»`
          : "Ви почали читати книгу";

      case "BOOK_FINISHED":
        return bookTitle ? `Ви прочитали «${bookTitle}»` : "Ви прочитали книгу";

      case "RATING_ADDED":
        return bookTitle
          ? `Ви оцінили «${bookTitle}» на ${activity.rating ?? 0}/5`
          : `Ви оцінили книгу на ${activity.rating ?? 0}/5`;

      case "ACHIEVEMENT_UNLOCKED":
        return "Ви отримали досягнення";

      default:
        return "Ваша активність";
    }
  };

  const renderSocialNotification = (notification) => {
    const actorName = notification.actor?.name || "Користувач";

    const getNotificationText = () => {
      if (notification.type === "KUDOS_RECEIVED") {
        switch (notification.activity?.type) {
          case "READING_STARTED":
            return "підтримав початок читання";

          case "BOOK_FINISHED":
            return "підтримав завершення книги";

          case "RATING_ADDED":
            return "підтримав вашу оцінку";

          case "ACHIEVEMENT_UNLOCKED":
            return "підтримав ваше досягнення";

          default:
            return "підтримав вашу активність";
        }
      }

      if (notification.type === "NEW_FOLLOWER") {
        return "підписався на вас";
      }

      if (notification.type === "SOCIAL_ACTIVITY") {
        switch (notification.activity?.type) {
          case "READING_STARTED":
            return "почав читати книгу";

          case "BOOK_FINISHED":
            return "прочитав книгу";

          case "RATING_ADDED":
            return notification.activity?.rating
              ? `оцінив книгу на ${notification.activity.rating}/5`
              : "оцінив книгу";

          case "ACHIEVEMENT_UNLOCKED":
            return "отримав нове досягнення";

          default:
            return "опублікував нову активність";
        }
      }

      return "має нове сповіщення";
    };

    const text = getNotificationText();

    const kudosActivityText =
      notification.type === "KUDOS_RECEIVED"
        ? getKudosActivityText(notification)
        : null;

    return (
      <AppPanel
        as="div"
        variant="secondary"
        clickable
        key={notification.id}
        type="button"
        className={
          notification.isRead
            ? `social-notification${isSelectionMode ? " social-notification--selecting" : ""}`
            : `social-notification social-notification--unread${isSelectionMode ? " social-notification--selecting" : ""}`
        }
        onClick={() => isSelectionMode ? toggleNotificationSelection(notification.id) : handleOpenNotification(notification)}
      >
        {isSelectionMode && <input type="checkbox" className="notification-select-checkbox" checked={selectedNotificationIds.includes(notification.id)} onChange={() => toggleNotificationSelection(notification.id)} onClick={(event) => event.stopPropagation()} aria-label="вибрати сповіщення" />}
        <div className="social-notification__avatar">
          {notification.actor?.avatarUrl ? (
            <img src={notification.actor.avatarUrl} alt={actorName} />
          ) : (
            <span>{actorName.charAt(0).toUpperCase()}</span>
          )}
        </div>

        <div className="social-notification__content">
          <div>
            <strong>{actorName}</strong> <span>{text}</span>
          </div>

          {notification.book?.title && (
            <span className="social-notification__book-title">
              «{notification.book.title}»
            </span>
          )}

          {kudosActivityText && (
            <span className="social-notification__book-title">
              {kudosActivityText}
            </span>
          )}

          {notification.achievement && (
            <div className="social-notification__achievement">
              <strong>{notification.achievement.title}</strong>

              <span>{notification.achievement.description}</span>
            </div>
          )}

          <small>{formatTime(notification.createdAt)}</small>
        </div>

        {!notification.isRead && <span className="social-notification__dot" />}
        <button
          type="button"
          className="notification-delete"
          onClick={(event) => handleDeleteNotification(event, notification.id)}
          aria-label="Видалити сповіщення"
        >
          🗑️
        </button>

      </AppPanel>
    );
  };

  return (
    <main className="notifications-page">
      <div className="notifications-page__container">
        <PageBackButton label="Сповіщення" />

        <header className="notifications-page__header">
          <div>
            <h1>Сповіщення</h1>

            <p>
              {unreadCount > 0
                ? `${unreadCount} непрочитаних`
                : "Усі прочитані"}
            </p>
          </div>

          <div className="notifications-page__actions">
            <button type="button" className="notifications-page__select" onClick={() => { setIsSelectionMode((current) => !current); setSelectedNotificationIds([]); }}>
              {isSelectionMode ? "Скасувати" : "Вибрати"}
            </button>

            {isSelectionMode && (
              <button type="button" className="notifications-page__select-all" onClick={selectAllNotifications}>
                {areAllNotificationsSelected ? "Зняти вибір" : "Вибрати все"}
              </button>
            )}

            {isSelectionMode && selectedNotificationIds.length > 0 && (
              <button type="button" className="notifications-page__delete-selected" onClick={handleDeleteSelectedNotifications} disabled={selectedNotificationIds.length === 0}>
                Видалити ({selectedNotificationIds.length})
              </button>
            )}

          {unreadCount > 0 && (
            <button
              type="button"
              className="notifications-page__read-all"
              onClick={markAllAsRead}
            >
              Позначити всі прочитаними
            </button>
          )}
          </div>
        </header>

        {isNotificationsLoading && (
          <AppPanel variant="secondary" className="notifications-page__state">
            Завантажуємо сповіщення...
          </AppPanel>
        )}

        {!isNotificationsLoading && notificationsError && (
          <AppPanel variant="secondary" className="notifications-page__state">
            {notificationsError}
          </AppPanel>
        )}

        {!isNotificationsLoading &&
          !notificationsError &&
          notifications.length === 0 && (
            <AppPanel variant="secondary" className="notifications-page__state">
              Сповіщень поки немає
            </AppPanel>
          )}

        {!isNotificationsLoading &&
          !notificationsError &&
          notifications.length > 0 && (
            <div className="notifications-feed">
              {notifications.map((notification) =>
                notification.type === "LIBRARY_BOOK_ADDED"
                  ? renderLibraryBookNotification(notification)
                  : renderSocialNotification(notification),
              )}
            </div>
          )}
      </div>
      <SocialBookModal
        book={selectedBook}
        onClose={() => setSelectedBook(null)}
        onOpenCatalog={(book) => {
          setSelectedBook(null);

          if (book?.id) {
            navigate(`/catalog?bookId=${book.id}`);
          }
        }}
      />
    </main>
  );
};

export default NotificationsPage;
