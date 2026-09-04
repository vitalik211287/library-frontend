import { useMemo } from "react";

import { useUserBooks } from "../../../context/UserBooksContext.jsx";

const useRightSidebarData = () => {
  const {
    currentBooks,
    wishlistBooks,
    finishedTotal,

    isCurrentBooksLoading,
    isWishlistLoading,
    isFinishedBooksLoading,
  } = useUserBooks();

  const wishlistCount = wishlistBooks.length;

  const finishedCount = finishedTotal;

  const isLoading =
    isCurrentBooksLoading || isWishlistLoading || isFinishedBooksLoading;

  return useMemo(
    () => ({
      currentBooks,
      wishlistCount,
      finishedCount,
      isLoading,
    }),
    [currentBooks, wishlistCount, finishedCount, isLoading],
  );
};

export default useRightSidebarData;
