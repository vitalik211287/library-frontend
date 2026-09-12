import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

import { useNotifications } from "../../context/NotificationsContext.jsx";

import "./NotificationsPage.css";

const NotificationsPage = () => {
  const navigate = useNavigate();

  const {
    notifications,
    unreadCount,
    isNotificationsLoading,
    notificationsError,
    refreshNotifications,
    markAsRead,
    markAllAsRead,
  } = useNotifications();

  useEffect(() => {
    refreshNotifications();
  }, [refreshNotifications]);

  const handleOpenNotification = async (notification) => {
    if (!notification.isRead) {
      await markAsRead(notification.id);
    }

    if (notification.type === "LIBRARY_BOOK_ADDED") {
      return;
    }

    if (notification.actor?.id) {
      navigate(`/users/${notification.actor.id}`);
    }
  };

  const getNotificationText = (notification) => {
    const actorName = notification.actor?.name || "Користувач";

    if (notification.type === "KUDOS_RECEIVED") {
      return `${actorName} підтримав ваше досягнення`;
    }

    if (notification.type === "NEW_FOLLOWER") {
      return `${actorName} підписався на вас`;
    }

    if (notification.type === "LIBRARY_BOOK_ADDED") {
      return `${actorName} додав книгу до спільної бібліотеки`;
    }

    return "Нове сповіщення";
  };

  return (
    <main className="notifications-page">
      <div className="notifications-page__container">
        <header className="notifications-page__header">
          <div>
            <h1>Сповіщення</h1>
            <p>
              {unreadCount > 0
                ? `${unreadCount} непрочитаних`
                : "Усі прочитані"}
            </p>
          </div>

          {unreadCount > 0 && (
            <button
              type="button"
              className="notifications-page__read-all"
              onClick={markAllAsRead}
            >
              Позначити всі прочитаними
            </button>
          )}
        </header>

        {isNotificationsLoading && (
          <div className="notifications-page__state">
            Завантажуємо сповіщення...
          </div>
        )}

        {!isNotificationsLoading && notificationsError && (
          <div className="notifications-page__state">
            {notificationsError}
          </div>
        )}

        {!isNotificationsLoading &&
          !notificationsError &&
          notifications.length === 0 && (
            <div className="notifications-page__state">
              Сповіщень поки немає
            </div>
          )}

        {!isNotificationsLoading &&
          !notificationsError &&
          notifications.length > 0 && (
            <div className="notifications-list">
              {notifications.map((notification) => {
                const actorName =
                  notification.actor?.name || "Користувач";

                return (
                  <button
                    key={notification.id}
                    type="button"
                    className={
                      notification.isRead
                        ? "notification-card"
                        : "notification-card notification-card--unread"
                    }
                    onClick={() =>
                      handleOpenNotification(notification)
                    }
                  >
                    <div className="notification-card__avatar">
                      {notification.actor?.avatarUrl ? (
                        <img
                          src={notification.actor.avatarUrl}
                          alt={actorName}
                        />
                      ) : (
                        <span>
                          {actorName.charAt(0).toUpperCase()}
                        </span>
                      )}
                    </div>

                    <div className="notification-card__content">
                      <strong>
                        {getNotificationText(notification)}
                      </strong>

                      {notification.scope === "LIBRARY" && (
                        <small className="notification-card__scope">
                          Бібліотека
                        </small>
                      )}

                      <span>
                        {new Date(
                          notification.createdAt,
                        ).toLocaleString("uk-UA")}
                      </span>
                    </div>

                    {!notification.isRead && (
                      <span
                        className="notification-card__dot"
                        aria-label="Непрочитане"
                      />
                    )}
                  </button>
                );
              })}
            </div>
          )}
      </div>
    </main>
  );
};

export default NotificationsPage;
