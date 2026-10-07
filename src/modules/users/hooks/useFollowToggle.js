import { useState } from "react";
import { apiFetch } from "../../../shared/api/apiClient.js";

const useFollowToggle = () => {
  const [updatingUserId, setUpdatingUserId] = useState(null);

  const toggleFollow = async (user) => {
    if (updatingUserId || user?.isCurrentUser) {
      return null;
    }

    const nextIsFollowing = !user.isFollowing;

    try {
      setUpdatingUserId(user.id);

      await apiFetch(`/api/users/${user.id}/follow`, {
        method: nextIsFollowing ? "POST" : "DELETE",
      });

      return nextIsFollowing;
    } catch (requestError) {
      console.error("Update follow state error:", requestError);
      return null;
    } finally {
      setUpdatingUserId(null);
    }
  };

  return {
    updatingUserId,
    toggleFollow,
  };
};

export default useFollowToggle;
