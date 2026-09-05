import { useEffect, useState } from "react";

import { apiFetch } from "../../../shared/api/apiClient.js";

const useUserSearch = (query) => {
  const [users, setUsers] = useState([]);

  const [isLoading, setIsLoading] = useState(false);

  const [error, setError] = useState(null);

  const normalizedQuery = query.trim();

  useEffect(() => {
    if (normalizedQuery.length < 2) {
      setUsers([]);
      setError(null);
      setIsLoading(false);

      return undefined;
    }

    const timeoutId = window.setTimeout(async () => {
      try {
        setIsLoading(true);
        setError(null);

        const data = await apiFetch(
          `/api/users/search?q=${encodeURIComponent(normalizedQuery)}`,
        );

        setUsers(Array.isArray(data?.users) ? data.users : []);
      } catch (requestError) {
        console.error("Search users error:", requestError);

        setError(requestError);

        setUsers([]);
      } finally {
        setIsLoading(false);
      }
    }, 350);

    return () => {
      window.clearTimeout(timeoutId);
    };
  }, [normalizedQuery]);

  const updateUserFollowing = (userId, isFollowing) => {
    setUsers((currentUsers) =>
      currentUsers.map((user) => {
        if (user.id !== userId) {
          return user;
        }

        return {
          ...user,

          isFollowing,

          followersCount: Math.max(
            0,
            user.followersCount + (isFollowing ? 1 : -1),
          ),
        };
      }),
    );
  };

  return {
    users,
    isLoading,
    error,
    updateUserFollowing,
  };
};

export default useUserSearch;

