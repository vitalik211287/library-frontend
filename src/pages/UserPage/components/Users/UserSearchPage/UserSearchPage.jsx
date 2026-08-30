import { useState } from "react";
import { useNavigate } from "react-router-dom";

import UsersSearch from "../UsersSearch/UsersSearch.jsx";
import UsersResults from "../UsersResults/UsersResults.jsx";

import useUserSearch from "../../../hooks/useUserSearch.js";

import "./UserSearchPage.css";

const BackIcon = () => (
  <svg viewBox="0 0 24 24" aria-hidden="true">
    <path d="m15 18-6-6 6-6" />
  </svg>
);

const UserSearchPage = () => {
  const navigate = useNavigate();

  const [query, setQuery] = useState("");

  const { users, isLoading, error, updateUserFollowing } = useUserSearch(query);

  return (
    <main className="users-page">
      <div className="users-page__header">
        <button
          type="button"
          className="users-page__back"
          onClick={() => navigate(-1)}
          aria-label="Назад"
        >
          <BackIcon />
        </button>

        <div>
          <h1>Знайти читачів</h1>

          <p>Знайдіть друзів серед користувачів бібліотеки</p>
        </div>
      </div>

      <UsersSearch query={query} onQueryChange={setQuery} />

      <div className="users-page__results">
        <UsersResults
          query={query}
          users={users}
          isLoading={isLoading}
          error={error}
          onFollowingChange={updateUserFollowing}
        />
      </div>
    </main>
  );
};

export default UserSearchPage;
