import "./IsbnSearch.css";

const IsbnSearch = ({
  isbn,
  isSearching,
  isbnInputRef,
  onIsbnChange,
  onSubmit,
  onOpenScanner,
}) => {
  return (
    <form className="isbn-search" onSubmit={onSubmit}>
      <div className="isbn-search__field">
        <input
          ref={isbnInputRef}
          type="text"
          inputMode="numeric"
          autoComplete="off"
          autoFocus
          placeholder="Введіть ISBN"
          value={isbn}
          onChange={onIsbnChange}
        />

        <button
          type="submit"
          className="isbn-search__button"
          disabled={isSearching}
          aria-label="Знайти книгу"
          title="Знайти книгу"
        >
          {isSearching ? (
            "…"
          ) : (
            <svg viewBox="0 0 24 24" width="22" height="22" aria-hidden="true">
              <path
                d="M21 21l-4.35-4.35m2.35-5.65a8 8 0 1 1-16 0 8 8 0 0 1 16 0Z"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
              />
            </svg>
          )}
        </button>
      </div>

      <button
        type="button"
        className="isbn-scan__button"
        onClick={onOpenScanner}
        aria-label="Сканувати ISBN"
        title="Сканувати ISBN"
      >
        <svg viewBox="0 0 24 24" width="24" height="24" aria-hidden="true">
          <path
            d="M4 7V5a1 1 0 0 1 1-1h2M17 4h2a1 1 0 0 1 1 1v2M20 17v2a1 1 0 0 1-1 1h-2M7 20H5a1 1 0 0 1-1-1v-2"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
          />

          <rect
            x="7"
            y="8"
            width="10"
            height="8"
            rx="1"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          />

          <path
            d="M9 10v4M11 10v4M13 10v4M15 10v4"
            stroke="currentColor"
            strokeWidth="1.5"
          />
        </svg>
      </button>
    </form>
  );
};

export default IsbnSearch;

