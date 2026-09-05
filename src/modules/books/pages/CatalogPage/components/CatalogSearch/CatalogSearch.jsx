import "./CatalogSearch.css";

const CatalogSearch = ({
  search,
  searchBy,
  searchInputRef,
  onSearchChange,
  onSearchByChange,
  onOpenScanner,
}) => {
  return (
    <div className="catalog-search">
      <div className="catalog-search__field">
        <div className="catalog-search__input">
          <input
            ref={searchInputRef}
            type="text"
            placeholder="Пошук..."
            value={search}
            autoFocus
            onChange={(event) => onSearchChange(event.target.value)}
          />

          <svg viewBox="0 0 24 24" aria-hidden="true">
            <circle cx="11" cy="11" r="7" />

            <path d="M20 20L16.5 16.5" />
          </svg>
        </div>

        <button
          type="button"
          className="catalog-scan__button"
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
      </div>

      <select
        value={searchBy}
        onChange={(event) => onSearchByChange(event.target.value)}
      >
        <option value="title">За назвою</option>

        <option value="author">За автором</option>

        <option value="year">За роком</option>

        <option value="genre">За жанром</option>

        <option value="isbn">За ISBN</option>
      </select>
    </div>
  );
};

export default CatalogSearch;

