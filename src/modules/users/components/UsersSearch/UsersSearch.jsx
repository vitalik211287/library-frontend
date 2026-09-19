import Icon from "../../../../shared/components/Icon/Icon.jsx";
import "./UsersSearch.css";

const UsersSearch = ({ query, onQueryChange }) => {
  return (
    <div className="users-search">
      <Icon name="search" />

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
