import { useEffect, useState } from "react";

const API_URL = "https://library-backend-production-5d60.up.railway.app";

const useWishlist = ({ onCountChange }) => {
  const [books, setBooks] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const loadWishlist = async () => {
      const token = localStorage.getItem("token");

      if (!token) {
        setBooks([]);
        setIsLoading(false);
        setError("");
        onCountChange?.(0);

        return;
      }

      try {
        setIsLoading(true);
        setError("");

        const response = await fetch(`${API_URL}/api/user-books/wishlist`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (!response.ok) {
          throw new Error("Failed to load wishlist");
        }

        const data = await response.json();

        const items = Array.isArray(data.books) ? data.books : [];

        setBooks(items);

        onCountChange?.(Number(data.count) || items.length);
      } catch (loadError) {
        console.error("Load wishlist error:", loadError);

        setBooks([]);
        setError("Не вдалося завантажити список");

        onCountChange?.(0);
      } finally {
        setIsLoading(false);
      }
    };

    loadWishlist();
  }, [onCountChange]);

  const removeFromWishlist = async (bookId) => {
    const token = localStorage.getItem("token");

    if (!token || !bookId) {
      return;
    }

    try {
      const response = await fetch(
        `${API_URL}/api/user-books/${bookId}/wishlist`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      if (!response.ok) {
        throw new Error("Failed to remove book from wishlist");
      }

      setBooks((currentBooks) => {
        const nextBooks = currentBooks.filter(({ book }) => book.id !== bookId);

        onCountChange?.(nextBooks.length);

        return nextBooks;
      });
    } catch (removeError) {
      console.error("Remove wishlist error:", removeError);
    }
  };

  return {
    books,
    isLoading,
    error,
    removeFromWishlist,
  };
};

export default useWishlist;
