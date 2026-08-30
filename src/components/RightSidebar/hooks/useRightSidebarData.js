import { useEffect, useState } from "react";

import { apiFetch, hasToken } from "../../../utils/apiClient.js";

const useRightSidebarData = () => {
  const [currentBooks, setCurrentBooks] = useState([]);

  const [wishlistCount, setWishlistCount] = useState(0);

  const [finishedCount, setFinishedCount] = useState(0);

  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadSidebarData = async () => {
      if (!hasToken()) {
        setIsLoading(false);

        return;
      }

      try {
        setIsLoading(true);

        const [currentData, wishlistData, finishedData] = await Promise.all([
          apiFetch("/api/user-books/current"),

          apiFetch("/api/user-books/wishlist"),

          apiFetch("/api/user-books/finished"),
        ]);

        setCurrentBooks(
          Array.isArray(currentData?.books) ? currentData.books : [],
        );

        setWishlistCount(Number(wishlistData?.count) || 0);

        setFinishedCount(Number(finishedData?.count) || 0);
      } catch (loadError) {
        console.error("Right sidebar load error:", loadError);

        setCurrentBooks([]);
        setWishlistCount(0);
        setFinishedCount(0);
      } finally {
        setIsLoading(false);
      }
    };

    loadSidebarData();
  }, []);

  return {
    currentBooks,
    wishlistCount,
    finishedCount,
    isLoading,
  };
};

export default useRightSidebarData;
