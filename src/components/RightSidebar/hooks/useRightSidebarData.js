import { useEffect, useState } from "react";

import { useLibrary } from "../../../context/LibraryContext.jsx";

import { apiFetch, hasToken } from "../../../utils/apiClient.js";

const useRightSidebarData = () => {
  const { activeLibraryId } = useLibrary();

  const [currentBooks, setCurrentBooks] = useState([]);

  const [wishlistCount, setWishlistCount] = useState(0);

  const [finishedCount, setFinishedCount] = useState(0);

  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadSidebarData = async () => {
      if (!hasToken()) {
        setCurrentBooks([]);

        setWishlistCount(0);

        setFinishedCount(0);

        setIsLoading(false);

        return;
      }

      try {
        setIsLoading(true);

        const query = activeLibraryId
          ? `?libraryId=${encodeURIComponent(activeLibraryId)}`
          : "";

        const finishedParams = new URLSearchParams();

        finishedParams.set("page", "1");

        finishedParams.set("limit", "1");

        if (activeLibraryId) {
          finishedParams.set("libraryId", activeLibraryId);
        }

        const [currentData, wishlistData, finishedData] = await Promise.all([
          apiFetch(`/api/user-books/current${query}`),

          apiFetch(`/api/user-books/wishlist${query}`),

          apiFetch(`/api/user-books/finished?${finishedParams.toString()}`),
        ]);

        setCurrentBooks(
          Array.isArray(currentData?.books) ? currentData.books : [],
        );

        setWishlistCount(Number(wishlistData?.count) || 0);

        setFinishedCount(
          Number(finishedData?.total) || Number(finishedData?.count) || 0,
        );
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
  }, [activeLibraryId]);

  return {
    currentBooks,
    wishlistCount,
    finishedCount,
    isLoading,
  };
};

export default useRightSidebarData;
