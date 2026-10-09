import { useEffect, useState } from "react";

import { apiFetch } from "../../../../../../../../shared/api/apiClient.js";

const SEARCH_DELAY = 300;

const SocialBookSearch = ({ onSelect }) => {
  const [query, setQuery] = useState("");
  const [books, setBooks] = useState([]);
  const [isSearching, setIsSearching] = useState(false);

  useEffect(() => {
    const normalizedQuery = query.trim();

    if (normalizedQuery.length < 2) {
      return;
    }

    const controller = new AbortController();

    const timer = setTimeout(async () => {
      try {
        setIsSearching(true);

        const result = await apiFetch(
          `/api/books?q=${encodeURIComponent(normalizedQuery)}`,
          { signal: controller.signal },
        );

        if (!controller.signal.aborted) {
          setBooks(Array.isArray(result) ? result : []);
        }
      } catch (error) {
        if (error?.name !== "AbortError" && !controller.signal.aborted) {
          console.error("Failed to search books:", error);
          setBooks([]);
        }
      } finally {
        if (!controller.signal.aborted) {
          setIsSearching(false);
        }
      }
    }, SEARCH_DELAY);

    return () => {
      clearTimeout(timer);
      controller.abort();
    };
  }, [query]);

  return (
    <div className="social-book-search">
      <input
        type="search"
        value={query}
        onChange={(event) => {
          setQuery(event.target.value);
          setBooks([]);
          setIsSearching(event.target.value.trim().length >= 2);
        }}
        placeholder={"\u041f\u043e\u0448\u0443\u043a \u0437\u0430 \u043d\u0430\u0437\u0432\u043e\u044e \u0430\u0431\u043e \u0430\u0432\u0442\u043e\u0440\u043e\u043c"}
        autoFocus
      />

      {isSearching && (
        <p className="social-book-search__status">{"\u0428\u0443\u043a\u0430\u0454\u043c\u043e\u2026"}</p>
      )}

      {!isSearching && query.trim().length >= 2 && books.length === 0 && (
        <p className="social-book-search__status">{"\u041a\u043d\u0438\u0433 \u043d\u0435 \u0437\u043d\u0430\u0439\u0434\u0435\u043d\u043e"}</p>
      )}

      {books.length > 0 && (
        <div className="social-book-search__results">
          {books.map((book) => (
            <button
              key={book.id}
              type="button"
              className="social-book-search__result"
              onClick={() => onSelect(book)}
            >
              {book.coverUrl ? (
                <img src={book.coverUrl} alt="" />
              ) : (
                <span className="social-book-search__cover-placeholder">
                  BOOK
                </span>
              )}

              <span className="social-book-search__meta">
                <strong>{book.title}</strong>
                <span>{book.author}</span>
              </span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default SocialBookSearch;
