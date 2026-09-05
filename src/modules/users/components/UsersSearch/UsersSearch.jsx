import "./UsersSearch.css";

const SearchIcon = () => (
  <svg viewBox="0 0 24 24" aria-hidden="true">
    <circle cx="11" cy="11" r="7" />
    <path d="m20 20-4-4" />
  </svg>
);

const UsersSearch = ({ query, onQueryChange }) => {
  return (
    <div className="users-search">
      <SearchIcon />

      <input
        type="search"
        value={query}
        onChange={(event) => onQueryChange(event.target.value)}
        placeholder="Пошук читача за ім’ям"
        autoComplete="off"
        aria-label="Пошук користувачів"
      />

      {query && (
        <button
          type="button"
          className="users-search__clear"
          onClick={() => onQueryChange("")}
          aria-label="Очистити пошук"
        >
          ×
        </button>
      )}
    </div>
  );
};

export default UsersSearch;

