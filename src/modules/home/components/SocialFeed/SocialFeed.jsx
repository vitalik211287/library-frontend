import { useCallback, useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";

import { apiFetch } from "../../../../shared/api/apiClient.js";
import { socket } from "../../../../shared/realtime/socket.js";
import Icon from "../../../../shared/components/Icon/Icon.jsx";
import ConfirmDeleteModal from "../../../../shared/components/ConfirmDeleteModal/ConfirmDeleteModal.jsx";


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

const SocialFeed = ({ limit = null, showViewAll = false }) => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const linkedActivityId = searchParams.get("activityId");
  const linkedPostId = searchParams.get("postId");

  const [activities, setActivities] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
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

        const data = await apiFetch("/api/social/feed");

        if (isActive) {
          setActivities(Array.isArray(data?.activities) ? data.activities : []);
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
  }, []);

  useEffect(() => {
    const handlePostKudosUpdated = ({ postId, kudosCount }) => {
      setActivities((current) =>
        current.map((item) =>
          item.id === postId ? { ...item, kudosCount } : item,
        ),
      );
    };

    socket.on("post:kudos-updated", handlePostKudosUpdated);
    socket.connect();

    return () => {
      socket.off("post:kudos-updated", handlePostKudosUpdated);
      socket.disconnect();
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

  const handleCloseThread = useCallback(() => {
    const params = new URLSearchParams(searchParams);
    params.delete("postId");

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
  const handleReplyCreated = useCallback((postId) => {
    setActivities((current) =>
      current.map((item) =>
        item.kind === "post" && item.id === postId
          ? {
              ...item,
              repliesCount: (item.repliesCount ?? 0) + 1,
            }
          : item,
      ),
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

      setActivities((current) =>
        current.filter((activity) => activity.user?.id !== userId),
      );

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

  if (isLoading) {
    return (
      <section className="social-feed">
        <div className="social-feed__state">Завантажуємо активність...</div>
      </section>
    );
  }

  const displayedActivities =
    limit === null ? activities : activities.slice(0, limit);

  return (
    <section className="social-feed">
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
      <SocialPostComposer onPostCreated={handlePostCreated} />
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
              onShare={handleShare}
            />
          );
        })}
      </div>
      <SocialPostThreadModal
        postId={linkedPostId}
        onClose={handleCloseThread}
        onOpenProfile={handleOpenProfile}
        onReplyCreated={handleReplyCreated}
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
