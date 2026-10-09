import { useCallback, useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";

import { apiFetch } from "../../../../shared/api/apiClient.js";
import { socket } from "../../../../shared/realtime/socket.js";
import Icon from "../../../../shared/components/Icon/Icon.jsx";
import ConfirmDeleteModal from "../../../../shared/components/ConfirmDeleteModal/ConfirmDeleteModal.jsx";
import LoadMoreButton from "../../../../shared/components/LoadMoreButton/LoadMoreButton.jsx";
import ScrollToTopButton from "../../../../shared/components/ScrollToTopButton/ScrollToTopButton.jsx";


import SocialFeedMenu from "./components/SocialFeedMenu/SocialFeedMenu.jsx";
import SocialFeedCard from "./components/SocialFeedCard/SocialFeedCard.jsx";
import SocialPostCard from "./components/SocialPostCard/SocialPostCard.jsx";
import SocialPostComposer from "./components/SocialPostComposer/SocialPostComposer.jsx";
import SocialPostThreadModal from "./components/SocialPostThreadModal/SocialPostThreadModal.jsx";
import SocialBookModal from "./components/SocialBookModal/SocialBookModal.jsx";
import "./SocialFeed.css";
import KudosUsersModal from "./components/KudosUsersModal/KudosUsersModal.jsx";

const activityDateFormatter = new Intl.DateTimeFormat("uk-UA", {
  day: "2-digit",
  month: "2-digit",
  hour: "2-digit",
  minute: "2-digit",
});

const FEED_PAGE_SIZE = 20;

const SocialFeed = ({
  limit = null,
  showViewAll = false,
  scope = "following",
  showHeader = true,
  showComposer = true,
  userId = null,
  contentFilter = null,
}) => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const linkedActivityId = searchParams.get("activityId");
  const linkedPostId = searchParams.get("postId");
  const linkedThreadActivityId = searchParams.get("threadActivityId");

  const [activities, setActivities] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [menuActivity, setMenuActivity] = useState(null);
  const [selectedBook, setSelectedBook] = useState(null);
  const [kudosUsersItem, setKudosUsersItem] = useState(null);
  const [postToDelete, setPostToDelete] = useState(null);
  const [isDeletingPost, setIsDeletingPost] = useState(false);
  const [isUnfollowing, setIsUnfollowing] = useState(false);
  const [notifyActivity, setNotifyActivity] = useState(false);
  const [isUpdatingNotifications, setIsUpdatingNotifications] = useState(false);

  useEffect(() => {
    let isActive = true;

    const loadFeed = async () => {
      try {
        setIsLoading(true);

        const params = new URLSearchParams({
          scope,
          page: "1",
          limit: String(FEED_PAGE_SIZE),
        });

        if (userId) {
          params.set("userId", userId);
        }

        const data = await apiFetch(`/api/social/feed?${params.toString()}`);

        if (isActive) {
          setActivities(Array.isArray(data?.activities) ? data.activities : []);
          setPage(1);
          setHasMore(Boolean(data?.hasMore));
        }
      } catch (error) {
        console.error("Load social feed error:", error);

        if (isActive) {
          setActivities([]);
        }
      } finally {
        if (isActive) {
          setIsLoading(false);
        }
      }
    };

    loadFeed();

    return () => {
      isActive = false;
    };
  }, [scope, userId]);

  useEffect(() => {
    const handlePostKudosUpdated = ({ postId, kudosCount }) => {
      setActivities((current) =>
        current.map((item) =>
          item.id === postId ? { ...item, kudosCount } : item,
        ),
      );
    };

    const handlePostCommentsUpdated = ({ postId, commentsCount }) => {
      setActivities((current) =>
        current.map((item) =>
          item.id === postId
            ? { ...item, repliesCount: commentsCount }
            : item,
        ),
      );
    };

    const handleActivityCommentsUpdated = ({
      activityId,
      commentsCount,
    }) => {
      setActivities((current) =>
        current.map((item) =>
          item.id === activityId
            ? { ...item, commentsCount }
            : item,
        ),
      );
    };

    socket.on("post:kudos-updated", handlePostKudosUpdated);
    socket.on("post:comments-updated", handlePostCommentsUpdated);
    socket.on("activity:comments-updated", handleActivityCommentsUpdated);

    return () => {
      socket.off("post:kudos-updated", handlePostKudosUpdated);
      socket.off("post:comments-updated", handlePostCommentsUpdated);
      socket.off("activity:comments-updated", handleActivityCommentsUpdated);
    };
  }, []);

  useEffect(() => {
    if (!linkedActivityId || isLoading) {
      return;
    }

    requestAnimationFrame(() => {
      document.getElementById(`activity-${linkedActivityId}`)?.scrollIntoView({
        behavior: "smooth",
        block: "center",
      });
    });
  }, [linkedActivityId, isLoading, activities]);

  const handleLoadMore = useCallback(async () => {
    if (isLoadingMore || !hasMore) {
      return;
    }

    const nextPage = page + 1;

    try {
      setIsLoadingMore(true);

      const params = new URLSearchParams({
        scope,
        page: String(nextPage),
        limit: String(FEED_PAGE_SIZE),
      });

      if (userId) {
        params.set("userId", userId);
      }

      const data = await apiFetch(`/api/social/feed?${params.toString()}`);

      const nextActivities = Array.isArray(data?.activities)
        ? data.activities
        : [];

      setActivities((current) => [...current, ...nextActivities]);
      setPage(nextPage);
      setHasMore(Boolean(data?.hasMore));
    } catch (error) {
      console.error("Load more social feed error:", error);
    } finally {
      setIsLoadingMore(false);
    }
  }, [hasMore, isLoadingMore, page, scope, userId]);

  const handleOpenProfile = useCallback(
    (userId) => {
      if (userId) {
        navigate(`/users/${userId}`);
      }
    },
    [navigate],
  );

  const handleOpenBook = useCallback((book) => {
    if (book?.id) {
      setSelectedBook(book);
    }
  }, []);

  const handleOpenThread = useCallback(
    (post) => {
      if (!post?.id) {
        return;
      }

      const params = new URLSearchParams(searchParams);
      params.set("postId", post.id);

      navigate(`/community?${params.toString()}`);
    },
    [navigate, searchParams],
  );

  const handleOpenActivityThread = useCallback(
    (activity) => {
      if (!activity?.id) {
        return;
      }

      const params = new URLSearchParams(searchParams);
      params.set("threadActivityId", activity.id);

      navigate(`/community?${params.toString()}`);
    },
    [navigate, searchParams],
  );

  const handleCloseThread = useCallback(() => {
    const params = new URLSearchParams(searchParams);
    params.delete("postId");
    params.delete("threadActivityId");

    const query = params.toString();

    navigate(query ? `/community?${query}` : "/community");
  }, [navigate, searchParams]);

  const handlePostCreated = useCallback((post) => {
    const feedPost = {
      kind: "post",
      id: post.id,
      text: post.text,
      createdAt: post.createdAt,
      updatedAt: post.updatedAt,
      user: post.author,
      book: post.book,
      repliesCount: post._count?.replies ?? 0,
      isOwnPost: true,
    };

    setActivities((current) => [feedPost, ...current]);
  }, []);
  const handleThreadCountChange = useCallback((targetId, count) => {
    setActivities((current) =>
      current.map((item) => {
        if (item.id !== targetId) {
          return item;
        }

        if (item.kind === "post") {
          return { ...item, repliesCount: count };
        }

        if (item.kind === "activity") {
          return { ...item, commentsCount: count };
        }

        return item;
      }),
    );
  }, []);

  const handleOpenAchievement = useCallback(
    (activity) => {
      activity.isOwnActivity
        ? navigate("/achievements")
        : navigate(`/users/${activity.user?.id}/achievements`);
    },
    [navigate],
  );

  const handleOpenMenu = useCallback(async (activity) => {
    setMenuActivity(activity);

    if (!activity.isOwnActivity && activity.user?.id) {
      try {
        const data = await apiFetch(
          `/api/users/${activity.user.id}/social-preferences`,
        );

        setNotifyActivity(Boolean(data?.notifyActivity));
      } catch (error) {
        console.error("Load social preference error:", error);
        setNotifyActivity(false);
      }
    }
  }, []);
  const handleKudos = useCallback(async (activity) => {
    if (!activity?.id || activity.isOwnActivity || activity.isOwnPost) {
      return;
    }

    const nextHasKudos = !activity.hasKudos;

    const kudosUrl =
      activity.kind === "post"
        ? `/api/social/posts/${activity.id}/kudos`
        : `/api/social/activities/${activity.id}/kudos`;

    try {
      const data = await apiFetch(kudosUrl, {
        method: nextHasKudos ? "POST" : "DELETE",
      });

      setActivities((current) =>
        current.map((item) =>
          item.id === activity.id
            ? {
                ...item,
                hasKudos: Boolean(data?.hasKudos),
                kudosCount: Number(data?.kudosCount) || 0,
              }
            : item,
        ),
      );
    } catch (error) {
      console.error("Update feed kudos error:", error);
    }
  }, []);
  const handleEditPost = useCallback(async (post, text) => {
    if (!post?.id || !post.isOwnPost) {
      return;
    }

    try {
      const updatedPost = await apiFetch(`/api/social/posts/${post.id}`, {
        method: "PATCH",
        body: {
          text,
          bookId: post.book?.id ?? null,
        },
      });

      setActivities((current) =>
        current.map((item) =>
          item.id === post.id
            ? {
                ...item,
                text: updatedPost.text,
                book: updatedPost.book,
                updatedAt: updatedPost.updatedAt,
              }
            : item,
        ),
      );

      return updatedPost;
    } catch (error) {
      console.error("Update social post error:", error);
      throw error;
    }
  }, []);
  const handleDeletePost = useCallback((post) => {
    if (!post?.id || !post.isOwnPost) {
      return;
    }

    setPostToDelete(post);
  }, []);

  const handleConfirmDeletePost = useCallback(async () => {
    if (!postToDelete?.id) {
      return;
    }

    try {
      setIsDeletingPost(true);

      await apiFetch(`/api/social/posts/${postToDelete.id}`, {
        method: "DELETE",
      });

      setActivities((current) =>
        current.filter((item) => item.id !== postToDelete.id),
      );

      setPostToDelete(null);
    } catch (error) {
      console.error("Delete social post error:", error);
    } finally {
      setIsDeletingPost(false);
    }
  }, [postToDelete]);
  const handleToggleNotifications = async () => {
    const userId = menuActivity?.user?.id;

    if (!userId || menuActivity?.isOwnActivity) {
      return;
    }

    const nextValue = !notifyActivity;

    try {
      setIsUpdatingNotifications(true);

      const data = await apiFetch(`/api/users/${userId}/social-preferences`, {
        method: "PATCH",
        body: {
          notifyActivity: nextValue,
        },
      });

      setNotifyActivity(Boolean(data?.notifyActivity));
    } catch (error) {
      console.error("Update social preference error:", error);
    } finally {
      setIsUpdatingNotifications(false);
    }
  };
  const handleUnfollow = async () => {
    const userId = menuActivity?.user?.id;

    if (!userId || menuActivity?.isOwnActivity) {
      return;
    }

    try {
      setIsUnfollowing(true);

      await apiFetch(`/api/users/${userId}/follow`, {
        method: "DELETE",
      });

      if (scope === "following") {
        setActivities((current) =>
          current.filter((activity) => activity.user?.id !== userId),
        );
      }

      setMenuActivity(null);
    } catch (error) {
      console.error("Unfollow from feed error:", error);
    } finally {
      setIsUnfollowing(false);
    }
  };

  const handleOpenProfileFromMenu = () => {
    const userId = menuActivity?.user?.id;

    setMenuActivity(null);

    if (userId) {
      navigate(`/users/${userId}`);
    }
  };
  const handleShare = useCallback(async (activity) => {
    const userName = activity.user?.name || "Користувач";

    let text;

    switch (activity.type) {
      case "READING_STARTED":
        text = `${userName} почав читати книгу «${activity.book?.title || "Книга"}»`;
        break;

      case "BOOK_FINISHED":
        text = `${userName} прочитав книгу «${activity.book?.title || "Книга"}»`;
        break;

      case "RATING_ADDED":
        text = `${userName} оцінив книгу «${activity.book?.title || "Книга"}» на ${activity.rating ?? 0}/5`;
        break;

      case "ACHIEVEMENT_UNLOCKED":
        text = `${userName} отримав досягнення «${activity.achievement?.title || "Досягнення"}»`;
        break;

      default:
        text = `${userName} поділився новою активністю`;
    }

    try {
      if (navigator.share) {
        await navigator.share({
          title: "Бібліотека",
          text,
          url: window.location.origin,
        });

        return;
      }

      await navigator.clipboard.writeText(
        `${text} — ${window.location.origin}`,
      );
    } catch (error) {
      if (error?.name !== "AbortError") {
        console.error("Share activity error:", error);
      }
    }
  }, []);

  const filteredActivities =
    contentFilter === "posts"
      ? activities.filter((item) => item.kind === "post")
      : contentFilter === "activity"
        ? activities.filter((item) => item.kind === "activity")
        : activities;

  const displayedActivities =
    limit === null
      ? filteredActivities
      : filteredActivities.slice(0, limit);

  return (
    <section className="social-feed">
      {showHeader && (
        <div className="social-feed__header">
          <h2>Активність читачів</h2>

          {showViewAll && activities.length > displayedActivities.length && (
            <button
              type="button"
              className="social-feed__view-all"
              onClick={() => {
                navigate("/community");

                requestAnimationFrame(() => {
                  window.scrollTo({
                    top: 0,
                    left: 0,
                    behavior: "instant",
                  });
                });
              }}
            >
              Уся активність
              <Icon name="chevron-right" />
            </button>
          )}
        </div>
      )}
      {showComposer && (
        <SocialPostComposer onPostCreated={handlePostCreated} />
      )}

      {isLoading ? (
        <div className="social-feed__state">Завантажуємо активність...</div>
      ) : displayedActivities.length === 0 ? (
        <div className="social-feed__state">
          {userId && contentFilter === "posts" ? (
            <>
              <strong>У вас ще немає дописів</strong>
              <span>
                Поділіться думками про книгу або розкажіть, що читаєте.
              </span>
              <button
                type="button"
                className="social-feed__state-action"
                onClick={() => navigate("/community")}
              >
                Створити допис
              </button>
            </>
          ) : userId && contentFilter === "activity" ? (
            <>
              <strong>Тут поки немає читацької активності</strong>
              <span>
                Почніть читати, завершіть книгу або поставте оцінку — ваша
                активність з'явиться тут.
              </span>
            </>
          ) : scope === "following" ? (
            "Тут поки порожньо. Підпишіться на читачів, щоб бачити їхню активність."
          ) : (
            "У спільноті поки немає активності. Створіть перший допис."
          )}
        </div>
      ) : (
      <div className="social-feed__list">
        {displayedActivities.map((item) => {
          const formattedTime = activityDateFormatter.format(
            new Date(item.createdAt),
          );

          if (item.kind === "post") {
            return (
              <SocialPostCard
                key={`post-${item.id}`}
                post={item}
                formattedTime={formattedTime}
                onOpenProfile={handleOpenProfile}
                onOpenThread={handleOpenThread}
                onOpenBook={handleOpenBook}
                onKudos={handleKudos}
                onOpenKudosUsers={setKudosUsersItem}
                onDelete={handleDeletePost}
                onEdit={handleEditPost}
              />
            );
          }

          return (
            <SocialFeedCard
              key={`activity-${item.id}`}
              activity={item}
              formattedTime={formattedTime}
              onOpenProfile={handleOpenProfile}
              onOpenMenu={handleOpenMenu}
              onOpenBook={handleOpenBook}
              onOpenAchievement={handleOpenAchievement}
              onKudos={handleKudos}
              onOpenKudosUsers={setKudosUsersItem}
              onComment={handleOpenActivityThread}
              onShare={handleShare}
            />
          );
        })}
      </div>
      )}

      {!isLoading && limit === null && hasMore && (
        <LoadMoreButton
          onClick={handleLoadMore}
          isLoading={isLoadingMore}
        />
      )}

      <ScrollToTopButton />

      <SocialPostThreadModal
        postId={linkedPostId}
        activityId={linkedThreadActivityId}
        onClose={handleCloseThread}
        onOpenProfile={handleOpenProfile}
        onOpenKudosUsers={setKudosUsersItem}
        onThreadCountChange={handleThreadCountChange}
      />
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
      <KudosUsersModal
        item={kudosUsersItem}
        onClose={() => setKudosUsersItem(null)}
        onOpenProfile={handleOpenProfile}
      />

      <ConfirmDeleteModal
        isOpen={Boolean(postToDelete)}
        title="Видалити допис?"
        description="Цю дію неможливо скасувати."
        confirmText="Видалити"
        isLoading={isDeletingPost}
        onCancel={() => setPostToDelete(null)}
        onConfirm={handleConfirmDeletePost}
      />
      <SocialFeedMenu
        activity={menuActivity}
        isUnfollowing={isUnfollowing}
        isUpdatingNotifications={isUpdatingNotifications}
        notifyActivity={notifyActivity}
        onClose={() => setMenuActivity(null)}
        onOpenProfile={handleOpenProfileFromMenu}
        onToggleNotifications={handleToggleNotifications}
        onUnfollow={handleUnfollow}
      />{" "}
    </section>
  );
};

export default SocialFeed;
