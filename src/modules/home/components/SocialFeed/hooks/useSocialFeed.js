import { useCallback, useEffect, useRef, useState } from "react";

import { apiFetch } from "../../../../../shared/api/apiClient.js";

const FEED_PAGE_SIZE = 20;

const buildFeedUrl = (scope, userId, page) => {
  const params = new URLSearchParams({
    scope,
    page: String(page),
    limit: String(FEED_PAGE_SIZE),
  });

  if (userId) {
    params.set("userId", userId);
  }

  return `/api/social/feed?${params.toString()}`;
};

const useSocialFeed = ({ scope, userId }) => {
  const [activities, setActivities] = useState([]);
  const feedVersionRef = useRef(0);
  const loadingMoreRef = useRef(false);
  const currentFeedKeyRef = useRef("");
  const [isLoading, setIsLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  const [isLoadingMore, setIsLoadingMore] = useState(false);

  const feedKey = JSON.stringify([scope, userId]);

  useEffect(() => {
    currentFeedKeyRef.current = feedKey;
  }, [feedKey]);

  useEffect(() => {
    let isActive = true;
    feedVersionRef.current += 1;

    const loadFeed = async () => {
      try {
        setIsLoading(true);

        const data = await apiFetch(buildFeedUrl(scope, userId, 1));

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
      feedVersionRef.current += 1;
    };
  }, [scope, userId]);


  const handleLoadMore = useCallback(async () => {
    if (
      currentFeedKeyRef.current !== feedKey ||
      loadingMoreRef.current ||
      isLoadingMore ||
      !hasMore ||
      isLoading
    ) {
      return;
    }

    loadingMoreRef.current = true;

    const nextPage = page + 1;
    const feedVersion = feedVersionRef.current;

    try {
      setIsLoadingMore(true);

      const data = await apiFetch(buildFeedUrl(scope, userId, nextPage));

      const nextActivities = Array.isArray(data?.activities)
        ? data.activities
        : [];

      if (feedVersion !== feedVersionRef.current) {
        return;
      }

      setActivities((current) => [...current, ...nextActivities]);
      setPage(nextPage);
      setHasMore(Boolean(data?.hasMore));
    } catch (error) {
      if (feedVersion === feedVersionRef.current) {
        console.error("Load more social feed error:", error);
      }
    } finally {
      if (feedVersion === feedVersionRef.current) {
        loadingMoreRef.current = false;
        setIsLoadingMore(false);
      }
    }
  }, [hasMore, isLoadingMore, isLoading, page, scope, userId, feedKey]);


  return {
    activities,
    setActivities,
    isLoading,
    isLoadingMore,
    hasMore,
    handleLoadMore,
  };
};

export default useSocialFeed;
