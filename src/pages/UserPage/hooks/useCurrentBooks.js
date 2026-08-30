import { useEffect, useState } from "react";

const API_URL = "https://library-backend-production-5d60.up.railway.app";

const useCurrentBooks = ({ readingBookId, onBooksChange }) => {
  const [currentBooks, setCurrentBooks] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const loadCurrentBooks = async () => {
      const token = localStorage.getItem("token");

      if (!token) {
        setCurrentBooks([]);
        setIsLoading(false);
        setError("");
        onBooksChange?.(0);

        return;
      }

      try {
        setIsLoading(true);
        setError("");

        const response = await fetch(`${API_URL}/api/user-books/current`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (!response.ok) {
          throw new Error("Failed to load current reading");
        }

        const data = await response.json();

        const books = Array.isArray(data.books) ? data.books : [];

        setCurrentBooks(books);
        onBooksChange?.(books.length);
      } catch (loadError) {
        console.error("Load current reading error:", loadError);

        setCurrentBooks([]);
        setError("Не вдалося завантажити поточне читання");

        onBooksChange?.(0);
      } finally {
        setIsLoading(false);
      }
    };

    loadCurrentBooks();
  }, [readingBookId, onBooksChange]);

  return {
    currentBooks,
    isLoading,
    error,
  };
};

export default useCurrentBooks;
